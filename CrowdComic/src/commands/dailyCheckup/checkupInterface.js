const { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

/**
 * Author: Arthur Powers
 * Date: 5/22/24
 * 
 * Initiate a prompt allowing users to create a scheduler.
 */

const fakeCheckupDatabase = {}

module.exports = {
    callback: (client, interaction) => {

        try {
            const schedulerDayRow = new ActionRowBuilder();
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            for (const day of days) {
                schedulerDayRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`checkup-day-${day.toLocaleLowerCase()}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel(day)
                );
            }

            const schedulerTimeRow = new ActionRowBuilder();
            schedulerTimeRow.addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('checkup-time-input')
                    .setPlaceholder('Select a time to be notified')
                    .addOptions([
                        new StringSelectMenuOptionBuilder()
                            .setLabel('12:30pm')
                            .setValue('12:30pm')
                    ])
            )

            const actions = new ActionRowBuilder();
            const testBtn = new ButtonBuilder()
                .setCustomId('checkup-btn')
                .setLabel('Schedule Checkup Right Now')
                .setStyle(ButtonStyle.Secondary);

            actions.addComponents(testBtn);

            interaction.reply({
                content: `Hello, I am [bot name]. I am here to help users stay on task and maintain a healthy workflow.\n\n__Schedule feedback__\n\nStart by clicking below. More description later`,
                components: [schedulerDayRow, schedulerTimeRow, actions]
            });
        }
        catch (error) {
            console.log(error)
        }

    },
    name: 'checkup-interface',
    description: 'Create an interface for users to schedule their checkups',
    devOnly: false,
    testOnly: false,
    permissionsRequired: [PermissionFlagsBits.SendMessages],
    fakeCheckupDatabase
}