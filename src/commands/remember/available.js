//import ApplicationCommandOptionType if you need types of options
//import PermissionFlagsBits if you need permissions
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

const { ScheduleError } = require('../../utils/schedule');
const { Dayjs } = require('dayjs');

// const availability = {
//     userid: {
//         id: '',
//         tag: '',
//         available: {
//             ...scheduleItems,
//             display: () => 'readable schedule'
//         }, // schedule object
//         unavailable: [
//             // example
//             {
//                 from: Dayjs, // day and time
//                 to: Dayjs, // day and time
//                 display: () => 'readable dates'
//             }
//         ]
//     }
// }


module.exports = {
    deleted: false, //deleted (optional) specifies if this command shouldn't be on the server/guild
    name: 'remember-available',  //a name(required)
    description: 'test', //a description(required)
    devOnly: false, //a devonly flag(optional)
    testOnly: false, //a testonly flag(optional)
    //options(optional)
    options: [
        {
            name: 'schedule-days', //name(required)
            description: 'The name of days can be abbreviated as "m t w (th or h) f sa su". Ex: "Monday w f" or "daily"', //description(required)
            required: false, //required(optional) : makes it so the user needs to input something to run the command
            type: ApplicationCommandOptionType.String, //type of command, use intellisense or docs to select proper one
            //https://discord.com/developers/docs/interactions/application-commands

        },
        {
            name: 'date-from',
            description: 'List a specific date you will be available (Formats: m/dd, m-dd, m/dd/yyyy...)',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'date-to',
            description: 'List a specific date you will no longer be available (Formats: m/dd, m-dd, m/dd/yyyy...)',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'time-from',
            description: 'At what time of day will you be available. (leave blank for all day)',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'time-to',
            description: 'At what time of day are you no longer available. (leave blank for all day)',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
    ],
    permissionsRequired: [
        PermissionFlagsBits.ViewChannel,
    ], //permissions(optional) check intellisense or docs to view permission options
    //https://discord.com/developers/docs/topics/permissions

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
                content: 'Could not process command'
            });
            return;
        }

        try {
            const scheduleDays = interaction.options.get('schedule-days')?.value;
            const dateFrom = interaction.options.get('date-from')?.value;
            const dateTo = interaction.options.get('date-to')?.value;
            const timeFrom = interaction.options.get('time-from')?.value;
            const timeTo = interaction.options.get('time-to')?.value;

            if (!(scheduleDays || dateFrom || timeFrom))
                throw new ScheduleError('Please select a schedule, date, or time.');
            if (scheduleDays && dateFrom)
                throw new ScheduleError('Please select either a schedule or a date (not both).');
            if (dateTo && !dateFrom)
                throw new ScheduleError('Please select a start date.');
            if (timeTo && !timeFrom)
                throw new ScheduleError('Please select a start time.');


            let reply = [
                '```',
                JSON.stringify(
                    {
                        scheduleDays,
                        dateFrom,
                        dateTo,
                        timeFrom,
                        timeTo
                    }, undefined, 2
                ),
                '```',
            ].join('\n');

            await interaction.editReply({
                content: reply
            });
        }

        catch (error) {
            if (error.name === 'ScheduleError') {
                await interaction.editReply({
                    ephemeral: true,
                    content: `*${error.message}*`
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
    }
};