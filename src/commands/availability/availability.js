// import ApplicationCommandOptionType if you need types of options
// import PermissionFlagsBits if you need permissions
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const {
    setUnavail, setAvail, displayAvail, displayUnavail
} = require('../../utils/availability');
const path = './src/savedAvailability.json';

// Callbacks
// set-unavailability
const callSetUnavail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = setUnavail(
        interaction?.user?.id,
        interaction?.user?.tag,
        interaction.options.get('date-from')?.value,
        interaction.options.get('date-to')?.value,
        interaction.options.get('time-from')?.value,
        interaction.options.get('time-to')?.value,
        interaction.options.get('reason')?.value,
        path
    );

    await interaction.editReply(reply);
};

// set-availability
const callSetAvail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = setAvail(
        interaction?.user?.id,
        interaction?.user?.tag,
        interaction.options.get('time-from')?.value,
        interaction.options.get('time-to')?.value,
        interaction.options.get('days')?.value,
        path
    );

    await interaction.editReply(reply);
};

const callDisplayAvail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = displayAvail(interaction.user, interaction.guild.members.cache.get(interaction.options.get('member')?.value), path);

    interaction.editReply(reply);
};

const callDisplayUnavail = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const reply = displayUnavail(interaction.user, interaction.guild.members.cache.get(interaction.options.get('member')?.value), path);

    interaction.editReply(reply);
};

const setUnavailabilityGUI = async (interaction) => {
    await interaction.deferReply({ ephemeral: false });

    const unavailabilityForm = new ModalBuilder()
        .setCustomId('unavailabilityForm')
        .setTitle('Setting up unavailability');

    const actionRow = new ActionRowBuilder();

    const reason = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Reason for not being present')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = [];
    for (let i = 1; i < 32; i++) {
        days.push(i)
    }
    const monthsSelector = new StringSelectMenuBuilder()
        .setCustomId('unavailable months')
        .setPlaceholder('Months')
        .addOptions(months.map(m => new StringSelectMenuOptionBuilder()
            .setLabel(m)
            .setValue(m)))
        .setMinValues(1)
        .setMaxValues(1);

    const submitButton = new ButtonBuilder()
        .setCustomId('SubmitButton')
        .setLabel('Submit')
        .setStyle(ButtonStyle.Primary);



    //actionRow.addComponents(reason)
    actionRow.addComponents(submitButton)


    const reply = await interaction.editReply({
        content: `Update your unavailability`,
        components: [actionRow]
    });

    const collector = reply.createMessageComponentCollector({
        ComponentType: ComponentType.StringSelect,
        time: 60_000,
    })

    collector.on('collect', (interaction) => {
        console.log(interaction.values)
    })
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('availability')
        .setDescription('Saves and displays availability data')
        .addSubcommand(subcommand =>
            subcommand.setName('set-unavailability-gui')
                .setDescription('Record a time you\'ll be unavailable with a GUI'))
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
            'set-unavailability': () => callSetUnavail(interaction),
            'set-availability': () => callSetAvail(interaction),
            'view-availability': () => callDisplayAvail(interaction),
            'view-unavailability': () => callDisplayUnavail(interaction),
            'set-unavailability-gui': () => setUnavailabilityGUI(interaction)
        };

        try {

            // get the used subcommand
            const subcommand = interaction.options.getSubcommand();

            action[subcommand]();
        }
        catch (error) {
            await interaction.editReply({
                content: `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
