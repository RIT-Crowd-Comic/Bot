const { SlashCommandBuilder } = require('@discordjs/builders');
const { help } = require('../../utils/miscCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of commands'),

    options:
    {
        devOnly:  false,
        testOnly: false,
        deleted:  false
    },

    async execute(client, interaction) {
        interaction.reply(help());
    }
};
