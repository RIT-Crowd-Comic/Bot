const {ApplicationCommandOptionType} = require('discord.js');
const {addMessage, parseMessage, searchAllChannelsForMessage} = require("../../utils/remeberMessages");
const { testServer } = require('../../../config.json');

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
            name: 'search-all-channels',
            description: 'Searches all channels for the message instead of the current channel.',
            type: ApplicationCommandOptionType.Boolean,
        },
    ],

    //logic, 
    callback: async(client, interaction) =>{
        
        try{
            //get the id    
            const id = interaction.options.get('message-id').value;
            const s = interaction.options.getBoolean('search-all-channels') ?? false;
            
            let msg;
            //if true, search all
            if(s){
                msg = await searchAllChannelsForMessage(id, client, testServer);
            }
            else{
                //get the message from current channel
                msg =  await interaction.channel.messages.fetch(id);
            }

            //parse the message
            const parsedMessage = parseMessage(msg);

            //save the message
            addMessage(parsedMessage);

            interaction.reply({
              content:`Remembered: "${msg.content}"`,
              ephemeral: true,
            });
        }
        catch(error){ 
            interaction.reply({
                content:`Unable to find message. ${error}`,
                ephemeral: true,
            }); 
        }
    }
};