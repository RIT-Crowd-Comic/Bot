// import ApplicationCommandOptionType if you need types of options
// import PermissionFlagsBits if you need permissions
const { SlashCommandBuilder } = require('discord.js');
const {
    setUnavail, setAvail, displayAvail, displayUnavail
} = require('../../utils/availability');
const path = './src/savedAvailability.json';

// Callbacks
// set-unavailability
const callSetUnavail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = await setUnavail(
        interaction?.user?.id,
        interaction?.user?.tag,
        interaction.options.get('date-from')?.value,
        interaction.options.get('date-to')?.value,
        interaction.options.get('time-from')?.value,
        interaction.options.get('time-to')?.value,
        interaction.options.get('reason')?.value
    );

    await interaction.editReply(reply);
};

// set-availability
const callSetAvail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = await setAvail(
        interaction?.user?.id,
        interaction?.user?.tag,
        interaction.options.get('time-from')?.value,
        interaction.options.get('time-to')?.value,
        interaction.options.get('days')?.value
    );

    await interaction.editReply(reply);
};

const callDisplayAvail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = await displayAvail(interaction.user, interaction.guild.members.cache.get(interaction.options.get('member')?.value), path);

    interaction.editReply(reply);
};

const callDisplayUnavail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = await displayUnavail(interaction.user, interaction.guild.members.cache.get(interaction.options.get('member')?.value), path);

    interaction.editReply(reply);
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('availability')
        .setDescription('Saves and Displays availability data')
        .addSubcommand(subcommand =>
            subcommand.setName('set-unavailability')
                .setDescription('Record a time you\'ll be unavailable')
                .addStringOption(option =>
                    option.setName('date-from')
                        .setDescription('Provide the first date you will be unavailable (Formats: m/dd, m-dd, m/dd/yyyy...)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('date-to')
                        .setDescription('Provide the final date you will be unavailable (Formats: m/dd, m-dd, m/dd/yyyy...)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('time-from')
                        .setDescription('At what time of day will your unavailability begin? (Formats: 2:00 pm, 14:00)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('time-to')
                        .setDescription('At what time of day will your unavailability end? (Formats: 2:00 pm, 14:00)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Why will you be unavailable?')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('set-availability')
                .setDescription('Provide the times of day and days of the week you are available')
                .addStringOption(option =>
                    option.setName('time-from')
                        .setDescription('When you start working (Formats: 2:00 pm, 14:00)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('time-to')
                        .setDescription('When you stop working (Formats: 2:00 pm, 14:00)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('days')
                        .setDescription('Provide work days (Can be abbreviated as "m t w (th or h) f sa su". Ex: "Monday w f" or "daily")')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('view-availability')
                .setDescription('View your saved availability or that of another server member')
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('User you want to see availability of')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('view-unavailability')
                .setDescription('View your saved unavailability or that of another server member')
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('User you want to see the unavailability of')
                        .setRequired(false))),
    async execute(client, interaction) {


        const action = {
            'set-unavailability':  () => callSetUnavail(interaction),
            'set-availability':    () => callSetAvail(interaction),
            'view-availability':   () => callDisplayAvail(interaction),
            'view-unavailability': () => callDisplayUnavail(interaction)
        };

        try {

            // get the used subcommand
            const subcommand = interaction.options.getSubcommand();

            action[subcommand]();
        }
        catch (error) {
            await interaction.editReply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
