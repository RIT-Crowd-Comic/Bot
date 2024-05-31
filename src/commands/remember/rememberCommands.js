const { SlashCommandBuilder, PermissionFlagsBits, ActivityType, ChannelType } = require('discord.js');
const { addMessage, addMessages, parseMessage, getRememberedMessages, clearRememberedMessages, rememberRangeGrab} = require('../../utils/rememberMessages');
const { getMessageObject, getNumberMessages, getChannelObject } = require('../../utils/apiCalls');
const fs = require('fs');
const { defaultExcludeBotMessages, ephemeral } = require('../../../config.json');
const { clamp } = require(`../../utils/mathUtils`);
const ms = require('ms'); //converts time to ms

//global scope
let rememberMessageObj = undefined;

//remembers a message based on a message id parameter
module.exports = {
    data: new SlashCommandBuilder()
        .setName('remember')
        .setDescription('Stores messages in a variety of ways')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory)

        //remember message
        .addSubcommand(subcommand =>
            subcommand.setName('message')
                .setDescription('Stores a message from the current channel based on its message-id')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('The id of the message')
                        .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText)
                )
        )

        //remember past
        .addSubcommand(subcommand =>
            subcommand.setName('past')
                .setDescription('Saves messages from past set amount of "hours" and "minutes" in the current channel.')
                .addNumberOption(option =>
                    option.setName('hours')
                        .setDescription('The number of hours to save. Max 5.')
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option.setName('minutes')
                        .setDescription('The number of minutes to save to save. Max 59.')
                        .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText)
                )
                .addNumberOption(option =>
                    option.setName('speed')
                        .setDescription('Speed of the Search. Lower value is more accurate but slower. Range 25-100 inclusive')
                )
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.rememberPast}`)
                )
        )

        //remember recall
        .addSubcommand(subcommand =>
            subcommand.setName('recall')
                .setDescription('Creates a JSON of all the saved message')
        )

        //remember clear
        .addSubcommand(subcommand =>
            subcommand.setName('clear-messages')
                .setDescription('Clear all messages currently saved in remembrance')
        )

        //remember number
        .addSubcommand(subcommand =>
            subcommand.setName('number')
                .setDescription('Saves the last x messages from the current channel. Has an option to save from a specific channel.')
                .addNumberOption(option =>
                    option.setName('number-of-messages')
                        .setDescription('The number of messages to save. Min 1, Max 1000.')
                        .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText)
                )
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.rememberNumber}`)
                )
                
        ) 

        //remember range
        .addSubcommand(subcommand =>
            subcommand.setName('range')
                .setDescription('Remember all messages between two specific messages (inclusively)')
                .addStringOption(option =>
                    option.setName('start-message-id')
                        .setDescription("The first message's id")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('end-message-id')
                        .setDescription("the second message's id")
                        .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText)
                )
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.rememberRangeGrab}`)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('start-remembering')
                .setDescription('Start remembering messages in a specific channels')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText)
                )
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.startRemember}`)
                )
        )

        .addSubcommand(subcommand =>
            subcommand.setName('stop-remembering')
                .setDescription('Stop remembering messages in a specific channels')
        ),


    options:
    {
        devOnly: false,
        testOnly: false,
        deleted: false,
    },


    //logic, 
    async execute(client, interaction) {


        const action = {
            'message'          : () => rememberMessage(interaction),
            'past'             : () => rememberPastMessages(client, interaction),
            'recall'           : () => rememberRecall(interaction),
            'clear-messages'   : () => rememberClear(interaction),
            'number'           : () => rememberNumberMessages(client, interaction),
            'range'            : () => rememberRange(interaction),
            'start-remembering': () => startRemember(client, interaction),
            'stop-remembering' : () => stopRemember(client, interaction)
        };

        try {
            //get the used subcommand
            const subcommand = interaction.options.getSubcommand();

            action[subcommand]();   
        }
        catch (error) {
            await interaction.editReply({
                content: `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};

//Callbacks
//remember message 
const rememberMessage = async (interaction) => {

    await interaction.deferReply(); //defer waits for logic to finish
    //get the id of the message  
    const idMessage = interaction.options.get('message-id').value;
    //channel id
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;


    const msg = await getMessageObject(channel.id, idMessage);

    //parse the message
    const parsedMessage = parseMessage(msg);

    //save the message
    addMessage(parsedMessage);

    await interaction.editReply({
        content: `Remembered: "${msg.content}"`,
        ephemeral: false,
    });
};

//remember past messages
const rememberPastMessages = async (client, interaction) => {
    await interaction.deferReply(); //defer waits for logic to finish

    //get the hours   
    const valueHours = interaction.options.get('hours').value;

    //get the minutes   
    const valueMinutes = interaction.options.get('minutes').value;

    //bot messages
    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.rememberPast;

    //validate accuracy
    const accuracy = clamp(25, 100, interaction.options.getNumber('speed') ?? 50);

    //format and clamp
    const numberOfHours = clamp(0, 5, valueHours).toString() + 'h'; //formatting for ms
    const numberOfMinutes = clamp(0, 59, valueMinutes).toString() + 'm'; //formatting for ms

    const channel = interaction.options.getChannel('channel') ?? interaction.channel;


    //get the current time TIMESTAMP is a ms
    const currentTime = Date.now();

    //get the time in x minutes
    const hours = ms(numberOfHours);
    const minutes = ms(numberOfMinutes);
    console.log(hours);

    //subtract minutes from current time to get the time to loop to
    const pastTime = currentTime - (hours + minutes);

    //call the method to save until the message time < pastTime
    const messagesToSave = await getMessagesByTime(channel, pastTime, excludeBotMessages, accuracy);

    messagesToSave.forEach(m => console.log(m));
    addMessages(messagesToSave);

    //show that it saved
    interaction.editReply({
        content: `Remembered the last "${numberOfHours} hours ${numberOfMinutes} minutes"`,
        ephemeral: false,
    });
};

//remember recall
const rememberRecall = async(interaction) =>{
    await interaction.deferReply(); //defer waits for logic to finish
    const jsonFilePath = './src/rememberedMessages.json';
    const json = JSON.stringify(getRememberedMessages(), null, 2);
    interaction.editReply('Success');

    //send the json
    fs.writeFile(jsonFilePath, json, (err) => err && console.error(err));
    await interaction.channel.send({
        files: [{
            attachment: jsonFilePath,
            name: 'rememberedMessages.json'
        }]
    });
};

//rememeber clear
const rememberClear = async(interaction) =>{
    await interaction.deferReply(); //defer waits for logic to finish
    clearRememberedMessages();
    await interaction.editReply({content: 'Success'});
};

//remember number
const rememberNumberMessages = async(client, interaction) =>{
    await interaction.deferReply(); //defer waits for logic to finish
    //get the id    
    const value = interaction.options.get('number-of-messages').value;
    const numberOfMessages = clamp(1,1000, value);

    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.rememberNumber;
    
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    let num = numberOfMessages;
    let startId;
    let messagesToSave = [];

    //check if over 100, if so loop to continue grabbing messages
    if(num > 100)
    {
        startId = await getMessagesAndReturnId(messagesToSave, channel, 100, excludeBotMessages);

        num -= 100;

        while(num / 100 >= 1)
        {
            startId = await getMessagesAndReturnId(messagesToSave, channel, 100, excludeBotMessages, startId);
            num -= 100;
        }

        if(num > 0)
            startId =  await getMessagesAndReturnId(messagesToSave, channel, num, excludeBotMessages, startId);
    }
    //if <= 100
    else{
        await getMessagesAndReturnId(messagesToSave,channel,num, excludeBotMessages);
    }
        
    messagesToSave.forEach(m => console.log(m));
    addMessages(messagesToSave);            
    
    //show that it saved
    interaction.editReply({
        content:`Remembered the last "${numberOfMessages} messages"`,
        ephemeral: false,
    });
};

const rememberRange = async(interaction)=>{
    const startMessageId = interaction.options.get('start-message-id').value;
    const endMessageId = interaction.options.get('end-message-id').value;
    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.rememberRangeGrab;
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    await interaction.deferReply({ ephemeral: ephemeral.rememberRangeGrab });
    const rememberRangeGrabResponse = await rememberRangeGrab(channel.id, startMessageId, endMessageId, excludeBotMessages);
    if (rememberRangeGrabResponse.status === 'Fail') {
        interaction.editReply({
            content: rememberRangeGrabResponse.description
        });
        return;
    }

    interaction.editReply({
        content: rememberRangeGrabResponse.status
    });   
};

const startRemember = async(client, interaction)=>{
    await interaction.deferReply({ ephemeral: ephemeral.startRemember });
    const rememberingMessage = rememberMessageObj;

    //if already remembering a channel, tell the user to stop remembering to use this command
    if (rememberingMessage) {
        await interaction.editReply({
            content: `Already remembering in <#${rememberMessageObj.id}>. Use "/stop-remembering" to stop remembering.`
        });
        return;
    }

    //start remembering messages from the last message in the channel
    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.startRemember;
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const { last_message_id, name } = await getChannelObject(channel.id);
    const obj = { id: channel.id, last_message_id: last_message_id, name: name, excludeBotMessages: excludeBotMessages, ephemeral: ephemeral.startRemember };
    rememberMessageObj = obj;
    await interaction.editReply({
        content: `Starting to remember messages in <#${channel}>."`
    });

    //change the status of the bot to say which channel it's remembering from
    client.user.setActivity({
        name: `Remembering #${obj.name}`,
        type: ActivityType.Custom
    });
};

const stopRemember = async(client, interaction)=>{
    const obj = rememberMessageObj;
    await interaction.deferReply({ ephemeral: obj?.ephemeral ?? ephemeral.startRemember });
    
    //if a message is not being remembered, send a waring message
    if(!obj) {
        await interaction.editReply({
            content: `No channel is being remembered. Use "start-remembering" to start remember messsages in a channel`
        });
        return;
    }

    // stop the remembering activity
    client.user.setActivity(null);

    //todo:remeber all message in between then and now (refactor rememberRangeGrab)
    const channelObj = await getChannelObject(obj.id);
    const rememberRangeGrabResponse = await rememberRangeGrab(obj.id, obj.last_message_id, channelObj.last_message_id, obj.excludeBotMessages, false);
    if (rememberRangeGrabResponse.status === 'Fail') {
        interaction.editReply({
            content: rememberRangeGrabResponse.description
        });
        return;
    }

    
    await interaction.editReply({
        content: `Success`
    });
    
    //make rememberMessageObj undefined
    rememberMessageObj = undefined;
};

//Helpers
//continues saving messages until their time is lesser than given
//we are going into the past to fetch old messages by their timestamps(ms)
const getMessagesByTime = async (channel, pastTime, excludeBotMessages, chunkSize) => {
    let messages = [];
    let startId;
    let messageTime;
    chunkSize = clamp(0, 100, chunkSize);

    do {
        //if startId use it //chunks of 100 is more efficient
        const message = startId
            ? await getNumberMessages(channel, chunkSize, startId)
            : await getNumberMessages(channel, 1);

        //add the message
        //parse the message
        message.forEach((msg) => {
            startId = msg.id; //save the message id so we can start there next interaction
            messageTime = msg.createdTimestamp; //save timestamp for comparison

            // exclude bot messages if option is enabled
            if (!(excludeBotMessages && msg.author.bot)) {
                const parsedMessage = parseMessage(msg);

                //save the message
                messages.push(parsedMessage);
            }
        });
    } while (messageTime >= pastTime); //loop until the message timestamp is lower/=  than the past time
    return messages;
};

//grabs a number of messages and saves them to an array, while also returning the last id
const getMessagesAndReturnId = async(messagesToSave, channel, num, excludeBotMessages, startId) =>{
    const messageObjArray = [...await getNumberMessages(channel, num, startId)];

    //return if no array, or if there is not enough messages in the server
    if (!messageObjArray || messageObjArray.length == 0) {
        return;
    };
    
    messageObjArray
        .filter(([_, msg]) => !(excludeBotMessages && msg.author.bot))
        .map(([_, msg]) => messagesToSave.push(parseMessage(msg)));
    
    return messageObjArray.at(-1)[1].id;
};
