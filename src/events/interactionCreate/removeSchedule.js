
const checkIn = require('../../commands/dailyCheckIn/scheduleCheckIn');
const { displaySchedule } = require('../../utils/schedule');

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    if (interaction.customId === 'remove-schedule-dropdown') {

        const userId = interaction?.user?.id;

        try {
            // make sure unintended schedules aren't deleted when the remove-schedules dropdown changes
            checkIn.fakeScheduleEntry[userId].schedules.forEach(s => {
                s.remove = false;
            });

            // select schedules to remove
            interaction.values.forEach(v => {
                checkIn.fakeScheduleEntry[userId].schedules[v].remove = true;
            });
            await interaction.deferUpdate();

        }
        catch {
            await interaction.reply(
                {
                    ephemeral: true,
                    content: '*Issue selecting schedule.*'
                }
            );
            return;
        }
    }
    else if (interaction.customId === 'remove-schedule-btn') {

        const userId = interaction?.user?.id;

        try {
            const schedules = checkIn.fakeScheduleEntry[userId].schedules;

            // keep track of removed schedules to inform user 
            const removedSchedules = [];

            // iterate backwards since we're modifying data
            for (let i = schedules.length - 1; i >= 0; i--) {
                if (schedules[i].remove) {
                    removedSchedules.push(displaySchedule(schedules[i]));
                    schedules.splice(i, 1);
                }
            }

            // tell the user which schedules they removed
            let reply = '*No schedules removed*';

            if (removedSchedules.length > 0) {
                reply = [
                    'Removed schedules',
                    removedSchedules.map(s => `- ${s}`).join('\n'),
                ].join('\n');
            }

            await interaction.reply({
                ephemeral: true,
                content: reply
            });
        }
        catch {
            await interaction.reply(
                {
                    ephemeral: true,
                    content: '*Issue deleting schedules*'
                }
            );
        }
    }
};