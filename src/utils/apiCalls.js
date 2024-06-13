const { version } = require('../../config.json');
const baseUrl = `https://discord.com/api/${version}`;

// helper method for discord get requests
const getAPICall = async (url, body = {
    method:  'GET',
    headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}`, },
}) => {
    return await fetch(url, body).then(response => {
        if (response.status != 200) {
            console.log(`There was an error: ${response.status} ${response.statusText}`);
            return undefined;
        }
        return response.json();

    });
};

// helper method for discord put requests
const putAPICall = async (url, body = {
    method:  'PUT',
    headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}`, },
}) => {
    return await fetch(url, body).then(response => {

        // ? There's probably a better way to do this
        if (Math.floor(response.status / 100) != 2) {
            console.log(`There was an error: ${response.status} ${response.statusText}`);
            return { status: 'Fail', description: `${response.status} ${response.statusText}` };
        }

        return { status: 'Success' };
    });
};

// helper method for discord delete requests
const deleteAPICall = async (url, body = {
    method:  'DELETE',
    headers: { 'Authorization': `Bot ${process.env.DISCORD_TOKEN}`, },
}) => {
    return await fetch(url, body).then(response => {

        // ? There's probably a better way to do this
        if (Math.floor(response.status / 100) != 2) {
            console.log(`There was an error: ${response.status} ${response.statusText}`);
            return { status: 'Fail', description: `${response.status} ${response.statusText}` };
        }

        return { status: 'Success' };
    });
};

const getChannelObject = async (channelId) => {
    return await getAPICall(`${baseUrl}/channels/${channelId}`);
};

const getMessageObject = async (channelId, messageId) => {
    return await getAPICall(`${baseUrl}/channels/${channelId}/messages/${messageId}`);
};


// get {limit} (max 100) messages in channel with {channelId} after messages with {afterId}
// if {addFirstMessage} is true, the message with the id of {afterId} will be added (does not count towards limit)
const getMessagesAfterId = async (channelId, limit, afterId, addFirstMessage = false) => {
    const messages = await getAPICall(`${baseUrl}/channels/${channelId}/messages?limit=${limit}&after=${afterId}`);
    if (addFirstMessage) {
        const firstMessage = await getMessageObject(channelId, afterId);
        if (!firstMessage) {

            // ? probably need some sort of way to say what went wrong
            return undefined;
        }
        messages.push(firstMessage);
    }
    return messages;
};

// returns an array of servers this bot is in
const getServers = () => {
    return getAPICall(`${baseUrl}/users/@me/guilds`);
};

// returns a server object given the id 
const getServer = serverId => {
    return getAPICall(`${baseUrl}/guilds/${serverId}`);
};

const getServerChannels = serverId => {
    return getAPICall(`${baseUrl}/guilds/${serverId}/channels`);
};

// returns the id of the message at the final index
const getNumberMessages = async(channel, numberToSave, id) =>{
    return id ?
        channel.messages.fetch({ cache: false, limit: numberToSave, before: id }) :
        channel.messages.fetch({ cache: false, limit: numberToSave });
};

const getRoles = async (serverId) => {

    return await getAPICall(`${baseUrl}/guilds/${serverId}/roles`);
};

// returns a user from a specific server
const getServerUser = async (serverId, userId) => {
    return await getAPICall(`${baseUrl}/guilds/${serverId}/members/${userId}`);
};

/* Gets the first 1000 users of a sever
 * @param {String} serverId the id of the server 
 * @param {boolean} excludeBots if bots will be excluded in the results 
 */
const getServerUsers = async (serverId, excludeBots) => {
    let response = await getAPICall(`${baseUrl}/guilds/${serverId}/members?limit=1000`)
    if(excludeBots) {
        response = response.filter(user => !user.bot)
    }
    return response;
}

// adds a role to a user
const addRole = async (serverId, userId, roleId) => {
    return await putAPICall(`${baseUrl}/guilds/${serverId}/members/${userId}/roles/${roleId}`);
};

const removeRole = async (serverId, userId, roleId) => {
    return await deleteAPICall(`${baseUrl}/guilds/${serverId}/members/${userId}/roles/${roleId}`);
};



module.exports = {
    getChannelObject,
    getMessageObject,
    getMessagesAfterId,
    getNumberMessages,
    getServers,
    getServer,
    getServerChannels,
    getRoles,
    getServerUser,
    addRole,
    removeRole,
    getServerUsers
};
