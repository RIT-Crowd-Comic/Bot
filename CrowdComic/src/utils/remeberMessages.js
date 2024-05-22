const rememberedMessages = []

const addMessage = (message) => { rememberedMessages.push(message); }
const getRememberedMessage = () => { return rememberedMessages }
const clearRememeberedMessage = () => { rememberedMessages = [] }



module.exports = {
    addMessage,
    getRememberedMessage,
    clearRememeberedMessage
 }