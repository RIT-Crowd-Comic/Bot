const { SlashCommandBuilder } = require('@discordjs/builders');
const { helpRemember } = require('../../utils/miscCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help-remember')
        .setDescription('List of commands for remembering messages'),

    options:
    {
        devOnly:  false,
        testOnly: false,
        deleted:  false
    },

    async execute(client, interaction) {
        interaction.reply(helpRemember());
    }
};
