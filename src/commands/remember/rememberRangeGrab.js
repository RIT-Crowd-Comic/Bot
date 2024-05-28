const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const remeberMessagesUtils = require("../../utils/rememberMessages");
const apiCalls = require("../../utils/apiCalls")
const path = require('path');
const { defaultExcludeBotMessages, ephemeral } = require('../../../config.json');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
module.exports = {
    name: 'remember-messages',
    description: 'Remember all messages between two specific messages (inclusivley)',
    options: [
        {
            name: 'start-message-id',
            description: "the first message's id",
            required: true,
            type: ApplicationCommandOptionType.String,

        },
        {
            name: 'end-message-id',
            description: "the second message's id",
            required: true,
            type: ApplicationCommandOptionType.String,

        },
        {
            name: 'channel-id',
            description: 'the id of the channel the messages are in. Default is the channel the command was ran',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'exclude-bot-messages',
            description: `If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.rememberRangeGrab}`,
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    permissionsRequired: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],

    callback: async (client, interaction) => {
        const startMessageId = interaction.options.get('start-message-id').value;
        const endMessageId = interaction.options.get('end-message-id').value;
        const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.rememberRangeGrab;
        const channelId = interaction.options.getString('channel-id') ?? interaction.channel.id;

        try {
            await interaction.deferReply({ ephemeral: ephemeral.rememberEphemeral })
            const rememberRangeGrabResponse = await remeberMessagesUtils.rememberRangeGrab(channelId, startMessageId, endMessageId, excludeBotMessages)
            if (rememberRangeGrabResponse.status === "Fail") {
                interaction.editReply({
                    content: rememberRangeGrabResponse.description
                });
                return;
            }

            interaction.editReply({
                content: rememberRangeGrabResponse.status
            })
        } catch (error) {
            interaction.editReply(error)
            console.log("Error: " + error)
        }
    }
};