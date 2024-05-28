const getAllTextChannels = require('./getAllTextChannels');

let rememberedMessages = []

const addMessage = (message) => { rememberedMessages.push(message);}
const addMessages = (messages) => { rememberedMessages = rememberedMessages.concat(messages); }
const getRememberedMessage = () => { return rememberedMessages }
const clearRememeberedMessage = () => { rememberedMessages = [] }


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


module.exports = {
    addMessage,
    addMessages,
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
 }