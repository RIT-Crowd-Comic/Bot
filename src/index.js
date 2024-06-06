const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const db = require('./utils/database');

// setup discord
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

eventHandler(client);

// set up database before connecting

db.retryConnect(10000)

// test a query
    .then(() => db.testQuery().then(res => console.log(res)));

client.login(process.env.DISCORD_TOKEN);
