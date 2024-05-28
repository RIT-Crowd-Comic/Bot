const {ApplicationCommandOptionType} = require('discord.js');
const {parseMessage, addMessages, saveNumberMessages} = require("../../utils/rememberMessages");
const {defaultExcludeBotMessages} = require('../../../config.json');

const getMessagesAndReturnId = async(messagesToSave, channel, num, excludeBotMessages, startId) =>{
    let messageObjArray;
    if(startId){
         //get the first 100 messages at a specifc point
         messageObjArray = await saveNumberMessages(channel, num, startId)
    }
    else{
        //get the num messages starting with the latest one
        messageObjArray = await saveNumberMessages(channel, num)
    }

    if (!messageObjArray) {
        return;
    };

    //sort the message in ascending order of timestamp
    messageObjArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    //go through the entire array and save messages, maybe excluding bot
    //m is a kvp [1] is the actual data
    for (const m of messageObjArray) {
        startId = m[1].id;

        // exlude bot messages if option is enabled
        if (excludeBotMessages && m[1].author.bot) {
            continue;
        }

        const message = parseMessage(m[1])
        messagesToSave.push(message)
    }

    return startId;
}

//remembers a message based on a message id parameter
module.exports = {
    name: 'remember-count',
    description: 'Saves the last x messages from the current channel. Has an option to save from a specific channel.',
    options:  [
        {
            name: 'number-of-messages',
            description: 'The number of messages to save. Max 1000.',
            required: true,
            type: ApplicationCommandOptionType.Number,
        },
        {
            name: 'channel-id',
            description: 'Id of the channel to search.',
            type: ApplicationCommandOptionType.String,
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
            const value = interaction.options.get('number-of-messages').value;
            const numberOfMessages = value > 1000 ? 1000 : value;

            const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages;
            
            const channelId = interaction.options.getString('channel-id') ?? interaction.channel.id;
            
            //get the channel
            const channel = await client.channels.cache.get(channelId);

            let num = numberOfMessages;
            let startId;
            let messagesToSave = [];

            //check if over 100, if so loop to continue grabbing messages
            if(num > 100)
            {
                startId = await getMessagesAndReturnId(messagesToSave, channel, 100, excludeBotMessages)

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
                

                

         messagesToSave.forEach(m => console.log(m))
            addMessages(messagesToSave)            
            
            //show that it saved
            interaction.editReply({
                content:`Remembered the last "${numberOfMessages} messages"`,
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
