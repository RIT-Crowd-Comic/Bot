const { ChannelType, SlashCommandBuilder } = require('discord.js');
const { getAvailabilityChannel, setAvailabilityChannel } = require('../../utils/availability');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-availability-channel')
        .setDescription('sets the availability channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The desired availability channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)),

    // todo: If options is not provided, the bot should assume false (or undefined) for all values
    options:
    {
        devOnly:  false,
        testOnly: false,
        deleted:  false,
    },

    async execute(_, interaction)
    {
        try
        {
            await interaction.deferReply({ ephemeral: false });

            const oldChannel = await getAvailabilityChannel();
            const newChannel = interaction.options.getChannel('channel');

            // check if new id is the same as the current one
            if (oldChannel && oldChannel.id === newChannel.id)
            {
                interaction.editReply({ content: `<#${oldChannel.id}> is already the availability channel` });
                return;
            }

            // set the new channel as the current one
            setAvailabilityChannel(newChannel);
            interaction.editReply({ content: `<#${newChannel.id}> is the new availability channel` });

            // todo future: make it so the channel is saved somewhere, so when the bot goes offline for a bit, messages will still be read when it goes back up
        }
        catch (error)
        {
            interaction.editReply({ content: `Error ${error}` });
        }
    }
};
