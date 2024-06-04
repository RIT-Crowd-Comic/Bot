/**
 * 
 * This command should be called one time in a dedicated channel where only the bot can send messages.
 * Prompt the user to schedule a time for the bot to send a quick checkin survey.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) =>
{



    // only deal with the check in button, ignore all other button presses
    if (interaction.customId?.startsWith('check-in-btn'))
    {
        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.user.id;
        let reply = [
            `<@${userId}>`,
            '',
            '',
            'Would you like to spend a few minutes to describe how you\'re doing? ',
            'Feel free to leave any fields blank. ',
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
        const laterBtn = new ButtonBuilder()
            .setCustomId('check-in-later-btn')
            .setLabel('Remind Me Later')
            .setStyle(ButtonStyle.Secondary);
        const notNowBtn = new ButtonBuilder()
            .setCustomId('check-in-cancel-btn')
            .setLabel('Not Today')
            .setStyle(ButtonStyle.Secondary);

        actions.addComponents(yesBtn, laterBtn, notNowBtn);

        try
        {
            await interaction.editReply({
                content:    reply,
                components: [actions]
            });

        }
        catch
        {
            await interaction.editReply({ content: 'could not process command' });
        }
    }
};
