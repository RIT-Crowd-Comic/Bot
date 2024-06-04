const apiCalls = require('./apiCalls');
let rememberedMessages = [];

const addMessage = (message) => { rememberedMessages.push(message); };
const addMessages = (messages) => { rememberedMessages = rememberedMessages.concat(messages); };
const getRememberedMessages = () => { return structuredClone(rememberedMessages); };
const clearRememberedMessages = () => { rememberedMessages = []; };

// parses message api response json to message object 
// including message, who sent it, and what time
// ? assuming that all time are in UTC 
const parseMessage = (message) =>
{
    return {
        author: {
            id:         message.author.id,
            globalName: message.author.global_name ?? message.author.globalName,
        },
        content:   message.content,
        id:        message.id,
        timestamp: message.timestamp ?? message.createdTimestamp
    };
};

// remembers all messages between two messages.
const rememberRangeGrab = async (channelId, startMessageId, endMessageId, excludeBotMessages) =>
{
    try
    {

        // make sure channel exist
        const channelObj = await apiCalls.getChannelObject(channelId);

        if (!channelObj)
        {
            return {
                status:      'Fail',
                description: `Cannot find a channel with the id "${channelId}". Or there was another error`
            };
        }

        // verify start message is valid
        const startMessageObj = await apiCalls.getMessageObject(channelId, startMessageId);

        if (!startMessageObj)
        {
            return {
                status:      'Fail',
                description: `Cannot find start message with the id "${startMessageId}". Or there was another error`
            };
        }

        // verify end message is valid
        const endMessageObj = await apiCalls.getMessageObject(channelId, endMessageId);

        if (!endMessageObj)
        {
            return {
                status:      'Fail',
                description: `Cannot find end message with the id "${endMessageId}". Or there was another error`
            };
        }

        // make sure first messages is before second messages
        const startMessageFirst = new Date(startMessageObj.timestamp) < new Date(endMessageObj.timestamp);

        if (!startMessageFirst)
        {
            return {
                status:      'Fail',
                description: `Error: End message is after start message`
            };
        }

        // get all of the messages between the start and the end (possibly loop through multiple times)
        const messagesToSave = [];
        let addedEndMessage = false;
        let startId = startMessageId;

        do
        {

            // get the first 100 messages at a specific point
            const messageObjArray = await apiCalls.getMessagesAfterId(channelId, 100, startId, startId === startMessageId);

            if (!messageObjArray)
            {
                return {
                    status:      'Fail',
                    description: `There was an error getting the messages`
                };
            }

            // sort the message in ascending order of timestamp
            messageObjArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // push all messages until the last message is in the array, or we go through the entire array
            for (const m of messageObjArray)
            {
                startId = m.id;
                if (m.id === endMessageId)
                {
                    addedEndMessage = true;
                }

                // exclude bot messages if option is enabled
                if (excludeBotMessages && m.author.bot)
                {
                    continue;
                }
                messagesToSave.push(parseMessage(m));

                if (addedEndMessage)
                {
                    break;
                }
            }
        } while (!addedEndMessage);

        // sort messages before being added just for good measure
        messagesToSave.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        addMessages(messagesToSave);

        return { status: 'Success' };

    }
    catch (error)
    {
        return {
            status:      'Fail',
            description: `"Error: ${error}`
        };
    }
};

module.exports = {
    addMessage,
    addMessages,
    getRememberedMessages,
    clearRememberedMessages,
    parseMessage,
    rememberRangeGrab,
};
