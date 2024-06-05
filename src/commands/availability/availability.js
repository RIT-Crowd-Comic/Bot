// import ApplicationCommandOptionType if you need types of options
// import PermissionFlagsBits if you need permissions
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { ScheduleError, parseDaysList } = require('../../utils/schedule');
const dayjs = require('dayjs');
const {
    createAvailability, createUnavailability, saveUnavailability, saveAvailability, loadAvailability,
    getSUData, setUnavail
} = require('../../utils/availability');
const path = './src/savedAvailability.json';

// Callbacks
// set-unavailability
const callSetUnavail = async (interaction) => {
    // try {
        await interaction.deferReply({ ephemeral: true });

        let reply = setUnavail(interaction?.user?.id,interaction?.user?.tag,interaction.options.get('date-from')?.value,interaction.options.get('date-to')?.value,
        interaction.options.get('time-from')?.value,interaction.options.get('time-to')?.value,interaction.options.get('reason')?.value, path);
        
        await interaction.editReply({content: reply});

        // if (dateTo && !dateFrom)
        //     throw new ScheduleError('Please select a start date.');
        // if (timeTo && !timeFrom)
        //     throw new ScheduleError('Please select a start time.');

        // // Create a start and end dayjs obj (Default times to 0:00 if empty)
        // const startUnavail = dayjs(`2024 ${dateFrom} ${timeFrom ? timeFrom : '0:00'}`);
        // const endUnavail = dayjs(`2024 ${dateTo} ${timeTo ? timeTo : '23:59'}`);

        // const unavail = createUnavailability(startUnavail, endUnavail, reason);

        // // Print data for now
        // let toPrint = [
        //     '```',
        //     JSON.stringify(unavail, undefined, 2),
        //     '```',
        // ].join('\n');

        // await interaction.editReply({ content: reply });

        // // Save data to file
        // saveUnavailability(userId, userTag, unavail, path);
    // }
    // catch (error) {
    //     if (error.name === 'ScheduleError') {
    //         await interaction.editReply({
    //             ephemeral: true,
    //             content:   `*${error.message}*`
    //         });
    //     }
    //     else {
    //         console.log(error);
    //         await interaction.editReply({
    //             ephemeral: true,
    //             content:   `*Issue running command*`
    //         });
    //     }
    // }
};

// set-availability
const setAvail = async (interaction) => {
    try {
        const userId = interaction?.user?.id;
        const userTag = interaction?.user?.tag;

        await interaction.deferReply({ ephemeral: true });
        const timeFrom = interaction.options.get('time-from')?.value;
        const timeTo = interaction.options.get('time-to')?.value;
        const rawDays = interaction.options.get('days')?.value;

        if (!timeFrom || !timeTo)
            throw new ScheduleError('Enter both start AND end times');

        // Parse the day list into an array
        const days = parseDaysList(rawDays ? rawDays : 'daily');

        // Create a start and end dayjs obj (arbitrary day used, does not affect time result)
        const startAvail = dayjs(`2024 5-20 ${timeFrom}`);
        const endAvail = dayjs(`2024 8-9 ${timeTo}`);

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
    }
    catch (error) {
        if (error.name === 'ScheduleError') {
            await interaction.editReply({
                ephemeral: true,
                content:   `*${error.message}*`
            });
        }
        else {
            console.log(error);
            await interaction.editReply({
                ephemeral: true,
                content:   `*Issue running command*`
            });
        }
    }
};

const displayAvail = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        let targetMember = interaction.options.get('member')?.value;

        // Check if the user requested a different member's data, if not, set target to user that used command
        if (!targetMember)
            targetMember = interaction.user;

        // Get data saved from file
        const fileContent = loadAvailability(path);

        // If no matching user was found in the data, 
        if (!fileContent[targetMember.id]) {
            console.log('no data');
            await interaction.editReply({
                ephemeral: true,
                content:   'Requested member has no available data'
            });
            return;
        }

        const availability = fileContent[targetMember.id].available;

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Availability`)
            .setDescription(`Available from ${dayjs(availability.from).format('hh:mm A')}-${dayjs(availability.to).format('hh:mm A')} on ${availability.days.join(', ')}`);
        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    catch (error) {
        console.log(error);
        await interaction.editReply({
            ephemeral: true,
            content:   `*Issue running command*`
        });
    }
};

const displayUnavail = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        let targetMember = interaction.options.get('member')?.value;

        // Check if the user requested a different member's data, if not, set target to user that used command
        if (!targetMember)
            targetMember = interaction.user;

        // Get data saved from file
        const fileContent = loadAvailability(path);

        // If no matching user was found in the data, 
        if (!fileContent[targetMember.id]) {
            await interaction.editReply({
                ephemeral: true,
                content:   'Requested member has no available data'
            });
            return;
        }

        const unavailability = fileContent[targetMember.id].unavailable;

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Unavailability`);
        for (let i = 0, length = unavailability.length; i < length; i++) {

            // Check for reason (leave empty if none)
            const reason = unavailability[i].reason ? `Reason: ${unavailability[i].reason}` : ` `;
            embed.addFields({
                name:  `From ${dayjs(unavailability[i].from).format('MM-DD hh:mm A')} to ${dayjs(unavailability[i].to).format('MM-DD hh:mm A')}`,
                value: reason
            });
        }
        interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    catch (error) {
        console.log(error);
        await interaction.editReply({
            ephemeral: true,
            content:   `*Issue running command*`
        });
    }
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
            'set-availability':    () => setAvail(interaction),
            'view-availability':   () => displayAvail(interaction),
            'view-unavailability': () => displayUnavail(interaction)
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
