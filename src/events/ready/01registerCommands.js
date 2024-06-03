const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const {getLocalCommands, getApplicationCommands} = require('../../utils/getCommands');

//registers all the commands with the server
module.exports = async (client) => {
    try {
    //gets the local commands (files)
        const localCommands = getLocalCommands();
        const commands = [];
    
        //gets the commands on the server
        const applicationCommands = await getApplicationCommands(
            client,
            process.env.TESTSERVER_ID
        );

        //loop through each command in files
        for (const localCommand of localCommands) {
            const {name} = localCommand.data;

            //check if its deleted in the file, if so, remove it
            if (localCommand.options?.deleted) {
                console.log(`🗑 Deleted command "${name}".`);
                continue;
            }

            //otherwise add it to the server as its not there
            commands.push(localCommand.data);
  
            console.log(`👍 Registered command "${name}."`);      
        }
    

        // remove commands that no longer exist
        for(const command of applicationCommands.cache) {
            const id = command[0];
            const appCommand = command[1];
      
            if (!localCommands.find(c => c.data.name === appCommand.name)) {
                // server command does not exist here anymore
                await applicationCommands.delete(id);
                console.log(`🗑 Deleted command "${appCommand.name}".`);
            }
        }

        //Register the new Commands
        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(client.application.id, process.env.TESTSERVER_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');

    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
};