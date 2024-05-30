﻿# Welcome to CrowdComic Bot
This will run through how the current Bot works behind the scenes, reference it to help with development. 

It takes care of registering commands and other events automatically, lessening the workload and allowing for focus for developing actual commands and functionality. 
## Useful Links

 - [Youtube Tutorials](https://www.youtube.com/watch?v=KZ3tIGHU314&list=PLpmb-7WxPhe0ZVpH9pxT5MtC4heqej8Es) : These were the ones we watched. Highly recommend watching and following along.
 - [Discord.js Documentation](https://discord.js.org/)
 - [Discord Developer Portal](https://discord.com/developers/applications)

# Required Packages and Version

```
"discord.js": "^14.15.2",
"dotenv": "^16.4.5",
"nodemon": "^3.1.0"
```
**Important** : Make sure you have a `.env` set up for the project. An example is also provided in the repository. Here is an example:

    DISCORD_TOKEN='example bot token here'
Generate a token for the application by going to the wanted application under the [discord developer portal](https://discord.com/developers/applications) then going to the Bot tab.

# Setup

With the addition of [Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) to our project, developers can automate the 
linting and formatting process. Run the following command to set up git hooks for your local repository. Go to the [Linting Section](https://github.com/RIT-Crowd-Comic/Bot/edit/main/README.md#linting) to read more about configuring ESLint and Git hooks.
```
npm run setup
```

# Vocab

**Client** refers to the application(bot) itself. 
**Guild** refers to the discord server that the bot is running in.

# config.json

`config.json` is responsible for some needed data across the program. 
```
{
"testServer": "1242218138586841188",
"clientId": 1242559805973856408,
"devs": [568106584836931584],
"rolesChannelId" : "1242556174591594576",
"roles": [
		{
		"id": "1242534422180528248",
		"label": "Red"
		},
		{
		"id": "1242534853241733241",
		"label": "Green"
		},
		{
		"id": "1242534878424207380",
		"label": "Blue"
		},
		{
		"id": "1242838265115971634",
		"label": "Test"
		}
	]
}
```
`testServer` is the id of the server that the bot is running/testing on.
`clientId` is the id of the bot application.
`devs` are the discord id's for the developers, is useful if certain features are dev only.
`rolesChannelId` is the id of the discord channel that the roles button will populate when the bot is started.
`roles` is the data for each role, including an `id`  for identification and a `label` for display.




# index.js

The entry point into the program is index.js. It imports the discord.js library and starts up the bot. It calls the event handler to start up the bot's listening for events.

```js
const  path  =  require('path')

require('dotenv').config({ path:  path.resolve(__dirname, '../.env') })

//setup discord
const { Client, IntentsBitField } =  require('discord.js');
const  eventHandler  =  require('./handlers/eventHandler');

const  client  =  new  Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent
	]
});

eventHandler(client);
  
client.login(process.env.DISCORD_TOKEN)
```

# eventHandler.js

This file is responsible for gathering all the events from the `\events` directory. It looks through the directory to find each subdirectory using  `\utils\getAllFiles.js`. Each sub-directory refers to a **discord event** such as `ready` or `interactionCreate`.  Within each subdirectory (event) there are `event.js` files. These files set up to run whenever the specified event is called by discord.

**Note:** The eventHandler sorts the events in each folder by number, so 1 has greater priority than 2. 
Example: `01registerCommands.js` comes before `02send-message-roles.js`.

To add a new event, add a new folder under `/events` and name it with the event name you wish to have. The **Name** of the folder is very important. It must match the event name from discord such as `ready`.
```js
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

        //sort by prioriy (number in name)
        eventFiles.sort((a,b)=> a > b);
        
        //get the event names from them
        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop(); //get the name using regex
        
        //get functions out of the files and call them
        client.on(eventName, async (arg) =>{
            for(const eventFile of eventFiles){
                const eventFunction = require(eventFile);
                await eventFunction(client, arg);
            }
        })
    }
};
```



# The Events 
Within each event subdirectory there are `event.js` files. Ex. `\events\ready\01registerCommands.js`. This section will document each event as well as the files that get called for each event. 



## ready

The `ready` event happens when the client is ready. It triggers when the application starts.

 

 

**`01registerCommands.js`**

This function checks the the commands within the **guild** and the **local commands(the command files)**. It compares and gets both using helper functions, then uses that comparison with additional data to register or remove commands from the guild. 
```js
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
```

**`02send-message-roles.js`**
Given a specific set of roles and a channel (info contained in `config.json`). This file will populate that channel with roles buttons, which will assign a role to the user when they are pressed. 

**`consoleLog.js`**
This prints that the client has loaded to the console.

## interactionCreate

This event is triggered when the user interacts with the bot in a certain way, such as a`/command` or a button press.

**`handleCommands.js`**
This file handles the commands when they are called. It checks permissions based on who invoked the command; **permissions**, **bot permissions**, **devOnly**, and **testOnly**. If the permissions validates, it calls the command logic from the command (more on this later).

devOnly and testOnly are parameters given to commands which limit who and what can used them. devOnly checks the `config.json` for a matching dev *id*, while testOnly ensures that certain commands can only be called in a specified test guild, also stored in `config.json`. 

**`roles.js`**
When one of the roles buttons created with `02send-message-roles` is clicked, it attempts to assign that role to the user.

# Commands

The `\commands` directory stores each /command for the bot. Within the commands directory lie more subdirectories each with different commands. `\commands\misc\ping.js`. When making a command, make sure it goes into a subdirectory, either use an existing one if it makes sense, or make a new one. 

Commands each need to export a command object. A command object stores data regarding the command as well as a callback function that will be called when the command is invoked.  

Here is an example command object:
```js
//import ApplicationCommandOptionType if you need types of options
//import PermissionFlagsBits if you need permissions
const {ApplicationCommandOptionType, PermissionFlagsBits} = require('discord.js');
//every command needs to export a command object
module.exports = {
    deleted: false, //deleted (optional) specifies if this command shouldn't be on the server/guild
    name: 'example',  //a name(required)
    description: 'test', //a description(required)
    devOnly: false, //a devonly flag(optional)
    testOnly: false, //a testonly flag(optional)
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
    permissionsRequired: [PermissionFlagsBits.ViewChannel], //permissions(optional) check intellisense or docs to view permission options
    //https://discord.com/developers/docs/topics/permissions

    //logic for the command in the form of a callback function
    //interaction stores the data of the interaction, like button press, user, data input etc
    callback: (client, interaction) =>{
        interaction.reply(`Test`);
    }
};
```

Each command has 3 required parameters:

 - **Name** Name of the command.
 - **Description** Description of the command.
 
 - **Callback** Function that is called when the command is called. Called by `handleCommands.js`. Each callback has to reply to the interaction with `interaction.reply()`. The logic for what happens when commands are called should be here. 

Additional Optional Parameters Exist:

 - **Deleted**  Specifies if the command should exist in the guild. If this is true the `01registerCommands.js` will remove it from the guild.
 - **devOnly** Specifies only devs can call this command.
 
 - **testOnly** Specifies this command can only be used in the specified test guild.
 - **options** Shows additional options for the command, such as inputting a number or user. Several types of data are needed here.
		 - **Name** of the option
		 - **Description** of the option
		 - **Required** Specifies this option must be filled out to finish the command. This is optional
		 - **Type** is the type of option, such as number or string. [Option Types](https://discord.com/developers/docs/interactions/application-commands)
 - **permissionsRequired** Specifies certain permissions are needed to use this command. [Permission Types](https://discord.com/developers/docs/topics/permissions)


# Utils

There are a few utility functions that are within the `\utils ` folder. 

 **`areCommandsDifferent.js`**
This file checks two command files against one another and returns if they are different. This is used for registering commands as it compares application/guild side commands with local commands.

 **`getAllFiles.js`**
This file takes a specified directory and returns all files or folders within that directory based on a bool. This is used to grab all the commands from the `\commands` folder or the events and their files from the  `\events` folder.

 **`getApplicationCommands.js`**
This file returns all the commands the client has within the guild.

 **`getLocalCommands.js`**
This file uses `getAllFiles.js` to get the local commands.


# Linting

We use [ESLint](https://eslint.org/) for code suggestions and formatting.
As a developer, you can utilize the following commands:


| Command | Description |
| --- | --- |
| `npm run lint`                 | Use ESLint for code suggestions |
| `npm run lint:fix`             | Use ESLint to format your code |
| `npx eslint file/or/directory` | Use ESLint to check a specific file or directory |
| `git commit ...`               | Invokes the `pre-commit` git hook |
| `git commit --no-verify ...`   | Bypass all hooks related to committing |


We use [Git hooks](https://git-scm.com/docs/githooks) to automate the linting and formatting process. Our hooks are located in [/git_hooks](/git_hooks/)

For example, the Git hook `pre-commit` runs the command `npx eslint --fix` on all staged files, automatically fixing any fixable warnings (such as indents and semicolons) and re-staging the file for commit. 
> This hook is invoked by [git-commit[1]](https://git-scm.com/docs/git-commit), and can be bypassed with the `--no-verify` option. It takes no parameters, and is invoked before obtaining the proposed commit log message and making a commit. Exiting with a non-zero status from this script causes the git commit command to abort before creating a commit. [Documentation](https://git-scm.com/docs/githooks#_pre_commit).


If you want to update any [ESLint rules](https://eslint.org/docs/latest/rules), update the config file located in [/eslint.config.mjs](/eslint.config.mjs).  Keep in mind that many of the styling rules (such as "indent" and "semi") were deprecated and moved to the [@stylistic/js](https://eslint.style/packages/js) plugin. The specific rules for @stylistic/js can be found at the bottom of their web page.

Example ESLint linting rules
```js
{
	rules: {
		'consistent-return': 2,
		'no-else-return': 1,
		'space-unary-ops': 2
	}
}
```

Example @stylistic/js rules

```js
{
	plugins: {
		'@stylistic/js': stylisticJs
	},
	rules: {
		'indent': [1, 4],   // 0 - off. 1 - warn. 2 - error
		'semi': ['warn', 'always'],
		'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
		'quotes': ['warn', 'single', {'allowTemplateLiterals': true, 'avoidEscape': true}]
		// ...
	}
}
```
