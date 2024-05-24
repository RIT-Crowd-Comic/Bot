/**
 * Author: Arthur Powers
 * Date: 5/22/2024
 * 
 * 
 * This command should be called one time in a dedicated channel where only the bot can send messages.
 * Prompt the user to schedule a time for the bot to send a quick checkin survey.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Client } = require("discord.js");
const { fakecheckInDatabase } = require("../../commands/dailyCheckIn/checkInInterface");

/**
 * Code retrieved from https://stackoverflow.com/questions/68764440/discord-js-how-to-change-style-of-button
 * Kirdoc's answer
 * @param {*} interaction 
 * @param {*} customId 
 * @returns 
 */
const findComponent = (interaction, customId) => {
    const actionRows = interaction.message.components;
    for (let actionRowIndex = 0; actionRowIndex < actionRows.length; ++actionRowIndex) {
        const actionRow = actionRows[actionRowIndex];

        for (let componentIndex = 0; componentIndex < actionRow.components.length; ++componentIndex) {
            if (actionRow.components[componentIndex].customId === customId) {
                return {
                    actionRowIndex,
                    componentIndex,
                };
            }
        }
    }
}

/**
 * Code retrieved from https://stackoverflow.com/questions/68764440/discord-js-how-to-change-style-of-button
 * Kirdoc's answer
 * @param {*} interaction 
 * @param {*} newButtonFunc 
 * @param {*} customId 
 * @returns 
 */
const updateComponent = (interaction, newButtonFunc, customId) => {
    const indices = findComponent(interaction, customId);
    if (!indices) {
        return [];
    }

    const actionRows = interaction.message.components.map((row) => ActionRowBuilder.from(row));
    newButtonFunc(actionRows[indices.actionRowIndex].components[indices.componentIndex]);

    return actionRows;
}


/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    // only handling button interactions with the checkin interface
    if (!interaction?.isButton()) return;

    if (interaction.customId?.startsWith('checkin-day')) {
        try {
            const userId = interaction.user.id;
            if (userId === undefined || userId === null) return;

            let currentUserSettings = fakecheckInDatabase[userId];
            if (currentUserSettings === undefined) {
                currentUserSettings = {
                    tag: interaction.user.tag,
                    id: interaction.user.id,
                    notificationDays: {
                        monday: { notify: false },
                        tuesday: { notify: false },
                        wednesday: { notify: false },
                        thursday: { notify: false },
                        friday: { notify: false },
                    }
                }
            }

            const day = interaction.customId.substr('checkin-day-'.length);

            currentUserSettings.notificationDays[day].notify = !currentUserSettings.notificationDays[day].notify;

            // update the database
            fakecheckInDatabase[userId] = currentUserSettings;

            const buttonStyle = currentUserSettings.notificationDays[day].notify ? ButtonStyle.Primary : ButtonStyle.Secondary;
            
            const updatedActionRows = updateComponent(
                interaction, 
                button => { button.data.style = buttonStyle; },
                interaction.customId
            )

            await interaction.update({
                components: updatedActionRows
            });
        }
        catch (error) {
            console.log(error);
        }

        // fakecheckInDatabase
    }

    else if (interaction.customId?.startsWith('check-in-btn')) {
        try {
            await interaction.deferReply({ ephemeral: true });
            let replyContent = "";
            const userId = interaction.user.id;

            replyContent += `<@${userId}>\n\n`;
            replyContent += `Would you like to spend a few minutes to describe how you're doing? `;
            replyContent += `Feel free to respond as vague or as in depth as you like. `
            replyContent += `Keep in mind that your response may be viewed by an administrator. `
            replyContent += `\n\n** **`
            const actions = new ActionRowBuilder();
            const yesBtn = new ButtonBuilder()
                .setCustomId('check-in-start-btn')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Primary);
            const notNowBtn = new ButtonBuilder()
                .setCustomId('check-in-cancel-btn')
                .setLabel('Not Really')
                .setStyle(ButtonStyle.Secondary);

            actions.addComponents(yesBtn, notNowBtn);

            await interaction.editReply({
                content: replyContent,
                components: [actions]
            });

        } catch (error) {
            console.log(error);
        }
    }
}