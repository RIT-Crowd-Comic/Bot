//import ApplicationCommandOptionType if you need types of options
//import PermissionFlagsBits if you need permissions
const { SlashCommandBuilder } = require('discord.js');

const { ScheduleError, createUnavailability } = require('../../utils/schedule');
const { Dayjs } = require('dayjs');
const fs = require('fs');
const dayjs = require('dayjs');
const { saveUnavailability } = require('../../utils/availability');
const { start } = require('repl');

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
    data: new SlashCommandBuilder()
        .setName('availability')
        .setDescription('Saves and Displays availability data')
        .addSubcommand(subcommand =>
            subcommand.setName('set-unavailability')
                .setDescription('Record a time you\'ll be unavailable')
                .addStringOption(option => 
                    option.setName('date-from')
                        .setDescription('Provide the first date you will be unavailable (Formats: m/dd, m-dd, m/dd/yyyy...)')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option.setName('date-to')
                        .setDescription('Provide the final date you will be unavailable (Formats: m/dd, m-dd, m/dd/yyyy...)')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option.setName('time-from')
                        .setDescription('At what time of day will your unavailability begin? (Formats: 2:00 pm, 14:00)')
                        .setRequired(false)
                )
                .addStringOption(option => 
                    option.setName('time-to')
                        .setDescription('At what time of day will your unavailability end? (Formats: 2:00 pm, 14:00)')
                        .setRequired(false)
                )
                .addStringOption(option => 
                    option.setName('reason')
                        .setDescription('Why will you be unavailable?')
                        .setRequired(false)
                )
        ),

    options:
    {
        devOnly: false,
        testOnly: false,
        deleted: false,
    },

    async execute(client, interaction) {


        const action = {
            'set-unavailability' : () => setUnavail(interaction)
        };

        try {
            //get the used subcommand
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

//Pre-Refactor Code
// module.exports = {
//     deleted: false, //deleted (optional) specifies if this command shouldn't be on the server/guild
//     name: 'remember-unavailable',  //a name(required)
//     description: 'Record a time you\'ll be unavailable', //a description(required)
//     devOnly: false, //a devonly flag(optional)
//     testOnly: false, //a testonly flag(optional)
//     //options(optional)
//     options: [
//         //Repeated days will not be scheduled as of now
//         /*{
//             name: 'schedule-days', //name(required)
//             description: 'The name of days can be abbreviated as "m t w (th or h) f sa su". Ex: "Monday w f" or "daily"', //description(required)
//             required: false, //required(optional) : makes it so the user needs to input something to run the command
//             type: ApplicationCommandOptionType.String, //type of command, use intellisense or docs to select proper one
//             //https://discord.com/developers/docs/interactions/application-commands

//         },*/
//         {
//             name: 'date-from',
//             description: 'List a specific date you will be unavailable (Formats: m/dd, m-dd, m/dd/yyyy...)',
//             required: true,
//             type: ApplicationCommandOptionType.String,
//         },
//         {
//             name: 'date-to',
//             description: 'List a specific date you will no longer be unavailable (Formats: m/dd, m-dd, m/dd/yyyy...)',
//             required: true,
//             type: ApplicationCommandOptionType.String,
//         },
//         {
//             name: 'time-from',
//             description: 'At what time of day will you be available? (Format Exs: 2:00 pm, 14:00)',
//             required: false,
//             type: ApplicationCommandOptionType.String,
//         },
//         {
//             name: 'time-to',
//             description: 'At what time of day are you no longer available? (Format Exs: 2:00 pm, 14:00)',
//             required: false,
//             type: ApplicationCommandOptionType.String,
//         },
//         {
//             name: 'reason',
//             description: 'Why will you be unavailable?',
//             required: false,
//             type: ApplicationCommandOptionType.String
//         }
//     ],
//     permissionsRequired: [
//         PermissionFlagsBits.ViewChannel,
//     ], //permissions(optional) check intellisense or docs to view permission options
//     //https://discord.com/developers/docs/topics/permissions

//     /**
//      *  * Parse and save schedule date to the database
//      * @param {Client} client 
//      * @param {CommandInteraction} interaction 
//      */
//     callback: async (client, interaction) => {

//         const userId = interaction?.user?.id;
//         const userTag = interaction?.user?.tag;

//         await interaction.deferReply({ ephemeral: true });

//         // command should include a user
//         if (userId === undefined || userTag === undefined) {
//             await interaction.editReply({
//                 ephemeral: true,
//                 content: 'Could not process command'
//             });
//             return;
//         }

//         try {
//             //const scheduleDays = interaction.options.get('schedule-days')?.value;
//             const dateFrom = interaction.options.get('date-from')?.value;
//             const dateTo = interaction.options.get('date-to')?.value;
//             let timeFrom = interaction.options.get('time-from')?.value;
//             let timeTo = interaction.options.get('time-to')?.value;
//             const reason = interaction.options.get('reason')?.value;

//             // if (!(scheduleDays || dateFrom || timeFrom))
//             //     throw new ScheduleError('Please select a schedule, date, or time.');
//             // if (scheduleDays && dateFrom)
//             //     throw new ScheduleError('Please select either a schedule or a date (not both).');
//             if (dateTo && !dateFrom)
//                 throw new ScheduleError('Please select a start date.');
//             if (timeTo && !timeFrom)
//                 throw new ScheduleError('Please select a start time.');

//             //Default times to 0:00 if empty
//             if(!timeFrom)
//                 timeFrom = '0:00';
//             if(!timeTo)
//                 timeTo = '0:00';

//             //Create a start and end dayjs obj
//             const startUnavail = dayjs(`${dateFrom} ${timeFrom}`).format('MM-DD hh:mm A');
//             const endUnavail = dayjs(`${dateTo} ${timeTo}`).format('MM-DD hh:mm A');

//             if(!dayjs(startUnavail).isValid&&!dayjs(endUnavail).isValid)
//                 throw new ScheduleError('Enter dates and times in proper formats');

//             const unavail = createUnavailability(startUnavail, endUnavail, userId, userTag, reason);

//             let reply = [
//                 '```',
//                 JSON.stringify(unavail, undefined, 2),
//                 '```',
//             ].join('\n');

//             await interaction.editReply({
//                 content: reply
//             });
//         }

//         catch (error) {
//             if (error.name === 'ScheduleError') {
//                 await interaction.editReply({
//                     ephemeral: true,
//                     content: `*${error.message}*`
//                 });
//             }
//             else {
//                 console.log(error);
//                 await interaction.editReply({
//                     ephemeral: true,
//                     content: `*Issue running command*`
//                 });
//             }
//         }
//     }
// };

//Callbacks
//set-unavailability
const setUnavail = async (interaction) => {
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
        //const scheduleDays = interaction.options.get('schedule-days')?.value;
        const dateFrom = interaction.options.get('date-from')?.value;
        const dateTo = interaction.options.get('date-to')?.value;
        let timeFrom = interaction.options.get('time-from')?.value;
        let timeTo = interaction.options.get('time-to')?.value;
        const reason = interaction.options.get('reason')?.value;

        // if (!(scheduleDays || dateFrom || timeFrom))
        //     throw new ScheduleError('Please select a schedule, date, or time.');
        // if (scheduleDays && dateFrom)
        //     throw new ScheduleError('Please select either a schedule or a date (not both).');
        if (dateTo && !dateFrom)
            throw new ScheduleError('Please select a start date.');
        if (timeTo && !timeFrom)
            throw new ScheduleError('Please select a start time.');

        //Default times to 0:00 if empty
        if(!timeFrom)
            timeFrom = '0:00';
        if(!timeTo)
            timeTo = '0:00';

        //Create a start and end dayjs obj
        const startUnavail = dayjs(`${dateFrom} ${timeFrom}`).format('MM-DD hh:mm A');
        const endUnavail = dayjs(`${dateTo} ${timeTo}`).format('MM-DD hh:mm A');

        if(!dayjs(startUnavail).isValid&&!dayjs(endUnavail).isValid)
            throw new ScheduleError('Enter dates and times in proper formats');

        const unavail = createUnavailability(startUnavail, endUnavail, userId, userTag, reason);

        let reply = [
            '```',
            JSON.stringify(unavail, undefined, 2),
            '```',
        ].join('\n');

        await interaction.editReply({
            content: reply
        });

        //Save data to file
        const path = './src/savedAvailability.json';
        saveUnavailability(userId, userTag, {from: startUnavail, to: endUnavail, reason: reason}, path);
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
};