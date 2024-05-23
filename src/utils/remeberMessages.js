const rememberedMessages = []
const addMessage = (message) => { rememberedMessages.push(message); }
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

module.exports = {
    addMessage,
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
}