const getAllTextChannels = require('./getAllTextChannels');

let rememberedMessages = []

const addMessage = (message) => { rememberedMessages.push(message);}
const addMessages = (messages) => { rememberedMessages = rememberedMessages.concat(messages); }
const getRememberedMessages = () => { return rememberedMessages }
const clearRememberedMessages = () => { rememberedMessages = [] }


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
    getRememberedMessages,
    clearRememberedMessages,
    parseMessage,
 }