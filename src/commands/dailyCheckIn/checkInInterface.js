const {
    SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder
} = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-in-interface')
        .setDescription('Create an interface for users to schedule their check ins')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    options:
    {
        devOnly:  true,
        testOnly: true,
        deleted:  false,
    },


    // logic, 
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
                content:    `Hello, I am ${client.user.username}. I am here to help users stay on task and maintain a healthy workflow.\n\n__Schedule feedback__\n\nClick below to force a check in as if it were scheduled for now.`,
                components: [actions]
            });
        }
        catch (error) {
            console.log(error);
        }

    },
};
