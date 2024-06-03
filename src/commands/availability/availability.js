//import ApplicationCommandOptionType if you need types of options
//import PermissionFlagsBits if you need permissions
const { SlashCommandBuilder } = require('discord.js');

const { ScheduleError, createUnavailability } = require('../../utils/schedule');
const { Dayjs } = require('dayjs');
const fs = require('fs');
const dayjs = require('dayjs');
const { saveUnavailability } = require('../../utils/availability');
const { start } = require('repl');

//Availability Data Schema
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
        )
        .addSubcommand(subcommand => 
            subcommand.setName('set-availability')
            .setDescription('Provide the times of day and days of the week you are available')
            .addStringOption(option =>
                option.setName('time-from')
                .setDescription('When you start working (Formats: 2:00 pm, 14:00)')
                .setRequired(true)
            )
            .addStringOption(option => 
                option.setName('time-to')
                .setDescription('When you stop working (Formats: 2:00 pm, 14:00)')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('days')
                .setDescription('Provide days you are available (Formats: Monday Tuesday..., M T W..., Monday-Friday')
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
            'set-unavailability' : () => setUnavail(interaction),
            'set-availability' : () => setAvail(interaction),
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

const setAvail = async (interaction) => {

}