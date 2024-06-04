const { SlashCommandBuilder, } = require('discord.js');
const { getServerUser, addRoleAPI } = require('../../utils/apiCalls')
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
//Shows buttons for roles on command
//NOTE the bot has to have a higher role than others to properly assign roles
module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Add/remove unavailable role')

        //add role
        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Adds the unavailable role to a specific user')
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription('The user that will get the unavailable role')
                )
        )

        //remove role
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Removes the unavailable role to a specific user')
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription('The user that will be removed of the unavailable role')
                )
        ),

    options:
    {
        devOnly: true,
        testOnly: false,
        deleted: false,
    },

    //logic, 
    async execute(client, interaction) {
        await interaction.deferReply();

        const action = {
            'add': () => addRole(interaction),
            'remove': () => removeRole(interaction),
        };

        try {
            const subcommand = interaction.options.getSubcommand();

            action[subcommand]();
        }
        catch (error) {
            await interaction.editReply({
                content: `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};

const addRole = async (interaction) => {
    try {
        //if the user wasn't given, assume the user is the person calling the command
        const user = interaction.options.getUser('user') ?? interaction.member.user;
        const roles = interaction.guild.roles.cache;
        const unavailableRole = roles.find(role => role.name.toLowerCase() === 'unavailable')
        const serverId = process.env.TESTSERVER_ID;

        //make sure a role called 'unavailable' exists
        if (!unavailableRole) {
            interaction.editReply({
                content: `No role named "unavailable" exists`
            });
            return;
        }

        //don't give the role to a bot
        if (user.bot) {
            interaction.editReply({
                content: `Can't assign roles to bots (<@${user.id}>)`
            });
            return
        }
        //don't give the role to someone who already has it
        const serverUser = await getServerUser(serverId, user.id);

        //todo: test if this actually pings people
        if (serverUser.roles.some((id => id === unavailableRole.id))) {
            interaction.editReply({
                content: `<@${user.id}> already has the unavailable role`
            });
            return;
        }
        //add the role to the user
        const response = await addRoleAPI(serverId, user.id, unavailableRole.id)
        const content = response.status === 'Success' ? 'Success' : response.description;
        interaction.editReply({
            content: content
        });
    }

    catch (error) {

    }

}

const removeRole = async (interaction) => {
    //todo: if a user wasn't given, assume it was the person who ran the command

    //todo: make sure the role exists

    //todo: make sure the person is being called has the role

    //todo: remove the role
}