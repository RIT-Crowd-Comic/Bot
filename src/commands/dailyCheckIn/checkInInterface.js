const { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

/**
 * Initiate a prompt allowing users to create a scheduler.
 */

const fakecheckInDatabase = {}


module.exports = {
    callback: (client, interaction) => {

        try {
            const actions = new ActionRowBuilder();
            const testBtn = new ButtonBuilder()
                .setCustomId('check-in-btn')
                .setLabel('Schedule check in Right Now')
                .setStyle(ButtonStyle.Secondary);

            actions.addComponents(testBtn);

            interaction.reply({
                content: `Hello, I am ${client.user.username}. I am here to help users stay on task and maintain a healthy workflow.\n\n__Schedule feedback__\n\nClick below to force a check in as if it were scheduled for now.`,
                components: [actions]
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
    fakecheckInDatabase
}