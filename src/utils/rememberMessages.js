const getAllTextChannels = require('./getAllTextChannels');

let rememberedMessages = []

const addMessage = (message) => { rememberedMessages.push(message);}
const addMessages = (messages) => { rememberedMessages = rememberedMessages.concat(messages); }
const getRememberedMessage = () => { return rememberedMessages }
const clearRememeberedMessages = () => { rememberedMessages = [] }


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

    //if id begin there
    if (id) 
        messages = await channel.messages.fetch({ cache: false, limit: numberToSave, before: id });
    else
        messages = await channel.messages.fetch({ cache: false, limit: numberToSave});
            
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

//continues saving messages until their time is lesser than given
//we are going into the past to fetch old messages by their timestamps(ms)
const saveMessagesTime = async(channel, pastTime, chunkSize) =>{
    let message;
    let startId;
    let messageTime;
    if(chunkSize > 100) chunkSize = 100;

    do{
        //if startId use it //chunks of 100 is more efficient
        if (startId) 
            message = await channel.messages.fetch({ cache: false, limit: chunkSize, before: startId });
        else
            message = await channel.messages.fetch({ cache: false, limit: 1});

        //add the message
        //parse the message
        //may be a better way, but message is a map, so using foreach to iterate to get at the object
        message.forEach((msg) =>{
            startId = msg.id; //save the message id so we can start there next iteraction
            messageTime = msg.createdTimestamp; //save timestamp for comparison

            const parsedMessage = parseMessage(msg);
    
            //save the message
            addMessage(parsedMessage);
        })
    } while(messageTime >= pastTime); //loop until the message timestamp is lower/=  than the past time
}



module.exports = {
    addMessage,
    addMessages,
    getRememberedMessage,
    clearRememeberedMessages,
    parseMessage,
    saveNumberMessages,
    saveMessagesTime
 }