const getAllTextChannels = require('./getAllTextChannels');

const rememberedMessages = []

const addMessage = (message) => { rememberedMessages.push(message);}
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
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
    searchAllChannelsForMessage,
    saveNumberMessages,
    saveMessagesTime
 }