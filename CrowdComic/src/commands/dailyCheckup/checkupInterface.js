const { PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

/**
 * Author: Arthur Powers
 * Date: 5/22/24
 * 
 * Initiate a prompt allowing users to create a scheduler.
 */

module.exports = {
    callback: (client, interaction) => {


        
        const actions = new ActionRowBuilder();
        const testBtn = new ButtonBuilder()
            .setCustomId('checkup-btn')
            .setLabel('Schedule Checkup Right Now')
            .setStyle(ButtonStyle.Secondary);

        actions.addComponents(testBtn);

        interaction.reply({
            content: `Hello, I am [bot name]. I am here to help users stay on task and maintain a healthy workflow.\n\n__Schedule feedback__\n\nStart by clicking below. More description later`,
            components: [actions]
        })

    },
    name: 'checkup-interface',
    description: 'Create an interface for users to schedule their checkups',
    devOnly: false,
    testOnly: false,
    permissionsRequired: [PermissionFlagsBits.SendMessages]
}