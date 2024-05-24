const {ApplicationCommandOptionType} = require('discord.js');
const {addMessage, parseMessage, searchAllChannelsForMessage} = require("../../utils/rememberMessages");
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
            name: 'search-specific-channel',
            description: 'Searches the give channel for the message.',
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
            await interaction.deferReply(); //defer waits for logic to finish
            
            //get the id of the message  
            const idMessage = interaction.options.get('message-id').value;
            //channel id
            const specificChannelId = interaction.options.getString('search-specific-channel');
            //search all channels?
            const s = interaction.options.getBoolean('search-all-channels') ?? false;
            
            let msg;
            //specific channel is true, search that channel
            if(specificChannelId){
                //get the message from given channel
                const channel = await client.channels.cache.get(specificChannelId);
                msg =  await channel.messages.fetch(idMessage);
            }
            //else if 
            else if(s){
                msg = await searchAllChannelsForMessage(idMessage, client, testServer);
            }
            else{
                //get the message from current channel
                msg =  await interaction.channel.messages.fetch(idMessage);
            }

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