const {ApplicationCommandOptionType} = require('discord.js');
const {saveNumberMessages} = require("../../utils/rememberMessages");

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
    ],

    //logic, 
    callback: async(client, interaction) =>{
        
        try{
            await interaction.deferReply();

            //get the id    
            const value = interaction.options.get('number-of-messages').value;
            const numberOfMessages = value > 1000 ? 1000 : value;
            
            const channelId = interaction.options.getString('channel-id') ?? interaction.channel.id;
            
            //get the channel
            const channel = await client.channels.cache.get(channelId);

            let num = numberOfMessages;
            let startId;

            //check if over 100, if so loop to continue grabbing messages
            if(num > 100)
            {
                startId = await saveNumberMessages(100, channel);
                num -= 100;

                while(num / 100 >= 1)
                {
                    startId = await saveNumberMessages(100, channel, startId);
                    num -= 100;
                }

                if(num > 0)
                    await saveNumberMessages(num, channel, startId);
            }
            //if <= 100
            else{
                await saveNumberMessages(num, channel);
            }
            
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
