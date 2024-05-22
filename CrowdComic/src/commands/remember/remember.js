const {ApplicationCommandOptionType} = require('discord.js');
const remeberMessagesMethods = require("../../utils/remeberMessages");
//Shows buttons for roles on command
//NOTE the bot has to have a higher role than others to properly assign roles
module.exports = {
    name: 'r',
    description: 'remember test',
    options:  [
        {
            name: 'remember-test',
            description: 'test',
            required: true,
            type: ApplicationCommandOptionType.String,

        },
    ],

    //logic, 
    callback: async(client, interaction) =>{
        const a = interaction.options.get('remember-test').value;
        remeberMessagesMethods.addMessage(a)
        const r = remeberMessagesMethods.getRememberedMessage();
        interaction.reply(`messages: ${r.join(', ')}`)
    }
};