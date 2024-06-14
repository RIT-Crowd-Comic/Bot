const {
    ActionRowBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, PermissionFlagsBits, SlashCommandBuilder
} = require('discord.js');
const scheduleUtils = require('../../utils/schedule');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-in')
        .setDescription('Add/remove/view your check in schedules')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addSubcommand(subcommand => subcommand
            .setName('schedule')
            .setDescription('Schedule a day and time to be notified')
            .addStringOption(option =>
                option.setName('days')
                    .setDescription('The name of days can be abbreviated as "m t w (th or h) f sa su". Ex: "Monday w f" or "daily"')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('Time of day. Ex: 12:30 am')
                    .setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('view')
            .setDescription('View your check-in schedules'))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('See a list of schedules to remove'))
        .addSubcommand(subcommand => subcommand
            .setName('responses')
            .setDescription('See all the check in responses (admin only)')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user you would like to see check ins of'))),

    async execute(_, interaction) {
        try {
            const action = {
                'view':      () => viewSchedules(interaction),
                'schedule':  () => addScheduleCheckIn(interaction),
                'remove':    () => remove(interaction),
                'responses': () => viewResponses(interaction)
            };

            action[interaction.options.getSubcommand()]();
        }

        catch (error) {
            console.log(`${error} ${error.message}`);
        }
    }
};

const viewSchedules = async (interaction) => {
    await interaction.deferReply();

    try {
        const user = interaction.member.user;
        const response = scheduleUtils.getSchedules(user);

        if (response.status === 'Fail') {
            await interaction.editReply({ content: response.description });
            return;
        }

        const schedules = response.schedules;
        const row = new ActionRowBuilder();

        const scheduleDropdown =
            new StringSelectMenuBuilder()
                .setCustomId('show-schedule-dropdown')
                .addOptions(schedules.map((s, i) =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(s)
                        .setValue(`${i}`)))
                .setMinValues(0)
                .setMaxValues(schedules.length);

        row.addComponents(scheduleDropdown);

        await interaction.editReply({
            content:    `Here are your schedules`,
            components: [row]
        });
    }
    catch (error) {
        await interaction.editReply({ content: `${error} ${error.message}`, });
    }
};

const addScheduleCheckIn = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.member.user;
    const rawDays = interaction.options.get('days').value;
    const rawTime = interaction.options.get('time').value;

    const response = scheduleUtils.scheduleCheckIn(user, rawDays, rawTime);

    await interaction.editReply({ content: response.description });


};

const remove = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.member.user;

    try {
        const response = scheduleUtils.getScheduleObjs(user);

        if (response.status === 'Fail') {
            await interaction.editReply({ content: response.description });
            return;
        }

        const schedules = response.schedules;

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


    }
    catch (error) {
        await interaction.editReply({ content: `${error} ${error.message}`, });
    }

};

const viewResponses = async (interaction) => {
    await interaction.deferReply({ ephemeral: false });
    const user = interaction.options.getUser('user');
    const commandUser = interaction.member.user;
    const response = await scheduleUtils.viewCheckInResponses(user, commandUser);
    if (response.status === 'Fail') {
        await interaction.editReply({ content: response.description });
        return;
    }

    const filePath = './src/checkInResponses.txt';
    let content = '';
    for (const r of response.responses) {
        content += await scheduleUtils.displayResponse(r) + `\n\n`;

        // delay to slow down requests


    }
    await interaction.editReply({ content: 'responses sent in dms' });

    // send the json
    fs.writeFile(filePath, content, err => err && console.error(err));
    await interaction.user.send({
        content: response.description,
        files:   [
            {
                attachment: filePath,
                name:       './src/checkInResponses.txt'
            }
        ]
    });
};
