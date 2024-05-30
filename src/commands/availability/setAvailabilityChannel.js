const { ApplicationCommandOptionType } = require('discord.js');
const { getAvailabilityChannelId, setAvailabilityChannelId } = require('../../utils/availability');
const { getServers, getServerChannels } = require('../../utils/apiCalls');
module.exports = {
    name: 'set-availability-channel',
    description: 'sets the availability channel',
    options: [
        {
            name: 'channel-id',
            description: 'The id of the availability channel',
            required: true,
            type: ApplicationCommandOptionType.String,
        }
    ],

    //logic
    callback: async (_, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: false })
            const oldId = getAvailabilityChannelId();
            const newId = interaction.options.getString('channel-id');
            //check if new id is the same as the current one
            if (oldId === newId) {
                interaction.editReply({
                    content: `<#${newId}> is already the availability channel`
                })
                return;
            }

            //check if new id goes to any of the channels found in the server
            //? Assumes that the bot is only in this server. This will not work if this bot is in another server. Most likely needs a refactor sooner than later
            const servers = await getServers();
            const allChannels = await getServerChannels(servers[0].id);
            if (!allChannels.some((channel) => channel.id === newId)) {
                interaction.editReply({
                    content: `Cannot find a channel with the id of "${newId}"`
                })
                return;
            }

            //set the new id as the current one
             setAvailabilityChannelId(newId)
            interaction.editReply({
                content: `<#${newId}> is the new availability channel`
            })

            //todo future: make it so this is saved somewhere, so when the bot goes offline for a bit, messages will still be read when it goes back up
        } catch (error) {
            interaction.editReply({
                content: `Error ${error}`
            })
        }

    }
};
