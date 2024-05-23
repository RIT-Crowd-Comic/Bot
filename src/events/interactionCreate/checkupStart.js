/**
 * Author: Arthur Powers
 * Date: 5/22/2024
 * 
 * 
 * Handle when a user interacts with the checkup notification
 */

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Client } = require("discord.js");




/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    // only handling button interactions with the checkup interface
    if (!interaction?.isButton()) return;

    try {
        // user clicked yes, start the survey
        if (interaction.customId === 'checkup-start-btn') {
            const checkupForm = new ModalBuilder()
                .setCustomId('checkup-form-modal')
                .setTitle('How are you doing?');

            const roses = new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setCustomId('checkup-form-roses')
                        .setLabel('What are you proud of today.')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                );

            const thorns = new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setCustomId('checkup-form-thorns')
                        .setLabel('What did you struggle with today.')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                );

            // Survey: who wants this? Personally, I don't.
            // - Arthur
            const buds = new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setCustomId('checkup-form-buds')
                        .setLabel('How do you plan on improving?')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false)
                );

            checkupForm.addComponents(roses, thorns)

            await interaction.showModal(checkupForm);
        }

        // user clicked no, stop bothering them
        else if (interaction.customId === 'checkup-cancel-btn') {
            await interaction.reply(
                {
                    ephemeral: true,
                    content: `Thanks for responding! Make sure to take short breaks and to drink plenty of water!`
                }
            );
        }

        else return; // user didn't interact with either of these buttons, do nothing
    }
    catch (error) {
        console.log(error);
    }
}
