
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const weekday = require('dayjs/plugin/weekday');
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);


const fakeScheduleEntry = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('schedule-check-in')
        .setDescription('Schedule a day and time to be notified')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addStringOption(option =>
            option.setName('days')
                .setDescription('The name of days can be abbreviated as "m t w (th or h) f sa su". Ex: "Monday w f" or "daily"')

            // choices: [
            //     { name: "monday", value: "monday" },
            //     { name: "tuesday", value: "tuesday" },
            //     { name: "wednesday", value: "wednesday" },
            //     { name: "thursday", value: "thursday" },
            //     { name: "friday", value: "friday" },
            //     { name: "saturday", value: "saturday" },
            //     { name: "sunday", value: "sunday" }],
                .setRequired(true),)
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time of day. Ex: 12:30 am')
                .setRequired(true),),

    options:
    {
        devOnly:           false,
        testOnly:          false,
        fakeScheduleEntry: fakeScheduleEntry
    },


    /**
     *  * Parse and save schedule date to the database
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async execute(client, interaction) {
        const userId = interaction?.user?.id;
        const userTag = interaction?.user?.tag;

        await interaction.deferReply({ ephemeral: true });

        try {

            // command should include a user
            if (userId === undefined || userTag === undefined) {
                await interaction.editReply({
                    ephemeral: true,
                    content:   'Could not process command'
                });
                return;
            }

        try {


            const rawDays = interaction.options.get('days')?.value;
            const rawTime = interaction.options.get('time')?.value;
            let parsedDays = []; // eslint-disable-line
            const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const abbreviations = {
                'm':  'monday',
                't':  'tuesday',
                'w':  'wednesday',
                'th': 'thursday',
                'h':  'thursday',
                'f':  'friday',
                'sa': 'saturday',
                'su': 'sunday',
            };
            const daily = rawDays.toLocaleLowerCase().startsWith('daily');

            // split days by whitespace or comma
            if (daily) {
                parsedDays = validDays;
            }
            else {
                parsedDays = rawDays.split(/[\s,]+/i).map(s => s.toString().toLocaleLowerCase());
            }

            // replace abbreviated days
            parsedDays = parsedDays.map(d => abbreviations[d] ?? d);

            // check if parsed days are all valid
            if (parsedDays.some(d => !validDays.includes(d))) {
                await interaction.editReply({
                    ephemeral: true,
                    content:   'Invalid list of days'
                });
                return;
            }

            // dayjs requires space between `hh:mm am/pm`
            // regex allows user to have any number of spaces or no space at all
            let parsedTime = rawTime.replace(/\s*([ap]m)/, ' $1');

            // date is required for parsing, even just 'Y'
            // using a day from the past (1/1 2024, a monday) to parse time
            const timeFormats = ['Y h:mma', 'Y h:mmA', 'Y H:mm'];
            parsedTime = dayjs(`2024 ${parsedTime}`, timeFormats);

            if (!parsedTime.isValid()) {
                await interaction.editReply({
                    ephemeral: true,
                    content:   'Invalid time'
                });
                return;
            }

            const timeHours = parsedTime.hour();
            const timeMinutes = parsedTime.minute();

            // calculate difference from local time zone to UTC-0.
            // This is to ensure that everyone's notifications are timed properly 
            // regardless of time zone
            const firstScheduleDay =
                dayjs()
                    .day(validDays.indexOf(parsedDays[0])) // must use integer
                    .hour(timeHours)
                    .minute(timeMinutes);
            const utcHour = firstScheduleDay.utc().hour();
            const utcMin = firstScheduleDay.utc().minute();

            // dayjs().day(1).hour(17)

            // Since times close to midnight can translate to the next day (or previous day)
            // in UTC, the following code will shift the user's day schedule accordingly

            const utcDays = parsedDays.map(day => {
                const dayIndex = validDays.indexOf(day); // dayjs() uses index
                return validDays[firstScheduleDay.day(dayIndex).utc().day()];
            });

            // update the database
            fakeScheduleEntry[userId] ??= {};

            // update user's entries
            fakeScheduleEntry[userId] = {
                id:        userId,
                tag:       userTag,
                schedules: [
                    {
                        days:            utcDays,
                        utcTime:         [utcHour, utcMin],
                        displaySchedule: `${parsedDays} ${firstScheduleDay.format('LT')}`
                    }
                ]
            };

            // respond to the user to confirm schedule
            const daysResponse = daily ? 'every day' : `[${parsedDays.join(', ')}]`;

            let reply = [
                `Check ins scheduled for ${displaySchedule(schedule)}`,
                '',
                '[debug]',
                '',
                '```json',
                JSON.stringify(fakeScheduleEntry, undefined, 2),
                '```'
            ].join('\n');

            await interaction.editReply({
                ephemeral: true,
                content:   reply
            });
        }
        catch {
            await interaction.editReply({
                ephemeral: true,
                content:   `issue running command`
            });
        }
    }
};
