const {ApplicationCommandOptionType} = require('discord.js');
const {saveMessagesTime} = require("../../utils/rememberMessages");
const ms = require('ms'); //converts time to ms

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
            description: 'Speed of the Search. Lower value is more accurate but slower.',
            type: ApplicationCommandOptionType.Number,
        },
    ],

    //logic, 
    callback: async(client, interaction) =>{
        try{
            await interaction.deferReply();

            //get the id    
            const value = interaction.options.get('minutes').value;

            //validate accuracy
            let accuracy = interaction.options.getNumber("speed") ?? 100;
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
            await saveMessagesTime(channel, pastTime, accuracy);

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
