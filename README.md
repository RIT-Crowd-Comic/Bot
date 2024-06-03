﻿# CrowdComic Bot

## Table of Contents
1. [Introduction](#introduction)
2. [Developer Set Up](#setup)
    - [Build Your Own Bot](#build-bot)
        -  [Initialize Your Bot](#init-bot)
        -   [Add the bot to your server](#add-bot)
    - [Project Installation](#project-init)
        - [Node Dependencies](#node-depend)
        -  [.env Set Up](#env)
        -  [Lint Set Up](#lint)
        -  [How to run your bot](#run-bot)
        - [Resources](#resources)
    - Code Structure **[Will]**
        - How to create a command **[Will]**
        - How to add an event **[Will]**
3. [Command Documentation](#commands)
    -  [/help](#help)
    -  [/help-remember](#help-remember)
    -  [/check-in-interface](#check-in-interface)
    -  [/schedule-check-in](#schedule-check-in)
    -  [/remember subcommands](#remember-subcommands)
        - [message](#message)
        - [clear-messages](#clear-messages)
        - [past](#past)
        - [recall](#recall)
        - [number](#number)
        - [range](#range)
        - [start-remembering](#start-remembering)
        - [stop-remembering](#stop-remembering)

## Introduction <a name="introduction"></a>
### Enable Developer Mode
This bot requires developer mode to be enabled as both a developer and a user.
- Settings -> Advanced -> Developer Mode

**UPDATE ME**

## Developer Set Up <a name="setup"></a>
### Build Your Own Bot
It's highly recommended to make your own version of the bot for testing purposes. A brief tutorial on how is written below. If you would like a visual representation, follow [this video (0:00 - 3:30)](https://www.youtube.com/watch?v=KZ3tIGHU314&list=PLpmb-7WxPhe0ZVpH9pxT5MtC4heqej8Es).

#### Initialize Your Bot <a name="init-bot"></a>
1. Go to [this website](https://discord.com/developers/applications)
2. Create a new application
3. Open the application
4. Click the `Bot` section on the left
5. Disable `Public Bot`
6. Enable `Presence Intent`, `Server Members Intent`, `Message Content Intent` under `Privileged Gateway Intents`
7. Save your changes

#### Add the bot to your server <a name="add-bot"></a>
1. Still in your bot's application, click on `OAuth2`
2. Enable the following scopes
    - `bot`
    - `applications.commands`
3. Enable the Administrator permission
    - Note: this is likely to change in the future depending on how much access we want the bot to have 
4. Copy the generated link and paste it in a browser
5. Add the bot to your testing server

### Project Installation <a name="project-init"></a>

#### Node Dependencies <a name="node-depend"></a>
This project uses Node.js with the following dependencies and versions:

```
"dayjs": "^1.11.11",
"discord.js": "^14.15.2",
"dotenv": "^16.4.5",
"ms": "^2.1.3",
"nodemon": "^3.1.0"
```

#### .env Set Up <a name="env"></a>
1. Create a duplicate of `example.env` and rename it to `.env`
2. Open `.env` and replace the template data
    - `DISCORD_TOKEN` is your bot's token. This can be found in your application under bot. Click `Reset Token` to show it.
    - `TESTSERVER_ID` is your server's id, right click on your server's name in the top left, and click `Copy Server ID`
    - `DEV_IDS` - is an array of user id's. These are used to restrict who has access to certain commands of the bot. To get your user ID, right click on your account in bottom left icon, click `Copy User ID`
3. Verify that all of these ids/tokens are strings.

Note: anything related to ids should be added to `.env` for privacy

#### Lint Set Up <a name="lint"></a>
With the addition of [Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) to our project, developers can automate the 
linting and formatting process. Run the following command to set up git hooks for your local repository. Go to the [Linting Section](https://github.com/RIT-Crowd-Comic/Bot?tab=readme-ov-file#Linting) to read more about configuring ESLint and Git hooks.
```
npm run setup
```

#### How to run your bot <a name="run-bot"></a>
Run `nodemon` in the root directory of your terminal. You should notice your bot is online.

#### Resources <a name="resources"></a>
Here is the documentation, and some video tutorials that the bot's structure is based on. Be sure to use them to familiarize yourself with API.

 - [Youtube Tutorials](https://www.youtube.com/watch?v=KZ3tIGHU314&list=PLpmb-7WxPhe0ZVpH9pxT5MtC4heqej8Es)
 - [Discord.js Documentation](https://discord.js.org/)
 - [Discord Developer Portal](https://discord.com/developers/applications)
## Command Documentation <a name="commands"></a>
### /help
Show all of the commands along with a brief description

### /help-remember <a name="help-remember"></a>
Shows a brief description of all of the remember subcommands

### /check-in-interface <a name="check-in-interface"></a>
Check in with how your are feeling for the day

### /schedule-check-in <a name="schedule-check-in"></a>
Create a schedule for receiving check in notifications
|  Parameters  | Description   |
| --- | --- |
| days   |   List days to notify. This can be comma or space separated. Not case sensitive |
| time   | Time of day to be notified. When sending verbose to the user, this time is converted to 24 hour time. Ex: "1:00" (infers am), "15:00", "3:00pm" |


| Days      | Valid Inputs |
| ----------- | ----------- |
| Monday      | monday, m       |
| Tuesday   | tuesday, t        |
| Wednesday      | wednesday, w       |
| Thursday   | thursday, th, h        |
| Friday      | friday, f       |
| Saturday   | saturday, sa        |
| Sunday      | sunday, su       |
### /remember subcommands <a name="remember-subcommands"></a>
All of the following commands append the word `/remember` with a space afterwards

#### message <a name="message"></a>
Remember and save a specific message
|  Parameters  | Description   |
| --- | --- |
| message-id   |   The id of the message that will be saved  |
#### clear-messages <a name="clear-messages"></a>
Clear all messages currently saved in remembrance

#### past <a name="past"></a>
Saves messages from past set amount of "hours" and "minutes" in a specific channel
|  Parameters  | Description   |
| --- | --- |
| hours   |   The number of hours to save. Max 5.  |
| minutes   |  The number of minutes to save to save. Max 59. |
| channel (optional)   |   The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen. |
| speed   |   Speed of the Search. Lower value is more accurate but slower. Range 25-100 inclusive |
| exclude-bot-messages (optional)   |   If bot messages should be excluded in the message collection. Default is `true` |
#### recall <a name="recall"></a>
Creates and sends a JSON of all the saved message

#### number <a name="number"></a>
Saves a number of the most recent messages from a specific channel.

|  Parameters  | Description   |
| --- | --- |
|  number-of-messages |  The number of messages to save. 1 - 1000 inclusively.   |
| channel (optional)   |   The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen. |
| exclude-bot-messages (optional)   |   If bot messages should be excluded in the message collection. Default is `true` |
#### range <a name="range"></a>
Remember all messages between two specific messages inclusively
|  Parameters  | Description   |
| --- | --- |
|  start-message-id |  The first message's id   |
| end-message-id   |   The second message's id |
| channel (optional)   |   The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen. |
| exclude-bot-messages (optional)   |   If bot messages should be excluded in the message collection. Default is `true` |
#### start-remembering <a name="start-remembering"></a>
Start remembering messages in a specific channel
|  Parameters  | Description   |
| --- | --- |
|  channel (optional)   | The channel that messages will be saved from. If not provided, the text channel that the command was sent from will be chosen.|
| exclude-bot-messages (optional) | If bot messages should be excluded in the message collection. Default is true |

#### stop-remembering <a name="stop-remembering"></a>
Stop remembering messages in a specific channel