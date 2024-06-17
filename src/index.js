const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const db = require('./database');

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

// write to console if connected
db.authenticate()
    .then(() => void console.log('Successfully connected to database!'));

// test a bunch of database stuff
// remove this entire section when publishing
(async () => {
    console.log('database tests starting');

    // ESPECIALLY REMOVE .sync()
    // THESE LINES BREAK DATABASES IN PRODUCTION
    // await db.Models.User.sync({ force: true });
    // await db.Models.CheckInResponse.sync({ force: true });
    // await db.Models.UnavailableSchedule.sync({ force: true });
    // await db.Models.AvailableSchedule.sync({ force: true });
    // await db.Models.CheckInSchedule.sync({ force: true });
    // await db.Models.Config.sync();
    // await db.Models.Message.sync({ force: true });
    // await db.Models.UnavailableStart.sync({ force: true });
    // await db.Models.UnavailableStop.sync({ force: true });
    // await db.Models.CheckInReminder.sync({ force: true });

})()
    .then(() => {
        console.log('fin');
    });


client.login(process.env.DISCORD_TOKEN);
