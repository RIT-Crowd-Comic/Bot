const { SlashCommandBuilder } = require('@discordjs/builders');
const { help } = require('../../utils/helpCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of commands'),

    async execute(client, interaction) {
        interaction.reply(help());
    }
};
