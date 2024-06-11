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

(async () => {
    await db.Models.CheckInResponse.sync({ force: true });
    await db.Models.UnavailableSchedule.sync({ force: true });

    try {
        await db.addCheckInResponse({
            id:    '1234',
            rose:  5,
            thorn: 'this is a thorn',
            bud:   'this is a bud',
        });
        console.log(await db.getCheckInResponses('1234', 5).map(r => r.dataValues).join('\n'));

        await db.addCheckInResponse({ rose: 'this is a rose', });
        console.log(await db.getCheckInResponses('1234', 5).map(r => r.dataValues).join('\n'));

        await db.addUnavailable();
    }
    catch (err) { console.log(err); }


})()
    .then(() => {
        console.log('fin');
    });


client.login(process.env.DISCORD_TOKEN);
