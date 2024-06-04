const { ChannelType, SlashCommandBuilder } = require('discord.js');
const { updateAvailabilityChannel } = require('../../utils/availability');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-availability-channel')
        .setDescription('sets the availability channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The desired availability channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)),

    async execute(_, interaction) {
        try {
            await interaction.deferReply({ ephemeral: false });

            const newChannel = interaction.options.getChannel('channel');
            const reply = await updateAvailabilityChannel(newChannel);

            interaction.editReply(reply);

            // todo future: make it so the channel is saved somewhere, so when the bot goes offline for a bit, messages will still be read when it goes back up
        } catch (error) {
            interaction.editReply({ content: `Error ${error}` });
        }
    }
};
