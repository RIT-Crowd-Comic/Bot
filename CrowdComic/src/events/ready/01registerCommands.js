const { testServer } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

//registers all the commands with the server
module.exports = async (client) => {
  try {
    //gets the local commands (files)
    const localCommands = getLocalCommands();
    //gets the commands on the server
    const applicationCommands = await getApplicationCommands(
      client,
      testServer
    );

    //loop through each command in files
    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      //check if its on the server
      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );
      //if it is...
      if (existingCommand) {
        //check if its deleted in the file, if so, remove it
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }

        //if the command is different than server, edit the server command to be the same
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(`🔁 Edited command "${name}".`);
        }
      } 
      //it isn't on the server
      else {
        //if it was set to delete anyway, skip
        if (localCommand.deleted) {
          console.log(
            `⏩ Skipping registering command "${name}" as it's set to delete.`
          );
          continue;
        }
        //otherwise add it to the server as its not there
        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`👍 Registered command "${name}."`);
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};