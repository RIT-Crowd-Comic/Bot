const {devs, testServer} = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

//handles commands when they are called
module.exports = async (client, interaction) =>{
    //if its not a /chat command return
    if(!interaction.isChatInputCommand()) return;

    //get the commands
    const localCommands = getLocalCommands();

    try{
      //match the /command to an actual command
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        );

        //if null return
        if(!commandObject) return;

        //permissions
        //if the command is marked devonly-check if they are a dev (config.JSON has dev ids)
        if(commandObject.devOnly){
            if(!devs.includes(interaction.member.id)){
                interaction.reply({
                    content: 'Only developers are allowed to run this command.',
                    ephemeral: true,
                });
                return;
            } 
        }

        //check if the command is for testing only, in which case only the specified testing server can be used
        if (commandObject.testOnly) {
            if (!(interaction.guild.id === testServer)) {
              interaction.reply({
                content: 'This command cannot be ran here.',
                ephemeral: true,
              });
              return;
            }
        }

        //check if permissions are needed (admin etc) to run the command
        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
              if (!interaction.member.permissions.has(permission)) {
                interaction.reply({
                  content: 'Not enough permissions.',
                  ephemeral: true,
                });
                return;
              }
            }
        }


        //bot permissions, maybe the bot doesn't have permission to carry out the command
        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
              const bot = interaction.guild.members.me;
      
              if (!bot.permissions.has(permission)) {
                interaction.reply({
                  content: "I don't have enough permissions.",
                  ephemeral: true,
                });
                return;
              }
            }
        }

        //call the function from the command
        await commandObject.callback(client, interaction);
      

    }catch(error){
        console.log(`There was an error running this command: ${error}`);
    }
};