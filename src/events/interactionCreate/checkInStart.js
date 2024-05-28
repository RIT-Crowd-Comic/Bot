/**
 * Author: Arthur Powers
 * Date: 5/22/2024
 * 
 * 
 * Handle when a user interacts with the check in notification
 */

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Client } = require("discord.js");


/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    // only handling button interactions with the check in interface
    if (!interaction?.isButton()) return;

    // user clicked yes, start the survey
    if (interaction.customId === 'check-in-start-btn') {
        const checkInForm = new ModalBuilder()
            .setCustomId('check-in-form-modal')
            .setTitle('How are you doing?');

        const roses = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('check-in-form-roses')
                    .setLabel('What are you proud of today?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            );

        const thorns = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('check-in-form-thorns')
                    .setLabel('What did you struggle with today?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            );

        const buds = new ActionRowBuilder()
            .addComponents(
                new TextInputBuilder()
                    .setCustomId('check-in-form-buds')
                    .setLabel('How do you want to improve?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            );

        checkInForm.addComponents(roses, thorns, buds)

        await interaction.showModal(checkInForm);
    }

    else if (interaction.customId === 'check-in-later-btn') {
        await interaction.reply(
            {
                ephemeral: true,
                content: `Not yet implemented`
            }
        );
    }

    // user clicked no, stop bothering them
    else if (interaction.customId === 'check-in-cancel-btn') {
        await interaction.reply(
            {
                ephemeral: true,
                content: `Thanks for responding! Make sure to take short breaks and to drink plenty of water!`
            }
        );
    }

    else return; // user didn't interact with either of these buttons, do nothing
}
