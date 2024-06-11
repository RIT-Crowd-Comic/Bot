const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const db = require('./database');
const dayjs = require('dayjs');

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

    // ESPECIALLY REMOVE .sync()
    // THESE LINES BREAK DATABASES
    await db.Models.CheckInResponse.sync({ force: true });
    await db.Models.UnavailableSchedule.sync({ force: true });

    try {
        await db.addCheckInResponse({
            id:    '1234',
            rose:  5,
            thorn: 'this is a thorn',
            bud:   'this is a bud',
        });
        (await db.getCheckInResponses('1234', 5)).forEach(r => void console.log(r.dataValues));

        await db.addCheckInResponse({
            id:   '1234',
            rose: 'this is a rose',
        });
        (await db.getCheckInResponses('1234', 5)).forEach(r => void console.log(r.dataValues));

        await db.addUnavailable({
            id:     '1234',
            from:   dayjs(),
            to:     dayjs(),
            reason: 'going swimming'
        });
        (await db.getUnavailable('1234')).forEach(r => void console.log(r.dataValues));
    }
    catch (err) { console.log(err); }


})()
    .then(() => {
        console.log('fin');
    });


client.login(process.env.DISCORD_TOKEN);
