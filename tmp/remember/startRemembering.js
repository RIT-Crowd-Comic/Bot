const { ApplicationCommandOptionType, PermissionFlagsBits, ActivityType } = require('discord.js');
const remeberMessagesUtils = require("../../utils/rememberMessages");
const apiCalls = require("../../utils/apiCalls")
const path = require('path');
const { defaultExcludeBotMessages, ephemeral } = require('../../../config.json');
const excludeBotMessagesDefaultSetting = defaultExcludeBotMessages.startRemember;

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
module.exports = {
    name: 'start-remembering',
    description: 'Start remembering message in a specific channels',
    options: [
        {
            name: 'channel-id',
            description: 'the id of the channel the messages are in. Default is the channel the command was ran',
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'exclude-bot-messages',
            description: `If bot messages should be excluded in the message collection. Default is ${excludeBotMessagesDefaultSetting}`,
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    permissionsRequired: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: ephemeral.startRemember })
            const rememberingMessage = remeberMessagesUtils.rememberMessageObj;

            //if already remembering a channel, tell the user to stop remembering to use this command
            if (rememberingMessage) {
                await interaction.editReply({
                    content: `Already remembering in <#${remeberMessagesUtils.rememberMessageObj.id}>. Use "/stop-remembering" to stop remembering.`
                });
                return;
            }

            //start remembering messages from the last message in the channel
            const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? excludeBotMessagesDefaultSetting;
            const channelId = interaction.options.getString('channel-id') ?? interaction.channel.id;
            const { last_message_id, name } = await apiCalls.getChannelObject(channelId)
            const obj = { id: channelId, last_message_id: last_message_id, name: name, excludeBotMessages: excludeBotMessages, ephemeral: ephemeral.startRemember }
            remeberMessagesUtils.rememberMessageObj = obj;
            await interaction.editReply({
                content: `Starting to remember messages in <#${channelId}>."`
            });

            //change the status of the bot to say which channel it's remembering from
            client.user.setActivity({
                name: `Remembering #${obj.name}`,
                type: ActivityType.Custom
            })
        }

        catch (error) {
            interaction.editReply(error)
            console.log("Error: " + error)
        }
    }
};