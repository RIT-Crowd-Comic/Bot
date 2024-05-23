const {ApplicationCommandOptionType} = require('discord.js');
const {addMessage, parseMessage} = require("../../utils/remeberMessages");
const { clientId } = require('../../../config.json');

//remembers a message based on a message id parameter
module.exports = {
    name: 'remember-count',
    description: 'Saves the last x messages from the current channel. Has an option to save from a specific channel.',
    options:  [
        {
            name: 'number-of-messages',
            description: 'The number of messages to save. Max 100.',
            required: true,
            type: ApplicationCommandOptionType.Number,
        },
        {
            name: 'channel-id',
            description: 'Id of the channel to search.',
            type: ApplicationCommandOptionType.Boolean,
        },
    ],

    //logic, 
    callback: async(client, interaction) =>{
        
        try{
            //get the id    
            const value = interaction.options.get('number-of-messages').value;
            const numberOfMessages = value > 100 ? 100 : value;

            const channelId = interaction.options.getString('channel-id') ?? interaction.channel.id;
            
            //get the channel
            const channel = await client.channels.cache.get(channelId);

            //get the messages
            const messages = await channel.messages.fetch({ limit: numberOfMessages });
            
            //loop for each message
            messages.forEach((msg)=>{
                
                //parse the message
                const parsedMessage = parseMessage(msg);

                //save the message
                addMessage(parsedMessage);
            });
            //show that it saved
            await interaction.reply({
                content:`Remembered the last "${numberOfMessages}"`,
                ephemeral: true,
            });
        }
        catch(error){ 
            await interaction.reply({
                content:`Something went wrong. ${error}`,
                ephemeral: true,
            }); 
        }
    }
};