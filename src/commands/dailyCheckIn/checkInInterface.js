const { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

/**
 * Author: Arthur Powers
 * Date: 5/22/24
 * 
 * Initiate a prompt allowing users to create a scheduler.
 */

const fakecheckInDatabase = {}
const makeDefaultUserSettings = (userTag, userId) => {
    return {
        tag: userTag,
        id: userId,
        notificationDays: {
            monday: { notify: false },
            tuesday: { notify: false },
            wednesday: { notify: false },
            thursday: { notify: false },
            friday: { notify: false },
        }
    }
}

module.exports = {
    callback: (client, interaction) => {

        try {

            // Experimental code for scheduling days using discord buttons
            // (unfortunately not a great option for multiple choices, since button styling is global for all users)
            // const schedulerDayRow = new ActionRowBuilder();
            // const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            // for (const day of days) {
            //     schedulerDayRow.addComponents(
            //         new ButtonBuilder()
            //             .setCustomId(`check-in-day-${day.toLocaleLowerCase()}`)
            //             .setStyle(ButtonStyle.Secondary)
            //             .setLabel(day)
            //     );
            // }

            // const schedulerTimeRow = new ActionRowBuilder();
            // schedulerTimeRow.addComponents(
            //     new StringSelectMenuBuilder()
            //         .setCustomId('check-in-time-input')
            //         .setPlaceholder('Select a time to be notified')
            //         .addOptions([
            //             new StringSelectMenuOptionBuilder()
            //                 .setLabel('12:30pm')
            //                 .setValue('12:30pm')
            //         ])
            // );

            const actions = new ActionRowBuilder();
            const testBtn = new ButtonBuilder()
                .setCustomId('check-in-btn')
                .setLabel('Schedule check in Right Now')
                .setStyle(ButtonStyle.Secondary);

            actions.addComponents(testBtn);

            interaction.reply({
                content: `Hello, I am [bot name]. I am here to help users stay on task and maintain a healthy workflow.\n\n__Schedule feedback__\n\nClick below to force a check in as if it were scheduled for now.`,
                components: [/*schedulerDayRow, schedulerTimeRow, */actions]
            });
        }
        catch (error) {
            console.log(error)
        }

    },
    name: 'check-in-interface',
    description: 'Create an interface for users to schedule their check ins',
    devOnly: false,
    testOnly: false,
    permissionsRequired: [PermissionFlagsBits.SendMessages],
    fakecheckInDatabase,
    makeDefaultUserSettings
}