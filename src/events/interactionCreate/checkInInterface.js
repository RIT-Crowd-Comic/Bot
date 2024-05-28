/**
 * 
 * This command should be called one time in a dedicated channel where only the bot can send messages.
 * Prompt the user to schedule a time for the bot to send a quick checkin survey.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Client } = require("discord.js");
const { fakecheckInDatabase, makeDefaultUserSettings } = require("../../commands/dailyCheckIn/checkInInterface");


/**
 * Code retrieved from https://stackoverflow.com/questions/68764440/discord-js-how-to-change-style-of-button
 * Kirdoc's answer
 * @param {*} interaction 
 * @param {*} newButtonFunc 
 * @param {*} customId 
 * @returns 
 */
const updateComponent = (interaction, newButtonFunc, customId) => {

    const actionRows = interaction.message.components.map((row) => ActionRowBuilder.from(row));
    const componentToUpdate = actionRows.map(row=> row.components)
    .flat()
    .find(component => component.customId === customId);

    newButtonFunc(componentToUpdate);

    return actionRows;
}


/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    // experimental code

    if (interaction.customId?.startsWith('checkin-day')) {
        try {
            const userId = interaction.user.id;
            if (userId === undefined || userId === null) return;

            let currentUserSettings = fakecheckInDatabase[userId];
            if (currentUserSettings === undefined) {
                currentUserSettings = makeDefaultUserSettings(interaction.user.tag, interaction.user.id);
            }

            const day = interaction.customId.substring('checkin-day-'.length);

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

    if (interaction.customId?.startsWith('check-in-btn')) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const userId = interaction.user.id;
            let reply = [
                `<@${userId}>`,
                '',
                '',
                'Would you like to spend a few minutes to describe how you\'re doing? ',
                'Feel free to respond as vague or as in depth as you like. ',
                'Keep in mind that your response may be viewed by an administrator. ',
                '',
                '',
                '** **',
            ].join('\n');

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
                content: reply,
                components: [actions]
            });

        } catch (error) {
            console.log(error);
        }
    }
}