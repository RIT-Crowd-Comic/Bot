const { version } = require('../../config.json')
const getBaseUrl = () => { return `https://discord.com/api/${version}` }

//helper method for discord get requests
const getAPICall = async (url, body = {
    method: 'GET',
    headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
    },
}) => {
    return await fetch(url, body
    ).then(response => {
        if (response.status != 200) {
            console.log(`There was an error: ${response.status} ${response.statusText}`)
            return undefined;
        } else {
            return response.json();
        }
    });
}

const getChannelObject = async (channelId) => {
    return await getAPICall(`${getBaseUrl()}/channels/${channelId}`);
}

const getMessageObject = async (channelId, messageId) => {
    return await getAPICall(`${getBaseUrl()}/channels/${channelId}/messages/${messageId}`)
}

//get {limit} (max 100) messages in channel with {channelId} after messages with {afterId}
//if {addFirstMessage} is true, the message with the id of {afterId} will be added (does not count towards limit)
const getMessagesAfterId = async (channelId, limit, afterId, addFirstMessage = false) => {
    const messages = await getAPICall(`${getBaseUrl()}/channels/${channelId}/messages?limit=${limit}&after=${afterId}`)
    if (addFirstMessage) {
        const firstMessage = await getMessageObject(channelId, afterId);
        if (!firstMessage) {
            //? probably need some sort of way to say what went wrong
            return undefined;
        }
        messages.push(firstMessage)
    }
    return messages;
}

//returns the id of the message at the final index
const getNumberMessages = async(channel, numberToSave, id) =>{
    let messages;

    //if id begin there
    if (id) 
        messages = await channel.messages.fetch({ cache: false, limit: numberToSave, before: id });
    else
        messages = await channel.messages.fetch({ cache: false, limit: numberToSave});
            
    return messages;
}


module.exports = {
    getChannelObject,
    getMessageObject,
    getMessagesAfterId,
    getNumberMessages
}