//import ApplicationCommandOptionType if you need types of options
//import PermissionFlagsBits if you need permissions
const {ApplicationCommandOptionType, PermissionFlagsBits} = require('discord.js');
//every command needs to export a command object
module.exports = {
    name: 'example',  //a name(required)
    description: 'test', //a description(required)
    devOnly: false, //a devonly flag(optional)
    testOnly: false, //a testonly flaf(optional)
    //options(optional)
    options:  [
        {
            name: 'test', //name(required)
            description: 'blah', //description(required)
            required: true, //required(optional) : makes it so the user needs to input something to run the command
            type: ApplicationCommandOptionType.String, //type of command, use intellisence or docs to select proper one
            //https://discord.com/developers/docs/interactions/application-commands

        },
        {
            name: 'test-2',
            description: 'blah blah',
            type: ApplicationCommandOptionType.String,

        }
    ],
    permissionsRequired: [PermissionFlagsBits.],

    //logic
    callback: (client, interaction) =>{
        interaction.reply(`Ban...`);
    }
};