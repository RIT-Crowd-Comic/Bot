const { SlashCommandBuilder } = require('@discordjs/builders');
const { help, helpRemember, helpAvailability } = require('../../utils/helpCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of commands')
        .addSubcommand(subcommand =>
            subcommand.setName('help-general')
                .setDescription('List of general commands'))
        .addSubcommand(subcommand =>
            subcommand.setName('help-remember')
                .setDescription('List of remember commands'))
        .addSubcommand(subcommand =>
            subcommand.setName('help-availability')
                .setDescription('List of availability commands')),

    async execute(client, interaction) {
        const action = {
            'help-general':      () => help(),
            'help-remember':     () => helpRemember(),
            'help-availability': () => helpAvailability()
        };

        try {

            // get the used subcommand
            const subcommand = interaction.options.getSubcommand();

            await interaction.reply(action[subcommand]());
        }
        catch (error) {
            await interaction.reply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
