const {ApplicationCommandOptionType} = require('discord.js');
const {addMessage, parseMessage} = require("../../utils/rememberMessages");
const {getMessageObject } = require('../../utils/apiCalls');

//remembers a message based on a message id parameter
module.exports = {
    name: 'remember',
    description: 'Stores a message from the current channel based on its message-id',
    options:  [
        {
            name: 'message-id',
            description: 'The id of the message',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'channel-id',
            description: 'The id of the channel to search for the message',
            type: ApplicationCommandOptionType.String,
        },
    ],

    //logic, 
    callback: async(client, interaction) =>{
        
        try{
            await interaction.deferReply(); //defer waits for logic to finish
            
            //get the id of the message  
            const idMessage = interaction.options.get('message-id').value;
            //channel id
            const specificChannelId = interaction.options.getString('channel-id');

            
            const msg = await getMessageObject(specificChannelId || interaction.channel.id, idMessage);

            //parse the message
            const parsedMessage = parseMessage(msg);

            //save the message
            addMessage(parsedMessage);

            await interaction.editReply({
              content:`Remembered: "${msg.content}"`,
              ephemeral: false,
            });
        }
        catch(error){ 
            await interaction.editReply({
                content:`Unable to find message. ${error}`,
                ephemeral: false,
            }); 
        }
    }
};