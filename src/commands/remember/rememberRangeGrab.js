const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const rememberMessagesMethods = require("../../utils/rememberMessages");
const apiCalls = require("../../utils/apiCalls")
const path = require('path');
const { defaultExcludeBotMessages, ephemeral } = require('../../../config.json');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
module.exports = {
    name: 'remember-messages',
    description: 'Remember all messages between two specific messages (inclusively)',
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
            description: `If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages}`,
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    permissionsRequired: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],

    callback: async (_, interaction) => {
        const startMessageId = interaction.options.get('start-message-id').value;
        const endMessageId = interaction.options.get('end-message-id').value;
        const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages;
        const channelId = interaction.options.getString('channel-id') ?? interaction.channel.id;

        try {
            await interaction.deferReply({ ephemeral: ephemeral.rememberEphemeral })

            //make sure channel exist
            const channelObj = await apiCalls.getChannelObject(channelId)

            if (!channelObj) {
                interaction.editReply({
                    content: `Cannot find a channel with the id "${channelId}". Or there was another error`
                });
                return;
            };

            //verify start message is valid
            const startMessageObj = await apiCalls.getMessageObject(channelId, startMessageId);

            if (!startMessageObj) {
                interaction.editReply({
                    content: `Cannot find start message with the id "${startMessageId}". Or there was another error`
                });
                return;
            };

            //verify end message is valid
            const endMessageObj = await apiCalls.getMessageObject(channelId, endMessageId);

            if (!endMessageObj) {
                interaction.editReply({
                    content: `Cannot find end message with the id "${endMessageId}". Or there was another error`
                });
                return;
            };

            //make sure first messages is before second messages
            const startMessageFirst = new Date(startMessageObj.timestamp) < new Date(endMessageObj.timestamp)

            if (!startMessageFirst) {
                interaction.editReply({
                    content: `Error: End message is after start message`
                });
                return;
            }

            //get all of the messages between the start and the end (possibly loop through multiple times)
            const messagesToSave = [];
            let addedEndMessage = false;
            let startId = startMessageId;
            do {

                //get the first 100 messages at a specific point
                const messageObjArray = await apiCalls.getMessagesAfterId(channelId, 100, startId, startId === startMessageId)

                if (!messageObjArray) {
                    interaction.editReply({
                        content: `There was an error getting the messages`
                    });
                    return;
                };

                //sort the message in ascending order of timestamp
                messageObjArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                //push all messages until the last message is in the array, or we go through the entire array
                for (const m of messageObjArray) {
                    startId = m.id;
                    if (m.id === endMessageId) {
                        addedEndMessage = true;
                    }
                    // exclude bot messages if option is enabled
                    if (excludeBotMessages && m.author.bot) {
                        continue;
                    }
                    const message = rememberMessagesMethods.parseMessage(m)
                    messagesToSave.push(message)

                    if(addedEndMessage) {
                        break;
                    }
                }
            } while (!addedEndMessage)

                messagesToSave.forEach(m => console.log(m))
            rememberMessagesMethods.addMessages(messagesToSave)

            //? possibly replace this a to string of the remembered messages saved
            interaction.editReply({
                content: `Success`
            });
            return;
        } catch (error) {
            interaction.editReply(error)
            console.log("Error: " + error)
        }
    }
};