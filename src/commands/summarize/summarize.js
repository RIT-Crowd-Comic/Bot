const { SlashCommandBuilder } = require('@discordjs/builders');
const { help, helpRemember, helpAvailability } = require('../../utils/helpCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summarize')
        .setDescription('Summarizes messages that were remembered.')
        .addNumberOption(option =>{
            option.setName('number')
            .setDescription('Number of messages to summarize')
        }),

    async execute(client, interaction) {
        try {
            //defer reply
            await interaction.deferReply();

            //openai stuff
        }
        catch (error) {
            await interaction.reply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
