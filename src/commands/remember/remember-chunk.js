const {ApplicationCommandOptionType} = require('discord.js');
const {defaultExcludeBotMessages} = require('../../../config.json');
const {addMessages, parseMessage} = require(`../../utils/rememberMessages`);
const {getNumberMessages} = require('../../utils/apiCalls');
const ms = require('ms'); //converts time to ms


//continues saving messages until their time is lesser than given
//we are going into the past to fetch old messages by their timestamps(ms)
const getMessagesByTime = async(channel, pastTime, excludeBotMessages, chunkSize) =>{
    let messages = [];
    let startId;
    let messageTime;
    if(chunkSize > 100) chunkSize = 100;

    do{
        //if startId use it //chunks of 100 is more efficient
        if (startId) 
            message = await getNumberMessages(channel,chunkSize,startId);
        else
            message = await getNumberMessages(channel,1);

        //add the message
        //parse the message
        message.forEach((msg) =>{
            startId = msg.id; //save the message id so we can start there next iteraction
            messageTime = msg.createdTimestamp; //save timestamp for comparison
              
            // exlude bot messages if option is enabled
            if (!(excludeBotMessages && msg.author.bot)) {
                const parsedMessage = parseMessage(msg);
    
                //save the message
                messages.push(parsedMessage);
            }
        })
    } while(messageTime >= pastTime); //loop until the message timestamp is lower/=  than the past time
    return messages;
}

//remembers a message based on a message id parameter
module.exports = {
    name: 'remember-chunk-time',
    description: 'Saves messages from past set amount of "minutes" in the current channel.',
    options:  [
        {
            name: 'minutes',
            description: 'The number of minutes to save to save. Max 600.',
            required: true,
            type: ApplicationCommandOptionType.Number,
        },
        {
            name: 'channel-id',
            description: 'Id of the channel to search. This is optional.',
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'speed',
            description: 'Speed of the Search. Lower value is more accurate but slower. Default is 50',
            type: ApplicationCommandOptionType.Number,
        },
        {
            name: 'exclude-bot-messages',
            description: `If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages}`,
            type: ApplicationCommandOptionType.Boolean
        }
    ],

    //logic, 
    callback: async(client, interaction) =>{
        try{
            await interaction.deferReply();

            //get the id    
            const value = interaction.options.get('minutes').value;

            //bot messages
            const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages;

            //validate accuracy
            let accuracy = interaction.options.getNumber("speed") ?? 50;
            if(accuracy < 25) accuracy = 25; 
            if(accuracy > 100) accuracy = 100;

            const numberOfMinutes = (value > 600 ? 600 : value).toString() + 'm'; //formatting for ms
            
            const channelId = interaction.options.getString('channel-id') ?? interaction.channel.id;
            
            //get the channel
            const channel = await client.channels.cache.get(channelId);

            //get the current time TIMESTAMP is a ms
            const currentTime = Date.now();

            //get the time in x minutes
            const minutes = ms(numberOfMinutes);

            //subtract minutes from current time to get the time to loop to
            const pastTime = currentTime - minutes;

            //call the method to save until the message time < pastTime
            const messagesToSave = await getMessagesByTime(channel, pastTime, excludeBotMessages, accuracy);

            messagesToSave.forEach(m => console.log(m))
            addMessages(messagesToSave) 

            //show that it saved
            interaction.editReply({
                content:`Remembered the last "${numberOfMinutes} minutes"`,
                ephemeral: false,
            });
        }
        catch(error){ 
            await interaction.editReply({
                content:`Something went wrong. ${error}`,
                ephemeral: false,
            }); 
        }
    }
};
