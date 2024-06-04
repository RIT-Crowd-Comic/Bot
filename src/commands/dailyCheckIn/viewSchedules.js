const {
    ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits, SlashCommandBuilder
} = require('discord.js');
const { displaySchedule } = require('../../utils/schedule');
const scheduleCheckIn = require('./scheduleCheckIn');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-check-in-schedules')
        .setDescription('View your check-in schedules')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    options: {
        devOnly:  false,
        testOnly: false,
        deleted:  false
    },

    /**
     *  Remove a user's schedule
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    async execute (client, interaction) {
        const userId = interaction?.user?.id;

        await interaction.deferReply({ ephemeral: true });

        // command should include a user
        if (userId === undefined) {
            await interaction.editReply({ content: '*Could not process command*' });
            return;
        }

        try {
            if (scheduleCheckIn.fakeScheduleEntry[userId] === undefined) {
                await interaction.editReply({ content: '*You have no schedules! Create one with `/schedule-check-in`*' });
                return;
            }


            const schedules = scheduleCheckIn
                .fakeScheduleEntry[userId]
                ?.schedules
                ?.map(s => displaySchedule(s));

            const row1 = new ActionRowBuilder();

            // show schedules as a dropdown
            const scheduleDropdown =
                new StringSelectMenuBuilder()
                    .setCustomId('show-schedule-dropdown')
                    .addOptions(schedules.map(s =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(s)
                            .setValue(s)))
                    .setMinValues(0)
                    .setMaxValues(schedules.length);

            row1.addComponents(scheduleDropdown);

            await interaction.editReply({
                content:    `Here are your schedules`,
                components: [row1]
            });

        } catch (error) {
            if (error.name === 'ScheduleError') {
                await interaction.editReply({ content: `*${error.message}*`, });
            } else {
                await interaction.editReply({ content: `*Issue running command*`, });
            }
        }
    }

};
