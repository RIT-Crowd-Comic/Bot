const { SlashCommandBuilder, } = require('discord.js');
const path = require('path');
const rolesUtils = require('../../utils/roles');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Shows buttons for roles on command
// NOTE the bot has to have a higher role than others to properly assign roles
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Add/remove unavailable role')

        // add role
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Adds the unavailable role to a specific user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user that will get the unavailable role')))

        // remove role
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes the unavailable role to a specific user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user that will be removed of the unavailable role'))),

    options:
    {
        devOnly:  true,
        testOnly: false,
        deleted:  false,
    },

    // logic, 
    async execute(client, interaction)
    {
        await interaction.deferReply();

        const action = {
            'add':    () => addRole(interaction),
            'remove': () => removeRole(interaction),
        };

        try
        {
            const subcommand = interaction.options.getSubcommand();

            action[subcommand]();
        }
        catch (error)
        {
            await interaction.editReply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};

const addRole = async (interaction) =>
{
    try
    {

        // if the user wasn't given, assume the user is the person calling the command
        const user = interaction.options.getUser('user') ?? interaction.member.user;
        const response = await rolesUtils.addUnavailableRole(user);
        const content = response.status === 'Success' ? 'Success' : response.description;
        interaction.editReply({ content: content });
    }

    catch (error)
    {
        interaction.editReply({ content: `${error}` });
    }
};

const removeRole = async (interaction) =>
{
    try
    {

        // if a user wasn't given, assume it was the person who ran the command
        const user = interaction.options.getUser('user') ?? interaction.member.user;
        const response = await rolesUtils.removeUnavailableRole(user);
        const content = response.status === 'Success' ? 'Success' : response.description;
        interaction.editReply({ content: content });
    }
    catch (error)
    {
        interaction.editReply({ content: `${error}` });
    }
};
