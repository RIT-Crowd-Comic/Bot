const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const weekday = require('dayjs/plugin/weekday');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Client } = require("discord.js");
const { Dayjs } = dayjs;
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);

const queue=[]
const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const abbreviations = {
    'm': 'monday',
    't': 'tuesday',
    'w': 'wednesday',
    'th': 'thursday',
    'h': 'thursday',
    'f': 'friday',
    'sa': 'saturday',
    'su': 'sunday',
};

const displaySchedule = (schedule) => {
    const everyDay = validDays.every(d => schedule.localDays.includes(d));
    const days = everyDay ? 'every day' : `[${schedule.localDays.join(', ')}]`;
    
    // Adds a zero if necessary. Ex: '5:5' to '5:05'
    let min = schedule.localTime[1].toString();
    min = min.length === 1 ? `0${min}` : min;

    const time = `${schedule.localTime[0]}:${min} (24 hr time)`;
    return `${days} at ${time}`;
};

/**
 * Takes a list of valid days and a Dayjs object containing
 * just a valid time and returns a schedule object.
 * @param {string[]} daysList 
 * @param {Dayjs} time 
 * @returns { Object } schedule
 * @returns { String[] } schedule.days
 * @returns { Number[] } schedule.utcTime,
 * @returns { string } schedule.displaySchedule
 */
const createSchedule = (daysList, time) => {
    // check if list of days is valid
    if (daysList.some(d => !validDays.includes(d))) {
        throw new ScheduleError('Invalid list of days. (abbreviations: m t w (th or h) f sa su).');
    }

    if (!time.isValid) throw new ScheduleError('Invalid time');
    if (!time.isValid()) throw new ScheduleError('Invalid time');

    // done validating, create schedule
    const timeHours = time.hour();
    const timeMinutes = time.minute();

    // calculate difference from local time zone to UTC-0.
    // This is to ensure that everyone's notifications are timed properly 
    // regardless of time zone
    const firstScheduleDay =
        dayjs()
            .day(validDays.indexOf(daysList[0])) // must use integer
            .hour(timeHours)
            .minute(timeMinutes);
    const utcHour = firstScheduleDay.utc().hour();
    const utcMin = firstScheduleDay.utc().minute();
    // Since times close to midnight can translate to the next day (or previous day)
    // in UTC, the following code will shift the user's day schedule accordingly

    const utcDays = daysList.map(day => {
        const dayIndex = validDays.indexOf(day); // dayjs() uses index
        return validDays[firstScheduleDay.day(dayIndex).utc().day()];
    });

    return {
        utcDays: utcDays,
        utcTime: [utcHour, utcMin],
        localDays: [...daysList],
        localTime: [timeHours, timeMinutes], 
    };
};

/**
 * Remove any duplicate time entries
 * @param {*} schedules 
 * @returns 
 */
const mergeSchedules = (schedules) => {

    // current issue:
    // displaySchedule will not update after schedules are 
    // merged. Figure out some better way to deal with that
    throw new Error('Not yet implemented');

    // clone 2 levels deep
    const mergedSchedules = [];
    schedules.forEach(s => {
        let duplicate = false;
        // iterate backwards because we're modifying the array
        for (let i = mergedSchedules.length - 1; i >= 0; i--) {
            const m = mergedSchedules[i];
            // find matching times
            if (s.utcTime.every((t, i) => t === m.utcTime[i])) {
                s.days.forEach(d => {
                    if (!m.days.includes(d)) {
                        m.days.push(d);
                    }
                });
                duplicate = true;
            }
            // otherwise, add schedule to list
        }
        if (!duplicate) {
            mergedSchedules.push({
                days: [...s.days],
                utcTime: [...s.utcTime],
                displaySchedule: s.displaySchedule
            });
        }
    });
    return mergedSchedules;
};


/**
 * Parse a string of days into a valid list of days
 * @param {string} days list of days separated by regex [,\s|]
 * @returns {string[]}
*/
const parseDaysList = (days) => {
    days = days.toString().trim();
    let parsedDays = [];
    const daily = days.toLocaleLowerCase().startsWith('daily');
    // split days by regex [,\s|]
    if (daily) {
        parsedDays = validDays;
    }
    else {
        parsedDays = days.split(/[\s,|]+/i).map(s => s.toString().toLocaleLowerCase());
    }
    // replace abbreviated days
    parsedDays = parsedDays.map(d => abbreviations[d] ?? d);

    if (parsedDays.some(d => !validDays.includes(d))) {
        throw new ScheduleError('Invalid list of days. (abbreviations: m t w (th or h) f sa su).');
    }

    return parsedDays;
};

/**
 * Parse time from string
 * @param {string} time 
 * @returns {Dayjs}
 */
const parseTime = (time) => {
    // dayjs requires space between `hh:mm am/pm`
    // regex allows user to have any number of spaces or no space at all
    let parsedTime = time.replace(/\s*([ap]m)/, ' $1');
    // date is required for parsing, even just 'Y'
    // using a day from the past (1/1 2024, a monday) to parse time
    const timeFormats = ['Y h:mma', 'Y h:mmA', 'Y H:mm'];
    parsedTime = dayjs(`2024 ${parsedTime}`, timeFormats);

    if (!parsedTime.isValid()) throw new ScheduleError('Invalid time');
    return parsedTime;
};

/**
 * sends DM to user with check-in reminder interface
 * @param {*} client 
 * @param {*} id user id
 */
const sendMessage=async (client,id)=>{

    let user = await client.users.cache.get(id);
    if (!user) {//checks if user is already in cache
        user = await client.users.fetch(id); //fetches user (will add to the cache)
    }

    //checkin interface module
    let reply = [
        'Would you like to spend a few minutes to describe how you\'re doing? ',
        'Feel free to leave any fields blank. ',
        'Keep in mind that your response may be viewed by an administrator. ',
        '** **',
    ].join('\n');

    const actions = new ActionRowBuilder();
    const yesBtn = new ButtonBuilder()
        .setCustomId('check-in-start-btn')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Primary);
    const laterBtn = new ButtonBuilder()
        .setCustomId('check-in-later-btn')
        .setLabel('Remind Me Later')
        .setStyle(ButtonStyle.Secondary);
    const notNowBtn = new ButtonBuilder()
        .setCustomId('check-in-cancel-btn')
        .setLabel('Not Today')
        .setStyle(ButtonStyle.Secondary);

    actions.addComponents(yesBtn, laterBtn, notNowBtn);

    try {
        await user.send({
            content: reply,
            components: [actions]
        });

    } catch (error) {
        await user.send({
            content: 'could not process command'
        });
    }

};
/**
 * delete the past 100 messages
 * @param {*} client 
 * @param {*} interaction 
 */
const deleteAllDMs=async (client,interaction)=>{
    let msgs=[]
    let chan=await client.channels.fetch(interaction.channelId).then(
        cha=>{cha.messages.fetch({ limit: 100 }).then(messages => {
        console.log(`Received ${messages.size} messages`);
        //Iterate through the messages here with the variable "messages".
        messages.forEach(message => msgs.push(message))
        for(let m of msgs){
            m.delete()
          }
      })}
    )
}

class ScheduleError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ScheduleError';
    }
}

module.exports = {
    createSchedule,
    parseDaysList,
    parseTime,
    mergeSchedules,
    displaySchedule,
    sendMessage,
    queue,
    ScheduleError
};