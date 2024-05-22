/**
 * Author: Arthur Powers
 * Date: 5/22/2024
 * 
 * 
 * This command should be called one time in a dedicated channel where only the bot can send messages.
 * Prompt the user to schedule a time for the bot to send a quick checkup survey.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } = require("discord.js");

/**
 * 
 * @param {*} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    // only handling button interactions with the checkup interface
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('checkup-btn')) return;


    try {
        await interaction.deferReply({ephemeral: true});
        let replyContent = "";
        const userId = interaction.user.id;

        replyContent += `<@${userId}>\n\n`;
        replyContent += `Would you like to spend a few minutes to describe how you're doing? `;
        replyContent += `Feel free to respond as in depth or as vague as you like.\n\n** **`

        const actions = new ActionRowBuilder();
        const yesBtn = new ButtonBuilder()
        .setCustomId('checkup-start-btn')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Primary);
        const notNowBtn = new ButtonBuilder()
        .setCustomId('checkup-cancel-btn')
        .setLabel('Not Really')
        .setStyle(ButtonStyle.Secondary);

        actions.addComponents(yesBtn, notNowBtn);

        await interaction.editReply({
            content: replyContent,
            components: [actions]
        });

    } catch(error) {
        console.log(error);
    }
}