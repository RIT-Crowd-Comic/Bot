const {
    PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder
} = require('discord.js');
const scheduleCheckIn = require('./scheduleCheckIn');
const { displaySchedule } = require('../../utils/schedule');
const { ActionRowBuilder } = require('@discordjs/builders');


module.exports = {

    data: new SlashCommandBuilder()
        .setName('remove-check-in-schedule')
        .setDescription('See a list of schedules to remove')
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
            const schedules = scheduleCheckIn.fakeScheduleEntry[userId]?.schedules?.map(s => (
                {
                    name:     displaySchedule(s),
                    schedule: s
                }
            ));

            const row1 = new ActionRowBuilder();
            const row2 = new ActionRowBuilder();
            const scheduleDropdown =
                new StringSelectMenuBuilder()
                    .setCustomId('remove-schedule-dropdown')
                    .addOptions(schedules.map((s, i) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(s.name)
                            .setValue(`${i}`)))
                    .setMinValues(0)
                    .setMaxValues(schedules.length);
            const removeButton = new ButtonBuilder()
                .setCustomId('remove-schedule-btn')
                .setLabel('Remove Schedule')
                .setStyle(ButtonStyle.Danger);
            row1.addComponents(scheduleDropdown);
            row2.addComponents(removeButton);

            await interaction.editReply({
                content:    `Select a schedule to remove`,
                components: [row1, row2]
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
