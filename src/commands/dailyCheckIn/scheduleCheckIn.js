
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
    fakeScheduleEntry, queue, parseDaysList, parseTime, createSchedule, displaySchedule, getQueue
} = require('../../utils/schedule');




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
        devOnly:  false,
        testOnly: false,
    },

    fakeScheduleEntry,

    /**
     *  * Parse and save schedule date to the database
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async execute(client, interaction) {

        const userId = interaction?.user?.id;
        const userTag = interaction?.user?.tag;

        await interaction.deferReply({ ephemeral: true });

        // command should include a user
        if (userId === undefined || userTag === undefined) {
            await interaction.editReply({
                ephemeral: true,
                content:   '*Could not process command*'
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

            Object.assign(
                fakeScheduleEntry[userId],
                {
                    id:  userId,
                    tag: userTag,
                }
            );
            fakeScheduleEntry[userId].schedules ??= [];
            fakeScheduleEntry[userId].schedules.push(schedule);

            getQueue();
            console.log('queue');
            console.log(queue);

            let reply = `Check ins scheduled for ${displaySchedule(schedule)}`;

            await interaction.editReply({
                ephemeral: true,
                content:   reply
            });
        } catch (error) {
            if (error.name === 'ScheduleError') {
                await interaction.editReply({
                    ephemeral: true,
                    content:   error.message
                });
            } else {
                console.log(error);
                await interaction.editReply({
                    ephemeral: true,
                    content:   `*Issue running command*`
                });
            }
        }
    }
};
