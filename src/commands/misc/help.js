const { SlashCommandBuilder } = require('@discordjs/builders');
const { help, helpRemember, helpAvailability, helpCheckIn } = require('../../utils/helpCommands');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List of commands')
        .addSubcommand(subcommand =>
            subcommand.setName('general')
                .setDescription('List of general commands'))
        .addSubcommand(subcommand =>
            subcommand.setName('remember')
                .setDescription('List of remember commands'))
        .addSubcommand(subcommand =>
            subcommand.setName('availability')
                .setDescription('List of availability commands'))
        .addSubcommand(subcommand =>
            subcommand.setName('check-in')
                .setDescription('List of check-in commands')),

    async execute(_, interaction) {
        const action = {
            'general': () => help(),
            'remember': () => helpRemember(),
            'availability': () => helpAvailability(),
            'check-in': () => helpCheckIn()
        };

        try {

            // get the used subcommand
            const subcommand = interaction.options.getSubcommand();

            await interaction.reply(action[subcommand]());
        }
        catch (error) {
            await interaction.reply({
                content: `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
