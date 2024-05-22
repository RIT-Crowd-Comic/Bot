//ban command -NO LOGIC, mainly for testing but if anyone wants to finish feel free
const {ApplicationCommandOptionType, PermissionFlagsBits} = require('discord.js');

module.exports = {
    deleted: true,
    name: 'ban',
    description: 'bans a member from a server',
    devOnly: false,
    testOnly: false,
    //ban options
    options:  [
        {
            name: 'target-user',
            description: 'The user to ban',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,

        },
        {
            name: 'reason',
            description: 'The reason for banning',
            type: ApplicationCommandOptionType.String,

        }
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],

    //logic goes here
    callback: (client, interaction) =>{
        interaction.reply(`Ban...`);
    }
};
