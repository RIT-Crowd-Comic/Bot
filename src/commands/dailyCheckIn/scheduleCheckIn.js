/**
 * Author: Arthur Powers
 * Date: 5/22/24
 * 
 * Initiate a prompt allowing users to create a scheduler.
 */

const { PermissionFlagsBits, ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const weekday = require('dayjs/plugin/weekday');
dayjs.extend(utc);
dayjs.extend(weekday);


const fakeScheduleEntry = {
    "monday": {},
    "tuesday": {},
    "wednesday": {},
    "thursday": {},
    "friday": {},
    "saturday": {},
    "sunday": {},
}

module.exports = {
    /**
     * Parse and save schedule date to the database
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    callback: async (client, interaction) => {

        const userId = interaction?.user?.id;
        const userTag = interaction?.user?.tag;

        await interaction.deferReply({ ephemeral: true });

        try {

            // command should include a user
            if (userId === undefined || userTag === undefined) {
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Could not process command'
                });
                return;
            }


            const rawDays = interaction.options.get('days')?.value;
            const rawTime = interaction.options.get('time')?.value;
            let timeHours;
            let timeMinutes;
            let parsedDays = [];
            const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const daily = rawDays.toLocaleLowerCase().startsWith('daily');

            // split days by whitespace or comma
            if (daily) {
                parsedDays = validDays;
            }
            else {
                parsedDays = rawDays.split(/[\s,]+/i).map(s => s.toString().toLocaleLowerCase());
            }

            // check if parsed days are all valid
            if (parsedDays.some(d => !validDays.includes(d))) {
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Invalid list of days'
                });
                return;
            }

            // regex checks for [number]:[number]p
            // am/pm is determined if 'p' exists
            // regex returns array of separated parts [original, hour, minute, pm]
            var parsedTime = rawTime.match(/(\d+)(?::(\d\d))?\s*(p?)/);

            try {
                // convert everything to 24 hour time
                const hour = parseInt(parsedTime[1]);
                if (hour < 12) {
                    timeHours = hour + (parsedTime[3] ? 12 : 0); // add time for pm
                }
                else if (hour === 12) {
                    timeHours = parsedTime[3] ? 12 : 0;
                }
                else if (hour < 24) {
                    timeHours = hour;
                }
                else throw new Error();

                timeMinutes = parseInt(parsedTime[2] || 0);
                if (timeMinutes < 0 || timeMinutes >= 60) throw new Error();
            }
            catch {
                await interaction.editReply({
                    ephemeral: true,
                    content: 'Invalid time'
                });
                return;
            }

            // calculate difference from local time zone to UTC-0.
            // This is to ensure that everyone's notifications are timed properly 
            // regardless of time zone
            const utcDay = dayjs(interaction?.createdAt).utc().day();
            const localDay = dayjs().hour(timeHours).utc().day();
            const dayDiff = localDay - utcDay;
            const utcHour = dayjs().hour(timeHours).utc().hour();
            const utcMin = dayjs().hour(timeHours).minute(timeMinutes).utc().minute();
            // dayjs().day(1).hour(17)

            const utcDays = parsedDays.map(d => {
                // shift the day depending on time zone offset
                const rawDayIndex = validDays.indexOf(d) + dayDiff;

                // force index within bounds of validDays[]
                const dayIndex = rawDayIndex % validDays.length < 0 ?
                    validDays.length + (rawDayIndex % validDays.length) :
                    rawDayIndex % validDays.length;
                return validDays[dayIndex];
            })

            const formattedTimeMin = timeMinutes.toString().length === 1 ? `0${timeMinutes}` : timeMinutes;


            // update the database

            // clear current user's entries

            Object.keys(fakeScheduleEntry).forEach(day => {
                delete fakeScheduleEntry[day][userId]
            });

            // update user's entries
            utcDays.forEach((d, i) => {
                fakeScheduleEntry[d][userId] = {
                    id: userId,
                    tag: userTag,
                    utcTime: [utcHour, utcMin],
                    localTime: `${parsedDays[i]} ${timeHours}:${formattedTimeMin}`
                }
            });

            // respond to the user to confirm schedule
            const daysResponse = daily ? 'every day' : `[${parsedDays.join(', ')}]`;

            let reply = ``;
            reply += `Check ins scheduled for ${daysResponse} at ${timeHours}:${formattedTimeMin} (24hr time)\n`
            reply += `\n[debug]\n`;
            reply += `\`\`\`json\n${JSON.stringify(fakeScheduleEntry, undefined, 2)}\`\`\``
            await interaction.editReply({
                ephemeral: true,
                content: reply
            });
        }
        catch {
            await interaction.editReply({
                ephemeral: true,
                content: `issue running command`
            });
        }
    },
    name: 'schedule-check-in',
    description: 'Schedule a day and time to be notified',
    options: [
        {
            name: 'days',
            description: 'List of days. Ex: "monday wednesday friday" or "daily"',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'time',
            description: 'Time of day. Ex: 12:30 am',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    devOnly: false,
    testOnly: false,
    permissionsRequired: [PermissionFlagsBits.SendMessages],
}