
// const checkIn = require('../../commands/dailyCheckIn/scheduleCheckIn');
const { markCheckInScheduleForDelete, deleteMarkedCheckInSchedules, getCheckInSchedulesMarkedForDelete } = require('../../database');
const { displaySchedule, updateQueue } = require('../../utils/schedule');

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    if (interaction.customId === 'remove-schedule-dropdown') {

        try {

            // delete all selected values in parallel
            await Promise.all(interaction.values.map(scheduleId => markCheckInScheduleForDelete(scheduleId)));
            await interaction.deferUpdate();
        }
        catch {
            interaction.reply({
                ephemeral: true,
                content:   '*Issue selecting schedule.*'
            });
            return;
        }
    }
    else if (interaction.customId === 'remove-schedule-btn') {

        const userId = interaction?.user?.id;

        try {
            await interaction.deferReply({ ephemeral: true });

            const removedSchedules = await getCheckInSchedulesMarkedForDelete(userId);

            const numDeleted = await deleteMarkedCheckInSchedules();

            // tell the user which schedules they removed
            let reply = '*No schedules removed*';

            if (numDeleted > 0) {
                reply = [
                    'Removed schedules',
                    removedSchedules.map(s => `- ${displaySchedule(s)}`).join('\n'),
                ].join('\n');
            }

            await interaction.editReply({
                ephemeral: true,
                content:   reply
            });

            // make sure the queue is updated
            removedSchedules.forEach(schedule => {
                updateQueue(schedule.utc_days, schedule.utc_time, userId, true);
            });
        }
        catch {
            await interaction.followUp({
                ephemeral: true,
                content:   '*Issue deleting schedules*'
            });
        }
    }
};
