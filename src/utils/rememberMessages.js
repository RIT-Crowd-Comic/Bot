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

//returns the id of the message at the final index
const saveNumberMessages = async(numberToSave, channel, id) =>{
    let messages;
    //get the messages

    if (id) 
        messages = await channel.messages.fetch({ limit: numberToSave, start: id });
    else
        messages = await channel.messages.fetch({ limit: numberToSave});
            
    //loop for each message
    //using a amalgamation of a for + foreach to keep track
    //feel free to refactor!!!
    let i = 1;
    let returnId;
    messages.forEach((msg)=>{
                    
        //parse the message
        const parsedMessage = parseMessage(msg);
    
        //save the message
        addMessage(parsedMessage);

        //return the index if its the final one
        if(i == numberToSave)
            returnId = msg.id;
        i++;
    });
    return returnId;  
}



module.exports = {
    addMessage,
    addMessages,
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
    saveNumberMessages
 }