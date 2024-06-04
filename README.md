﻿﻿
# CrowdComic Bot

## Table of Contents
  - [Introduction ](#introduction)
    - [Enable Developer Mode](#enable-developer-mode)
  - [Developer Set Up](#developer-set-up)
    - [Build Your Own Bot](#build-your-own-bot)
      - [Initialize Your Bot ](#initialize-your-bot)
      - [Add the bot to your server](#add-the-bot-to-your-server)
    - [Project Installation](#project-installation)
      - [Node Dependencies](#node-dependencies)
      - [.env Set Up](#env-set-up)
      - [Lint Set Up](#lint-set-up)
      - [How to run your bot](#how-to-run-your-bot)
      - [Resources](#resources)
      - [Code Structure](#code-structure)
      - [How to create a command](#how-to-create-a-command)
      - [How to create a subcommand](#how-to-create-a-subcommand)
      - [How to add an event](#how-to-add-an-event)
  - [Command Documentation](#command-documentation)
    - [/help](#help)
    - [/help-remember](#help-remember)
    - [/check-in-interface](#check-in-interface)
    - [/schedule-check-in](#schedule-check-in)
    - [/remember subcommands](#remember-subcommands)
      - [message](#message)
      - [clear-messages](#clear-messages)
      - [past](#past)
      - [recall](#recall)
      - [number](#number)
      - [range](#range)
      - [start-remembering](#start-remembering)
      - [stop-remembering](#stop-remembering)
## Introduction <a name="introduction"></a>

**UPDATE ME**

### Enable Developer Mode <a name="enable-developer-mode"></a>

This bot requires developer mode to be enabled as both a developer and a user.

- Settings -> Advanced -> Developer Mode

  

## Developer Set Up <a name="developer-set-up"></a>

### Build Your Own Bot <a name="build-your-own-bot"></a>

It's highly recommended to make your own version of the bot for testing purposes. A brief tutorial on how is written below. If you would like a visual representation, follow [this video (0:00 - 3:30)](https://www.youtube.com/watch?v=KZ3tIGHU314&list=PLpmb-7WxPhe0ZVpH9pxT5MtC4heqej8Es).

  

#### Initialize Your Bot <a name="initialize-your-bot"></a>

1. Go to [this website](https://discord.com/developers/applications)

2. Create a new application

3. Open the application

4. Click the `Bot` section on the left

5. Disable `Public Bot`

6. Enable `Presence Intent`, `Server Members Intent`, `Message Content Intent` under `Privileged Gateway Intents`

7. Save your changes
  
#### Add the bot to your server <a name="add-the-bot-to-your-server"></a>

1. Still in your bot's application, click on `OAuth2`

2. Enable the following scopes

-  `bot`

-  `applications.commands`

3. Enable the Administrator permission

- Note: this is likely to change in the future depending on how much access we want the bot to have

4. Copy the generated link and paste it in a browser

5. Add the bot to your testing server

  

### Project Installation <a name="project-installation"></a>

  

#### Node Dependencies <a name="node-dependencies"></a>

This project uses Node.js with the following dependencies and versions:

  

```

"dayjs": "^1.11.11",

"discord.js": "^14.15.2",

"dotenv": "^16.4.5",

"ms": "^2.1.3",

"nodemon": "^3.1.0"

```

  

#### .env Set Up <a name="env-set-up"></a>

1. Create a duplicate of `example.env` and rename it to `.env`

2. Open `.env` and replace the template data

-  `DISCORD_TOKEN` is your bot's token. This can be found in your application under bot. Click `Reset Token` to show it.

-  `TESTSERVER_ID` is your server's id, right click on your server's name in the top left, and click `Copy Server ID`

-  `DEV_IDS` - is an array of user id's. These are used to restrict who has access to certain commands of the bot. To get your user ID, right click on your account in bottom left icon, click `Copy User ID`

3. Verify that all of these ids/tokens are strings.

  

Note: anything related to ids should be added to `.env` for privacy

  

#### Lint Set Up <a name="lint-set-up"></a>

With the addition of [Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) to our project, developers can automate the

linting and formatting process. Run the following command to set up git hooks for your local repository. Go to the [Linting Section](https://github.com/RIT-Crowd-Comic/Bot?tab=readme-ov-file#Linting) to read more about configuring ESLint and Git hooks.

```

npm run setup

```

  

#### How to run your bot <a name="how-to-run-your-bot"></a>

Run `nodemon` in the root directory of your terminal. You should notice your bot is online.

  

#### Resources <a name="resources"></a>

Here is the documentation, and some video tutorials that the bot's structure is based on. Be sure to use them to familiarize yourself with API.

  

- [Youtube Tutorials](https://www.youtube.com/watch?v=KZ3tIGHU314&list=PLpmb-7WxPhe0ZVpH9pxT5MtC4heqej8Es)

- [Discord.js Documentation](https://discord.js.org/)

- [Discord Developer Portal](https://discord.com/developers/applications)

####  Code Structure <a name="code-structure"></a>
The entry point for the program is `index.js`. It imports the `discord.js` library and starts the bot. It also calls `eventHandler.js` to start listening for and handling events. 

`eventHandler.js` looks through all the folders within `/events` and sets them up to run whenever a specified event happens. 

- Example: On the `ready` event, all of the files within the `/events/ready` folder are registered to run when  `ready` happens. 


Commands are where the bulk of the structure lies. The `/commands` folder is where all the commands are stored. At the startup of the bot, `01registerCommands` registers all the commands within these folders on the server. 

When a command is invoked, `commandHandler.js` checks permissions and other options regarding the command, and then calls the associated function for the command.

#### How to create a command <a name="how-to-create-a-command"></a>
Commands are made using the [slashCommandBuilder](https://v13.discordjs.guide/popular-topics/builders.html#commands)
Check out  `./commands/example/exampleCommand.js` for an example.
1. Under `/commands`, make a folder for the new command or place it in an existing folder that makes sense.

2. Add a new file to that folder, name is `yourCommandNameHere.js`
3.  The command file has to export a `command` object. There a at least 3 main components of a command. `data`, `options` and `execute`.
4.  `data` represents the   data of the command, specifically the `slashCommandBuilder`. It contains the name, description, options and permissions of the command. 
	```js
	data:  new  SlashCommandBuilder()
	.setName('example')
	.setDescription('test')
	.addStringOption(option =>
		option.setName('example-option)
		options.setDescription('this is an example)
	),
5. `options` contains options for the command. `deleted` specifies to not place this command on the server. `devOnly` specifies developers are only allowed to run the command. `testOnly` specifies the command can only be run in a specific test server.  **Note:** `options` is optional and all of the variables inside will default to `false` if not provided.

	```js	
	options:
	{
		deleted:  false,
		devOnly:  true,
		testOnly:  false,
	},
	```
6. `execute` contains the callback function that is run when the command is called. Place the commands execution logic in here. A good pattern to follow is to make a helper function for the command logic, then inside the execute, grab the needed data and call the helper. 
	```js
	async execute(client, interaction){
		interaction.reply('hello');
		//or
		interaction.deferReply();
		interaction.editReply('Hello);
	}
	```
7. `client` and `interaction` are required parameters for the function. `client` refers to the bot itself, while `interaction` is the data behind the command (such as channel, user, other options...). `client` does not need to be used, but `interaction` does have to be replied to. Examples of such exist in every command.

#### How to create a subcommand <a name="how-to-create-a-subcommand"></a>
1. Make a command following the above instructions. Once again look at `/commands/example/exampleCommand.js`

3. Add a subcommand via `.addSubCommand`.  `subCommands` and options such as `addStringOption` are mutually exclusive. You cannot have both on a main command. Subcommands can still have options. Set up a name, description and options for each subcommand created.
	```js
	 .addSubcommand(subcommand =>
        subcommand.setName('subcommand')
            .setDescription('testing')
            .addStringOption(option =>
                option.setName('hello')
                .setDescription('says hello')
            )
    )
	```
	Which subcommand was used can be easily gotten from the `interaction`.

	```js 
	const  subcommand  =  interaction.options.getSubcommand();
	``` 	
#### How to add an event <a name="how-to-add-an-event"></a>
1. Make a new folder corresponding to the event you wish to add or place your file in an existing `/events/event` folder such as `events/ready`.  For adding a new folder, add one under  `/events`  and name it with the event name you wish to have. The **name** of the folder is very important. It must match the event name from discord such as  `ready`.

2.	Add a file to the chosen or created folder. Give it a relevant name. The file must export a function with the parameters of at least `client`, with an optional second parameter that depends on the nature of the event. `ready` just needs client, but `interactionCreate` has`client` and `interaction`
3.	Add logic to the function.

**Note:** The eventHandler sorts the events in each folder by number, so 1 has greater priority than 2. Example:  `01registerCommands.js`  comes before  `02example.js`.

## Command Documentation <a name="command-documentation"></a>

### /help <a name="help"></a>

Show all of the commands along with a brief description

  

### /help-remember <a name="help-remember"></a>

Shows a brief description of all of the remember subcommands

  

### /check-in-interface <a name="check-in-interface"></a>

Check in with how your are feeling for the day

  

### /schedule-check-in <a name="schedule-check-in"></a>

Create a schedule for receiving check in notifications

| Parameters | Description |
| --- | --- |
| days | List days to notify. This can be comma or space separated. Not case sensitive |
| time | Time of day to be notified. When sending verbose to the user, this time is converted to 24 hour time. Ex: "1:00" (infers am), "15:00", "3:00pm" |

| Days | Valid Inputs |
| ----------- | ----------- |
| Monday | monday, m |
| Tuesday | tuesday, t |
| Wednesday | wednesday, w |
| Thursday | thursday, th, h |
| Friday | friday, f |
| Saturday | saturday, sa |
| Sunday | sunday, su |

### /remember subcommands <a name="remember-subcommands"></a>

All of the following commands append the word `/remember` with a space afterwards

  

#### message <a name="message"></a>

Remember and save a specific message

| Parameters | Description |
| --- | --- |
| message-id | The id of the message that will be saved |

#### clear-messages <a name="clear-messages"></a>

Clear all messages currently saved in remembrance

  

#### past <a name="past"></a>

Saves messages from past set amount of "hours" and "minutes" in a specific channel

| Parameters | Description |
| --- | --- |
| hours | The number of hours to save. Max 5. |
| minutes | The number of minutes to save to save. Max 59. |
| channel (optional) | The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen. |
| speed | Speed of the Search. Lower value is more accurate but slower. Range 25-100 inclusive |
| exclude-bot-messages (optional) | If bot messages should be excluded in the message collection. Default is `true` |

#### recall <a name="recall"></a>

Creates and sends a JSON of all the saved message

  

#### number <a name="number"></a>

Saves a number of the most recent messages from a specific channel.

| Parameters | Description |
| --- | --- |
| number-of-messages | The number of messages to save. 1 - 1000 inclusively. |
| channel (optional) | The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen. |
| exclude-bot-messages (optional) | If bot messages should be excluded in the message collection. Default is `true` |

#### range <a name="range"></a>

Remember all messages between two specific messages inclusively

| Parameters | Description |
| --- | --- |
| start-message-id | The first message's id |
| end-message-id | The second message's id |
| channel (optional) | The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen. |
| exclude-bot-messages (optional) | If bot messages should be excluded in the message collection. Default is `true` |

#### start-remembering <a name="start-remembering"></a>

Start remembering messages in a specific channel

| Parameters | Description |
| --- | --- |
| channel (optional) | The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen.|
| exclude-bot-messages (optional) | If bot messages should be excluded in the message collection. Default is true |

  

#### stop-remembering <a name="stop-remembering"></a>

Stop remembering messages in a specific channel
