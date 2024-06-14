const apiCalls = require('./apiCalls');
const { clamp } = require(`./mathUtils`);
const ms = require('ms'); // converts time to ms
const query = require('../database/queries');
const {Message} = require('../database/models');
let rememberedMessages = [];

//const addMessage = message => { rememberedMessages.push(message); };
const addMessage = message => { query.addMessage(message); };
//const addMessages = messages => { rememberedMessages = rememberedMessages.concat(messages); };

const addMessages = messages => {
    messages.forEach(element => {
        query.addMessage(element);
    });
}

const getRememberedMessages = () => { return Message.findAll(); };

//unused for now, TODO port to SQL
//const clearRememberedMessages = () => { rememberedMessages = []; return { content: 'Success' }; };

// parses message api response json to message object 
// including message, who sent it, and what time
// ? assuming that all time are in UTC 
const parseMessage = message => {
    return {
        user_id:    message.author.id,
        globalName: message.author.global_name ?? message.author.globalName,
        content:   message.content,
        id:        message.id,
        timestamp: message.timestamp ?? message.createdTimestamp
    };
};

// continues saving messages until their time is lesser than given
// we are going into the past to fetch old messages by their timestamps(ms)
const getMessagesByTime = async (channel, pastTime, excludeBotMessages, chunkSize) => {
    let messages = [];
    let startId;
    let messageTime;
    chunkSize = clamp(0, 100, chunkSize);

    do {

        // if startId use it //chunks of 100 is more efficient
        const message = startId ?
            await apiCalls.getNumberMessages(channel, chunkSize, startId) :
            await apiCalls.getNumberMessages(channel, 1);

        // add the message
        // parse the message
        message.forEach(msg => {
            startId = msg.id; // save the message id so we can start there next interaction
            messageTime = msg.createdTimestamp; // save timestamp for comparison

            // exclude bot messages if option is enabled
            if (!(excludeBotMessages && msg.author.bot)) {
                const parsedMessage = parseMessage(msg);

                // save the message
                messages.push(parsedMessage);
            }
        });
    } while (messageTime >= pastTime); // loop until the message timestamp is lower/=  than the past time
    return messages;
};

// grabs a number of messages and saves them to an array, while also returning the last id
const getMessagesAndReturnId = async(messagesToSave, channel, num, excludeBotMessages, startId) =>{
    const messageObjArray = [...await apiCalls.getNumberMessages(channel, num, startId)];

    // return if no array, or if there is not enough messages in the server
    if (!messageObjArray || messageObjArray.length == 0) {
        return undefined;
    }

    messageObjArray
        .filter(([_, msg]) => !(excludeBotMessages && msg.author.bot))
        .map(([_, msg]) => messagesToSave.push(parseMessage(msg)));

    return messageObjArray.at(-1)[1].id;
};

// remembers all messages between two messages.
const rememberRangeGrab = async (channelId, startMessageId, endMessageId, excludeBotMessages) => {
    try {

        // make sure channel exist
        const channelObj = await apiCalls.getChannelObject(channelId);

        if (!channelObj) {
            return {
                status:      'Fail',
                description: `Cannot find a channel with the id "${channelId}". Or there was another error`
            };
        }

        // verify start message is valid
        const startMessageObj = await apiCalls.getMessageObject(channelId, startMessageId);

        if (!startMessageObj) {
            return {
                status:      'Fail',
                description: `Cannot find start message with the id "${startMessageId}". Or there was another error`
            };
        }

        // verify end message is valid
        const endMessageObj = await apiCalls.getMessageObject(channelId, endMessageId);

        if (!endMessageObj) {
            return {
                status:      'Fail',
                description: `Cannot find end message with the id "${endMessageId}". Or there was another error`
            };
        }

        // make sure first messages is before second messages
        const startMessageFirst = new Date(startMessageObj.timestamp) < new Date(endMessageObj.timestamp);

        if (!startMessageFirst) {
            return {
                status:      'Fail',
                description: `Error: End message is after start message`
            };
        }

        // get all of the messages between the start and the end (possibly loop through multiple times)
        const messagesToSave = [];
        let addedEndMessage = false;
        let startId = startMessageId;

        do {

            // get the first 100 messages at a specific point
            const messageObjArray = await apiCalls.getMessagesAfterId(channelId, 100, startId, startId === startMessageId);

            if (!messageObjArray) {
                return {
                    status:      'Fail',
                    description: `There was an error getting the messages`
                };
            }

            // sort the message in ascending order of timestamp
            messageObjArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // push all messages until the last message is in the array, or we go through the entire array
            for (const m of messageObjArray) {
                startId = m.id;
                if (m.id === endMessageId) {
                    addedEndMessage = true;
                }

                // exclude bot messages if option is enabled
                if (excludeBotMessages && m.author.bot) {
                    continue;
                }
                messagesToSave.push(parseMessage(m));

                if (addedEndMessage) {
                    break;
                }
            }
        } while (!addedEndMessage);

        // sort messages before being added just for good measure
        messagesToSave.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        addMessages(messagesToSave);

        return { status: 'Success' };

    }
    catch (error) {
        return {
            status:      'Fail',
            description: `"Error: ${error}`
        };
    }
};

const rememberOneMessage = async(channelId, messageId) =>{
    const msg = await apiCalls.getMessageObject(channelId, messageId);

    // parse the message
    const parsedMessage = parseMessage(msg);

    // save the message
    addMessage(parsedMessage);

    return {
        content:   `Remembered: "${msg.content}"`,
        ephemeral: false
    };
};

const rememberPast = async (numberOfHours, numberOfMinutes, channel, excludeBotMessages, accuracy) =>{

    // get the current time TIMESTAMP is a ms
    const currentTime = Date.now();

    // get the time in x minutes
    const hours = ms(numberOfHours);
    const minutes = ms(numberOfMinutes);

    // subtract minutes from current time to get the time to loop to
    const pastTime = currentTime - (hours + minutes);

    // call the method to save until the message time < pastTime
    const messagesToSave = await getMessagesByTime(channel, pastTime, excludeBotMessages, accuracy);

    messagesToSave.forEach(m => console.log(m));
    addMessages(messagesToSave);

    // show that it saved
    return {
        content:   `Remembered the last "${numberOfHours} hours ${numberOfMinutes} minutes"`,
        ephemeral: false,
    };
};

const rememberNumber = async (numberOfMessages, channel, excludeBotMessages) =>{
    let startId;
    let messagesToSave = [];
    let num = numberOfMessages;


    // check if over 100, if so loop to continue grabbing messages
    if (num > 100) {
        startId = await getMessagesAndReturnId(messagesToSave, channel, 100, excludeBotMessages);

        num -= 100;

        while (num / 100 >= 1) {
            startId = await getMessagesAndReturnId(messagesToSave, channel, 100, excludeBotMessages, startId);
            num -= 100;
        }

        if (num > 0)
            await getMessagesAndReturnId(messagesToSave, channel, num, excludeBotMessages, startId);
    }
    else {
        await getMessagesAndReturnId(messagesToSave, channel, num, excludeBotMessages);
    }

    messagesToSave.forEach(m => console.log(m));
    addMessages(messagesToSave);


    return {
        content:   `Remembered the last "${numberOfMessages} messages"`,
        ephemeral: false,
    };
};

// global scope
let rememberMessageObj = undefined;

const startRemembering = async (channel, excludeBotMessages, ephemeral) =>{
    const rememberingMessage = rememberMessageObj;

    // if already remembering a channel, tell the user to stop remembering to use this command
    if (rememberingMessage) {
        return { content: `Already remembering in ${rememberMessageObj.id}. Use "/stop-remembering" to stop remembering.` };
    }

    const { last_message_id, name } = await apiCalls.getChannelObject(channel.id);
    const obj = {
        id: channel.id, last_message_id: last_message_id, name: name, excludeBotMessages: excludeBotMessages, ephemeral: ephemeral
    };
    rememberMessageObj = obj;

    return {
        content: `Starting to remember messages in <#${channel}>."`,
        obj:     obj
    };
};

const stopRemembering = async () =>{
    const obj = rememberMessageObj;


    // if a message is not being remembered, send a waring message
    if (!obj) {
        return { content: `No channel is being remembered. Use "start-remembering" to start remember messages in a channel` };
    }

    const channelObj = await apiCalls.getChannelObject(obj.id);
    const rememberRangeGrabResponse = await rememberRangeGrab(obj.id, obj.last_message_id, channelObj.last_message_id, obj.excludeBotMessages, false);
    if (rememberRangeGrabResponse.status === 'Fail') {
        return { content: rememberRangeGrabResponse.description };
    }

    // make rememberMessageObj undefined
    rememberMessageObj = undefined;

    return { content: 'success' };
};



module.exports = {
    addMessage,
    addMessages,
    getRememberedMessages,
    parseMessage,
    rememberRangeGrab,
    rememberOneMessage,
    rememberPast,
    rememberNumber,
    startRemembering,
    stopRemembering
};
