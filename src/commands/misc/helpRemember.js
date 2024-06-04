const { SlashCommandBuilder } = require('@discordjs/builders');
const { helpRemember } = require('../../utils/helpCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help-remember')
        .setDescription('List of commands for remembering messages'),

    async execute(client, interaction) {
        interaction.reply(helpRemember());
    }
};
