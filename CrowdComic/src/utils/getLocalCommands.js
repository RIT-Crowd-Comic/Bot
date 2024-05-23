const path = require('path');
const getAllfiles = require('./getAllFiles')

//gets all the local commands (command files)
module.exports = (exceptions = []) =>{
    let localCommands = [];

    //gets all the folders in commands folder
    const commandCategories = getAllfiles(
        path.join(__dirname, '..', 'commands'),
        true
    );

    //get the commands within every folder
    for(const commandCategory of commandCategories){
        const commandFiles = getAllfiles(commandCategory);

        for(const commandFile of commandFiles){
            const commandObject = require(commandFile);

            if(exceptions.includes(commandObject.name))
                continue;
            
            localCommands.push(commandObject);
        }
    }
    return localCommands;
};