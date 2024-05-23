const getAllTextChannels = require('./getAllTextChannels');

const rememberedMessages = []

const addMessage = (message) => { rememberedMessages.push(message); console.log(rememberedMessages); }
const getRememberedMessage = () => { return rememberedMessages }
const clearRememeberedMessage = () => { rememberedMessages = [] }

//this parses into an object
const parseMessage = (msg) => { 
    const message = {
        content: msg.content,
        authorId: msg.author.id,
        authorGlobalName: msg.author.globalName,
        timestamp: msg.createdTimestamp
    }

    return message;
}

//searches all channels for the message
const searchAllChannelsForMessage = async (id, client, guildId) => { 
    //get all channels
    let channels = await getAllTextChannels(client, guildId);

    //loop through and attempt to find message
    channels =  Array.from(channels);

    for(let i = 0; i < channels.length; i++){
        try{
            const msg = await channels[i].messages.fetch(id);
            return msg;

        }catch(error){
            console.log(`${channels[i].name} did not have the message`);
        }
    }
}



module.exports = {
    addMessage,
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
    searchAllChannelsForMessage
 }