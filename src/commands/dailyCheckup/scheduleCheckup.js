/**
 * Author: Arthur Powers
 * Date: 5/22/24
 * 
 * Initiate a prompt allowing users to create a scheduler.
 */

const { PermissionFlagsBits, ApplicationCommandOptionType, Client, CommandInteraction } = require("discord.js");

const fakeScheduleEntry = {}

module.exports = {
    /**
     * Parse and save schedule date to the database
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    callback: (client, interaction) => {

        const userId = interaction?.user?.id;
        const userTag = interaction?.user?.tag;

        // command should include a user
        if (userId === undefined || userTag === undefined) {
            interaction.reply({
                ephemeral: true,
                content: 'Could not process command'
            });
            return;
        }


        const rawDays = interaction.options.get('day')?.value;
        const rawTime = interaction.options.get('time')?.value;
        let timeHours;
        let timeMinutes;
        let parsedDays;
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const daily = rawDays.toLocaleLowerCase().startsWith('daily');

        // split days by whitespace or comma
        if (daily) {
            parsedDays = validDays;
        }
        else {
            parsedDays = rawDays.split(/[\s,]+/i).map(s => s.toString().toLocaleLowerCase());
        }

        if (parsedDays.some(d => !validDays.includes(d))) {
            interaction.reply({
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
            const hour = parseInt(parsedTime);
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
            interaction.reply({
                ephemeral: true,
                content: 'Invalid time'
            });
            return;
        }

        // populate schedule object
        const formattedDays = {};
        validDays.forEach(day => {
            formattedDays[day] = { notify: parsedDays.includes(day) }
        });

        fakeScheduleEntry[userId] = {
            id: userId,
            tag: userTag,
            notificationDays: formattedDays,
            notificationTime: {
                hour: timeHours,
                minute: timeMinutes
            }
        }

        // respond to the user to confirm schedule
        const daysResponse = daily ? 'every day' : `[${parsedDays.join(', ')}]`;

        interaction.reply({
            ephemeral: true,
            content: `Checkups scheduled for ${daysResponse} at ${timeHours}:${timeMinutes}`
        });

    },
    name: 'schedule-checkup',
    description: 'Schedule a day and time to be notified',
    options: [
        {
            name: 'day',
            description: 'Space separated list of days. Ex: "monday wednesday friday" or "daily"',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'time',
            description: 'Ex: 12:30 am',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    devOnly: false,
    testOnly: false,
    permissionsRequired: [PermissionFlagsBits.SendMessages],
}