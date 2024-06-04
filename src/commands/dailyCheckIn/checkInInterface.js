const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

/**
 * Initiate a prompt allowing users to create a scheduler.
 */

const fakecheckInDatabase = {}
const makeDefaultUserSettings = (userTag, userId) => {
    return {
        tag: userTag,
        id: userId,
        notificationDays: {
            monday: { notify: false },
            tuesday: { notify: false },
            wednesday: { notify: false },
            thursday: { notify: false },
            friday: { notify: false },
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-in-interface')
        .setDescription('Create an interface for users to schedule their check ins')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    options:
    {
        devOnly: false,
        testOnly: false,
        deleted: false,
        fakecheckInDatabase: fakecheckInDatabase,
        makeDefaultUserSettings : makeDefaultUserSettings
    },


    //logic, 
    async execute(client, interaction) {

        try {
            await interaction.deferReply();
            const actions = new ActionRowBuilder();
            const testBtn = new ButtonBuilder()
                .setCustomId('check-in-btn')
                .setLabel('Schedule check in Right Now')
                .setStyle(ButtonStyle.Secondary);

            actions.addComponents(testBtn);

            interaction.editReply({
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
    fakecheckInDatabase,
    makeDefaultUserSettings
}