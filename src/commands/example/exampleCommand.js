//import SlashCommandBuilder
//import PermissionFlagsBits if you need permissions
const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');

//every command needs to export a command object

module.exports = {
    data: new SlashCommandBuilder()
    .setName('example') //name 
    .setDescription('test') //description
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory) //permissions(optional)
    
    //if you need options...
    //options on the main command cannot mix with subCommands, they are mutually exclusive

    /*.addStringOption(option =>
        option.setName('example-option')
        .setDescription('this is a example')
        .setRequired(true) //says this must be filled out
    )*/
    // if you need subcommands, subcommand options are shown.
    .addSubcommand(subcommand =>
        subcommand.setName('subcommand')
            .setDescription('testing')
            .addStringOption(option =>
                option.setName('hello')
                .setDescription('says hello')
            )
    )

    .addSubcommand(subcommand =>
        subcommand.setName('subcommand-2')
            .setDescription('testing')
            .addStringOption(option =>
                option.setName('hello')
                    .setDescription('says hello')
            )
    ),

    //options object, use to hold other command data. The system has some built in ones already that can be used
    options:
    {
        deleted: false, //deleted (optional) specifies if this command shouldn't be on the server/guild
        devOnly: true, //a devonly flag(optional)
        testOnly: false, //a testonly flag(optional)
    },
   

    //logic for the command in the form of a callback function
    //interaction stores the data of the interaction, like button press, user, data input etc
    //must take in client and interaction
    async execute(client, interaction){
        interaction.reply(`Test`);
    }
};