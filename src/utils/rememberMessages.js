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

    if (id) 
        messages = await channel.messages.fetch({ cache: false, limit: numberToSave, start: id });
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



module.exports = {
    addMessage,
    getRememberedMessage,
    clearRememeberedMessage,
    parseMessage,
    searchAllChannelsForMessage,
    saveNumberMessages
 }