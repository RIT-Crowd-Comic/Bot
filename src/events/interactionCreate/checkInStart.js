/**
 * Handle when a user interacts with the check in notification
 */
const {
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder
} = require('discord.js');
const { sendCheckInReminder } = require('../../utils/schedule');


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
            .addComponents(new TextInputBuilder()
                .setCustomId('check-in-form-roses')
                .setLabel('What are you proud of today?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false));

        const thorns = new ActionRowBuilder()
            .addComponents(new TextInputBuilder()
                .setCustomId('check-in-form-thorns')
                .setLabel('What did you struggle with today?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false));

        const buds = new ActionRowBuilder()
            .addComponents(new TextInputBuilder()
                .setCustomId('check-in-form-buds')
                .setLabel('How do you want to improve?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false));

        checkInForm.addComponents(roses, thorns, buds);

        interaction.showModal(checkInForm);
    }

    // remind me later button -> snoozes message for 2h
    else if (interaction.customId === 'check-in-later-btn') {

        await interaction.deferReply({ ephemeral: true });

        setTimeout(()=>{ sendCheckInReminder(client, interaction.user.id); }, 2 * 60 * 60 * 1000);// sends another reminder in 2 hours

        await interaction.editReply({
            ephemeral: true,
            content:   `The reminder has been snoozed for 2 hours`
        });

        // deletes origional reminder message
        interaction.message.delete()
            .catch(() => {
                interaction.followUp({
                    ephemeral: true,
                    content:   `*Issue deleting original message*`
                });
            });
    }

    // user clicked no, stop bothering them
    else if (interaction.customId === 'check-in-cancel-btn') {

        await interaction.reply({
            ephemeral: true,
            content:   `You have skipped today's check-in. Make sure to take short breaks and to drink plenty of water!`
        });

        // deletes origional reminder message
        interaction.message.delete()
            .catch(() => {
                interaction.followUp({
                    ephemeral: true,
                    content:   `*Issue deleting original message*`
                });
            });
    }
    else return; // user didn't interact with either of these buttons, do nothing
};
