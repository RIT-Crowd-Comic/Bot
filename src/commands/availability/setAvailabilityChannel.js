const { ApplicationCommandOptionType, ChannelType } = require('discord.js');
const { getAvailabilityChannel, setAvailabilityChannel } = require('../../utils/availability');
const { getServers, getServerChannels } = require('../../utils/apiCalls');
module.exports = {
    name: 'set-availability-channel',
    description: 'sets the availability channel',
    options: [
        {
            name: 'channel',
            description: 'The desired availability channel',
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ChannelType.GuildText]
        }
    ],

    //logic
    callback: async (_, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: false })

            const oldChannel = getAvailabilityChannel();
            const newChannel = interaction.options.getChannel('channel');

            //check if new id is the same as the current one
            if (oldChannel && oldChannel.id === newChannel.id) {
                interaction.editReply({
                    content: `<#${oldChannel.id}> is already the availability channel`
                })
                return;
            }

            //set the new channel as the current one
            setAvailabilityChannel(newChannel)
            interaction.editReply({
                content: `<#${newChannel.id}> is the new availability channel`
            })

            //todo future: make it so the channel is saved somewhere, so when the bot goes offline for a bit, messages will still be read when it goes back up
        } catch (error) {
            interaction.editReply({
                content: `Error ${error}`
            })
        }

    }
};
