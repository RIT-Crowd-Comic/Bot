const { MessageActivityType } = require("discord.js");

const rememberedMessages = []
const addMessage = (message) => { rememberedMessages.push(message); }
const addMessages = (messages) => { rememberedMessages = rememberedMessages.concat(messages); }
const getRememberedMessage = () => { return rememberedMessages }
const clearRememeberedMessage = () => { rememberedMessages = [] }

//this parses into an object
const parseMessage = (msg) => {
    return {
        content: msg.content,
        authorId: msg.author.id,
        authorGlobalName: msg.author.globalName,
        timestamp: msg.createdTimestamp
    }
}

//parses message api response json to message object 
//including message, who sent it, and what time
//? assuming that all time are in UTC 
const parseMessageApi = (message) => {
    return {
        author: {
            id: message.author.id,
            globalName: message.author.global_name,
        },
        content: message.content,
        id: message.id,
        timestamp: message.timestamp
    }
}

module.exports = {
    addMessage,
    addMessages,
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
    parseMessageApi
}