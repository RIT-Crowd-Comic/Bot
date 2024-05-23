# Crowd Comic Bot

How does this work you might ask.

This is a rather complex file system, but it takes care of registering commands and other events for you.

### 1. `src/index.js`

Entrypoint of the bot. It imports the proper libraries and the .env (token for the bot). 
Then it sets up the bot (client) and starts the eventHandler, before finally logging in.

### 2. `src/eventHandler.js`

Gets all the folders under the events folder. Then gets the files within those folders and listens for those events. When the event is called it pulls the corresponding files under the event folder and calls those functions.
Ex. Event folder called ready with a file called consoleLog.js. On the ready event of discord, it takes all of the files under the ready folder, and calls their methods.
Essentially a big event listener. It gets the events by the name of the folder, so name the folders within the events folder carefully. 

### 3. Events

Each file under the events folder must export a function, see files already there for examples. There are other Discord events beyond the currently implemented events. If you want to add more, make a new file under `src/events` and add your event handling files to it.

- `ready`

    When the client is ready (essentially the start of the program)

    - `01RegisterCommands.js` : looks at all the commands within the folders and registers them with the server. Updates commands with edits and deletes them if specified.
    - `02send-message-roles.js` : given a specific channel(config.json) will send a message for role assignment to that channel.
    - `consoleLog.js` : just logs the client is online when everything is done loading.

- `interactionCreate`

    When a user interacts within a server, like a / command. 

    - `handleCommands.js` (shouldn't need any modification): handles the commands when they are called, calls their functions, has permission and bot permission checking,
    as well as devonly and testonly for events specific to those.

    - `roles.js` : trys to assign a role when a role button is clicked, see comments for more details.


### 4. `src/utils` 

These files carry out repetitive tasks

- `areCommandsDifferent.js`: checks if 2 commands are different.
- `getAllFiles.js`: checks a directory and returns all folders OR files from it.
- `getApplicationCommands.js`: grabs the application commands from the discord server (`config.json` has the server id).
- `getLocalCommands.js`: grabs the commands from the "commands" folder.

### 5. Commands

This is where commands go. Make sure to place the command files in a sub folder first.

Each command needs to export a command object, see `src/commands/example/exampleCommand.js` for an example. Commands put into a folder within commands should be automatically registered and added to the server


### EXTRA:

- `.env` has the bot token, and is needed for the bot to work

- `config.json` has some data needed for the bot to work. Currently: 
    - "testServer": Server ID for testing/ server bot is in
    - "clientId": The ID of the BOT
    - "devs": Dev id's, allows for the devonly commands to work
    - "rolesChannelId" : Channel for the roles buttons to be populates on the ready event
    - "roles": Roles of the server, currently they need to match both here and in the server
        ```json
        "roles": [
            {
                "id": id of the role
                "label": label of the role
            }
        ]
        ```





