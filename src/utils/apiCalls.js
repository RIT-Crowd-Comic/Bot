const { version } = require('../../config.json')
const getBaseUrl = () => { return `https://discord.com/api/${version}` }


//todo: make a function that deals with all the get requests that takes a url as a parameter
//helper parameter to get get request
const getAPICall = async (url, body) => {
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
    return await getAPICall(`${getBaseUrl()}/channels/${channelId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
            },
        });
}

const getMessageObject = async (channelId, messageId) => {
    return await getAPICall(`${getBaseUrl()}/channels/${channelId}/messages/${messageId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
            },
        }
    )
}

//get {limit} (max 100) messages in channel with {channelId} after messages with {afterId}
//if {addFirstMessage} is true, the message with the id of {afterId} will be added (does not count towards limit)
const getMessagesAfterId = async (channelId, limit, afterId, addFirstMessage = false) => {
    const messages = await getAPICall(`${getBaseUrl()}/channels/${channelId}/messages?limit=${limit}&after=${afterId}`,
    {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
        },
    })

    if(addFirstMessage) {
        const firstMessage = await getMessageObject(channelId, afterId);
        if(!firstMessage) {
            // ? probably need some sort of way to say what went wrong
            return undefined;
        }
        


        messages.push(firstMessage)

    }

    return messages;
}


module.exports = {
    getChannelObject,
    getMessageObject,
    getMessagesAfterId
}