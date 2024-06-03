const path = require('path');
const getAllFiles = require('./getAllFiles');

const getLocalCommands = (exceptions = []) =>{
    let localCommands = [];

    const commandCategories = getAllFiles(
        path.join(__dirname, '..', 'commands'),
        true
    );

    // get the commands for every category
    for (const commandCategory of commandCategories) {
        const commandFiles = getAllFiles(commandCategory);

        for (const commandFile of commandFiles) {
            const commandObject = require(commandFile);

            if (exceptions.includes(commandObject.data.name))
                continue;

            localCommands.push(commandObject);
        }
    }
    return localCommands;
};


// gets the application commands
const getApplicationCommands = async(client, guildId)=>{
    let applicationCommands;

    // if guild
    if (guildId) {
        const guild = await client.guilds.fetch(guildId);
        applicationCommands = guild.commands;
    } else {
        applicationCommands = await client.application.commands;
    }
    await applicationCommands.fetch();

    return applicationCommands;
};

module.exports = {
    getApplicationCommands,
    getLocalCommands,
};
