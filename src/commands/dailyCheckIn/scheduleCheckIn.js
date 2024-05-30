
const { PermissionFlagsBits, ApplicationCommandOptionType, Client, CommandInteraction, ApplicationCommandOptionWithChoicesMixin } = require('discord.js');

const { createSchedule, parseDaysList, parseTime, displaySchedule } = require('../../utils/schedule');


const fakeScheduleEntry = {
};

module.exports = {
    /**
     *  * Parse and save schedule date to the database
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    callback: async (client, interaction) => {

        const userId = interaction?.user?.id;
        const userTag = interaction?.user?.tag;

        await interaction.deferReply({ ephemeral: true });

        // command should include a user
        if (userId === undefined || userTag === undefined) {
            await interaction.editReply({
                ephemeral: true,
                content: '*Could not process command*'
            });
            return;
        }

        try {


            const rawDays = interaction.options.get('days')?.value;
            const rawTime = interaction.options.get('time')?.value;
            let schedule;

            const parsedDays = parseDaysList(rawDays);
            const parsedTime = parseTime(rawTime);
            schedule = createSchedule(parsedDays, parsedTime);

            // update the database
            fakeScheduleEntry[userId] ??= {};

            Object.assign(fakeScheduleEntry[userId],
                {
                    id: userId,
                    tag: userTag,
                }
            );
            fakeScheduleEntry[userId].schedules ??= [];
            fakeScheduleEntry[userId].schedules.push(schedule);

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
                content: reply
            });
        }
        catch (error) {
            if (error.name === 'ScheduleError') {
                await interaction.editReply({
                    ephemeral: true,
                    content: error.message
                });
            }
            else {
                console.log(error);
                await interaction.editReply({
                    ephemeral: true,
                    content: `*Issue running command*`
                });
            }
        }
    },
    name: 'schedule-check-in',
    description: 'Schedule a day and time to be notified',
    options: [
        {
            name: 'days',
            description: 'The name of days can be abbreviated as "m t w (th or h) f sa su". Ex: "Monday w f" or "daily"',
            // choices: [
            //     { name: "monday", value: "monday" },
            //     { name: "tuesday", value: "tuesday" },
            //     { name: "wednesday", value: "wednesday" },
            //     { name: "thursday", value: "thursday" },
            //     { name: "friday", value: "friday" },
            //     { name: "saturday", value: "saturday" },
            //     { name: "sunday", value: "sunday" }],
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
    fakeScheduleEntry
};