const getAllTextChannels = require('./getAllTextChannels');
const apiCalls = require("./apiCalls")
let rememberedMessages = []

const addMessage = (message) => { rememberedMessages.push(message); }
const addMessages = (messages) => { rememberedMessages = rememberedMessages.concat(messages); }
const getRememberedMessage = () => { return rememberedMessages }
const clearRememeberedMessage = () => { rememberedMessages = [] }
let rememberMessageObj = undefined;
// {
//     id:
//     last_message_id:
//     name: 
// }

//parses message api response json to message object 
//including message, who sent it, and what time
//? assuming that all time are in UTC 
const parseMessage = (message) => {
    return {
        author: {
            id: message.author.id,
            globalName: message.author.global_name ?? message.author.globalName,
        },
        content: message.content,
        id: message.id,
        timestamp: message.timestamp ?? message.createdTimestamp
    }
}

//returns the id of the message at the final index
const saveNumberMessages = async (numberToSave, channel, id) => {
    let messages;
    //get the messages

    //if id begin there
    if (id)
        messages = await channel.messages.fetch({ cache: false, limit: numberToSave, before: id });
    else
        messages = await channel.messages.fetch({ cache: false, limit: numberToSave });

    //loop for each message
    //using a amalgamation of a for + foreach to keep track
    //feel free to refactor!!!
    let i = 1;
    let returnId;
    messages.forEach((msg) => {

        //parse the message
        const parsedMessage = parseMessage(msg);

        //save the message
        addMessage(parsedMessage);

        //return the index if its the final one
        if (i == numberToSave)
            returnId = msg.id;
        i++;
    });
    return returnId;
}

//continues saving messages until their time is lesser than given
//we are going into the past to fetch old messages by their timestamps(ms)
const saveMessagesTime = async (channel, pastTime, chunkSize) => {
    let message;
    let startId;
    let messageTime;
    if (chunkSize > 100) chunkSize = 100;

    do {
        //if startId use it //chunks of 100 is more efficient
        if (startId)
            message = await channel.messages.fetch({ cache: false, limit: chunkSize, before: startId });
        else
            message = await channel.messages.fetch({ cache: false, limit: 1 });

        //add the message
        //parse the message
        //may be a better way, but message is a map, so using foreach to iterate to get at the object
        message.forEach((msg) => {
            startId = msg.id; //save the message id so we can start there next iteraction
            messageTime = msg.createdTimestamp; //save timestamp for comparison

            const parsedMessage = parseMessage(msg);

            //save the message
            addMessage(parsedMessage);
        })
    } while (messageTime >= pastTime); //loop until the message timestamp is lower/=  than the past time
}

//remembers all messages between two messages.
const rememberRangeGrab = async (channelId, startMessageId, endMessageId, excludeBotMessages) => {
    try {
        //make sure channel exist
        const channelObj = await apiCalls.getChannelObject(channelId)

        if (!channelObj) {
            return {
                status: "Fail",
                description: `Cannot find a channel with the id "${channelId}". Or there was another error`
            }
        }

        //verify start message is valid
        const startMessageObj = await apiCalls.getMessageObject(channelId, startMessageId);

        if (!startMessageObj) {
            return {
                status: "Fail",
                description: `Cannot find start message with the id "${startMessageId}". Or there was another error`
            }
        }

        //verify end message is valid
        const endMessageObj = await apiCalls.getMessageObject(channelId, endMessageId);

        if (!endMessageObj) {
            return {
                status: "Fail",
                description: `Cannot find end message with the id "${endMessageId}". Or there was another error`
            }
        }

        //make sure first messages is before second messages
        const startMessageFirst = new Date(startMessageObj.timestamp) < new Date(endMessageObj.timestamp)

        if (!startMessageFirst) {
            return {
                status: "Fail",
                description: `Error: End message is after start message`
            }
        }

        //get all of the messages between the start and the end (possilby loop through multiple times)
        const messagesToSave = [];
        let addedEndMessage = false;
        let startId = startMessageId;

        do {

            //get the first 100 messages at a specifc point
            const messageObjArray = await apiCalls.getMessagesAfterId(channelId, 100, startId, startId === startMessageId)

            if (!messageObjArray) {
                return {
                    status: "Fail",
                    description: `There was an error getting the messages`
                }
            };

            //sort the message in ascending order of timestamp
            messageObjArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            //push all messages until the last message is in the array, or we go through the entire array
            for (const m of messageObjArray) {
                startId = m.id;
                if (m.id === endMessageId) {
                    addedEndMessage = true;
                }
                // exlude bot messages if option is enabled
                if (excludeBotMessages && m.author.bot) {
                    continue;
                }
                const message = parseMessage(m);
                messagesToSave.push(message);

                if (addedEndMessage) {
                    break;
                }
            }
        } while (!addedEndMessage)

        //sort messages before being added just for good measure
        messagesToSave.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        addMessages(messagesToSave)

        return { status: "Success" }

    } catch (error) {
        return {
            status: "Fail",
            description: `"Error: ${error}`
        }
    }
}

module.exports = {
    addMessage,
    addMessages,
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
    saveNumberMessages,
    saveMessagesTime,
    rememberRangeGrab,
    rememberMessageObj
}