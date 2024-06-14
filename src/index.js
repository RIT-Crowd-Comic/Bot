const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const db = require('./database');
const dayjs = require('dayjs');
const { createSchedule } = require('./utils/schedule');

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
    await db.Models.CheckInResponse.sync({ force: true });
    await db.Models.UnavailableSchedule.sync({ force: true });
    await db.Models.AvailableSchedule.sync({ force: true });
    await db.Models.CheckInSchedule.sync({ force: true });
    await db.Models.User.sync({ force: true });
    await db.Models.Config.sync();

    try {

        // await db.updateConfig({ availability_channel_id: '1240715737702596689', server_id: '1219755314518163477' });
        await db.touchUser({
            id:           '1234',
            tag:          '.user',
            display_name: 'BIG MAN 67',
            global_name:  'name'
        });

        console.log(await db.addCheckInSchedule(
            '1234',
            createSchedule(['monday', 'wednesday'], dayjs())
        ));

        console.log(`deleted ${await db.deleteCheckInSchedule(1)}`);

        console.log(await db.addCheckInResponse(
            '1234',
            {
                rose:  5,
                thorn: 'this is a thorn',
                bud:   'this is a bud',
            }
        ));


        (await db.getCheckInResponses('1234', 5)).forEach(r => void console.log(r.dataValues));

        await db.addCheckInResponse(
            '1234',
            { rose: 'this is a rose', }
        );
        (await db.getCheckInResponses('1234', 5)).forEach(r => void console.log(r.dataValues));

        await db.addUnavailable({
            id:     '1234',
            from:   dayjs(),
            to:     dayjs(),
            reason: 'going swimming'
        });
        (await db.getUnavailable('1234')).forEach(r => void console.log(r.dataValues));

        await db.setAvailable({
            id:   '1234',
            from: dayjs(),
            to:   dayjs(),
            days: ['monday', 'wednesday', 'friday']
        });
        console.log(await db.getAvailable('1234'));
    }
    catch (err) { console.log(err); }


})()
    .then(() => {
        console.log('fin');
    });


client.login(process.env.DISCORD_TOKEN);
