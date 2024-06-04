// import ApplicationCommandOptionType if you need types of options
// import PermissionFlagsBits if you need permissions
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { ScheduleError, createUnavailability, createAvailability } = require('../../utils/schedule');
const { Dayjs } = require('dayjs');
const fs = require('fs');
const dayjs = require('dayjs');
const {
    saveUnavailability, saveAvailability, loadAvailability, getUserIndex
} = require('../../utils/availability');
const { start } = require('repl');
const path = './src/savedAvailability.json';

// Availability Data Schema
// [
//     {
//       "userID": "123",
//       "userTag": "member",
//       "available": {
//         "from": "DayJS object",
//         "to": "DayJS object",
//         "days": "Monday-Friday"
//       },
//       "unavailable": [
//         {
//           "from": "DayJS object",
//           "to": "DayJS object",
//           "reason": "sick"
//         }
//       ]
//     }
// ]

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
                        .setDescription('Provide days you are available (Formats: Monday Tuesday..., M T W..., Monday-Friday')
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


    options:
    {
        devOnly:  false,
        testOnly: false,
        deleted:  false,
    },

    async execute(client, interaction) {


        const action = {
            'set-unavailability':  () => setUnavail(interaction),
            'set-availability':    () => setAvail(interaction),
            'view-availability':   () => displayAvail(interaction),
            'view-unavialability': () => displayUnavail(interaction)
        };

        try {

            // get the used subcommand
            const subcommand = interaction.options.getSubcommand();

            action[subcommand]();
        } catch (error) {
            await interaction.editReply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};

// Callbacks
// set-unavailability
const setUnavail = async (interaction) => {
    const userId = interaction?.user?.id;
    const userTag = interaction?.user?.tag;

    await interaction.deferReply({ ephemeral: true });

    // command should include a user
    if (userId === undefined || userTag === undefined) {
        await interaction.editReply({
            ephemeral: true,
            content:   'Could not process command'
        });
        return;
    }

    try {
        const dateFrom = interaction.options.get('date-from')?.value;
        const dateTo = interaction.options.get('date-to')?.value;
        let timeFrom = interaction.options.get('time-from')?.value;
        let timeTo = interaction.options.get('time-to')?.value;
        const reason = interaction.options.get('reason')?.value;

        if (dateTo && !dateFrom)
            throw new ScheduleError('Please select a start date.');
        if (timeTo && !timeFrom)
            throw new ScheduleError('Please select a start time.');

        // Default times to 0:00 if empty
        if (!timeFrom)
            timeFrom = '0:00';
        if (!timeTo)
            timeTo = '23:59';

        // Create a start and end dayjs obj
        const startUnavail = dayjs(`${dateFrom} ${timeFrom}`).format('MM-DD hh:mm A');
        const endUnavail = dayjs(`${dateTo} ${timeTo}`).format('MM-DD hh:mm A');

        if (!dayjs(startUnavail).isValid && !dayjs(endUnavail).isValid)
            throw new ScheduleError('Enter dates and times in proper formats');

        const unavail = createUnavailability(startUnavail, endUnavail, reason);

        // Print data for now
        let reply = [
            '```',
            JSON.stringify(unavail, undefined, 2),
            '```',
        ].join('\n');

        await interaction.editReply({ content: reply });

        // Save data to file
        saveUnavailability(userId, userTag, unavail, path);
    } catch (error) {
        if (error.name === 'ScheduleError') {
            await interaction.editReply({
                ephemeral: true,
                content:   `*${error.message}*`
            });
        } else {
            console.log(error);
            await interaction.editReply({
                ephemeral: true,
                content:   `*Issue running command*`
            });
        }
    }
};

// set-availability
const setAvail = async (interaction) => {
    const userId = interaction?.user?.id;
    const userTag = interaction?.user?.tag;

    await interaction.deferReply({ ephemeral: true });

    // command should include a user
    if (userId === undefined || userTag === undefined) {
        await interaction.editReply({
            ephemeral: true,
            content:   'Could not process command'
        });
        return;
    }

    try {
        const timeFrom = interaction.options.get('time-from')?.value;
        const timeTo = interaction.options.get('time-to')?.value;
        const days = interaction.options.get('days')?.value;

        if (!timeFrom || !timeTo)
            throw new ScheduleError('Enter both start AND end times');
        if (!days)
            throw new ScheduleError('Enter available days');

        // Create a start and end dayjs obj (arbitrary day used, does not affect time result)
        const startAvail = dayjs(`6-4 ${timeFrom}`).format('hh:mm A');
        const endAvail = dayjs(`6-4 ${timeTo}`).format('hh:mm A');

        if (!dayjs(startAvail).isValid && !dayjs(endAvail).isValid)
            throw new ScheduleError('Enter times in proper formats');

        const avail = createAvailability(startAvail, endAvail, days, userId, userTag);

        // Print data for now
        let reply = [
            '```',
            JSON.stringify(avail, undefined, 2),
            '```',
        ].join('\n');

        await interaction.editReply({ content: reply });

        // Save data to file
        saveAvailability(userId, userTag, avail, path);

    } catch (error) {
        if (error.name === 'ScheduleError') {
            await interaction.editReply({
                ephemeral: true,
                content:   `*${error.message}*`
            });
        } else {
            console.log(error);
            await interaction.editReply({
                ephemeral: true,
                content:   `*Issue running command*`
            });
        }
    }
};

const displayAvail = async (interaction) => {
    const userId = interaction?.user?.id;
    const userTag = interaction?.user?.tag;

    await interaction.deferReply({ ephemeral: true });

    // command should include a user
    if (userId === undefined || userTag === undefined) {
        await interaction.editReply({
            ephemeral: true,
            content:   'Could not process command'
        });
        return;
    }

    try {
        let targetMember = interaction.options.get('member')?.value;

        // Check if the user requested a different member's data, if not, set target to user that used command
        if (!targetMember)
            targetMember = interaction.user;

        // Get data saved from file
        const fileContent = loadAvailability(path);
        const userIndex = getUserIndex(fileContent.data, targetMember.id);

        // If no matching user was found in the data, 
        if (userIndex == -1) {
            console.log('no data');
            await interaction.editReply({
                ephemeral: true,
                content:   'Requested member has no available data'
            });
            return;
        }

        const availability = fileContent.data[userIndex].available;

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Availability`)
            .setDescription(`Available from ${availability.from}-${availability.to} ${availability.days}`);
        interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.log(error);
        await interaction.editReply({
            ephemeral: true,
            content:   `*Issue running command*`
        });
    }
};

const displayUnavail = async (interaction) => {
    const userId = interaction?.user?.id;
    const userTag = interaction?.user?.tag;

    await interaction.deferReply({ ephemeral: true });

    // command should include a user
    if (userId === undefined || userTag === undefined) {
        await interaction.editReply({
            ephemeral: true,
            content:   'Could not process command'
        });
        return;
    }

    try {
        let targetMember = interaction.options.get('member')?.value;

        // Check if the user requested a different member's data, if not, set target to user that used command
        if (!targetMember)
            targetMember = interaction.user;

        // Get data saved from file
        const fileContent = loadAvailability(path);
        const userIndex = getUserIndex(fileContent.data, targetMember.id);

        // If no matching user was found in the data, 
        if (userIndex == -1) {
            await interaction.editReply({
                ephemeral: true,
                content:   'Requested member has no available data'
            });
            return;
        }

        const unavailability = fileContent.data[userIndex].unavailable;

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Unavailability`);
        for (let i = 0, length = unavailability.length; i < length; i++) {
            embed.addFields({
                name:  `From ${unavailability[i].from} to ${unavailability[i].to}`,
                value: `Reason: ${unavailability[i].reason}`
            });
        }
        console.log(embed);
        interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.log(error);
        await interaction.editReply({
            ephemeral: true,
            content:   `*Issue running command*`
        });
    }
};
