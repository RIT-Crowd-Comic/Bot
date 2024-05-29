const path = require('path');
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) =>{
    //get all the folders with events in them
    //move up a spot then check events, only want the folders
    const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'),true);
    
    //now loop through folders
    for(const eventFolder of eventFolders){
        //get the files
        const eventFiles = getAllFiles(eventFolder);

        //sort by priority (number in name)
        eventFiles.sort((a,b)=> a > b);
        
        //get the event names from them
        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop(); //get the name using regex
        
        //get functions out of the files and call them
        client.on(eventName, async (arg) =>{
            for(const eventFile of eventFiles){
                const eventFunction = require(eventFile);

                try {
                    await eventFunction(client, arg);
                }
                catch (error) {
                    console.log(error);
                }
            }
        })
    }
};