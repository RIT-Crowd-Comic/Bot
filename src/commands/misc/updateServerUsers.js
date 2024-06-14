const { SlashCommandBuilder } = require('discord.js');
const serverUsersUtils = require('../../utils/serverUsers');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
module.exports = {
    data: new SlashCommandBuilder()
        .setName('update-server-list')
        .setDescription('Updates the list of users in the server'),


    // logic, 
    async execute(_, interaction) {
        try {
            await interaction.deferReply();
            await serverUsersUtils.updateServerUsers(process.env.TESTSERVER_ID, false);
            const users = await serverUsersUtils.getServerUsers();
            interaction.editReply(`Updated. There are **${users.length}** users including bots.`);
        }
        catch (error) {
            await interaction.editReply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
