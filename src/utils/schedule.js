const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const weekday = require('dayjs/plugin/weekday');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { addCheckInSchedule, getCheckInSchedules, upsertUser,getDBQueue,addCheckInQueue,deleteCheckInReminder } = require('../database');

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(localizedFormat);

const queue = [];
const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const abbreviations = {
    'm':  'monday',
    't':  'tuesday',
    'w':  'wednesday',
    'th': 'thursday',
    'h':  'thursday',
    'f':  'friday',
    'sa': 'saturday',
    'su': 'sunday',
};

class ScheduleError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ScheduleError';
    }
}

/**
 * creates a string of the users schedule in their local time
 * @param {schedule object} schedule 
 * @returns 
 */
const displaySchedule = (schedule) => {
    const everyDay = validDays.every(d => schedule.local_days.includes(d));
    const days = everyDay ? 'every day' : `[${schedule.local_days.join(', ')}]`;

    // Adds a zero if necessary. Ex: '5:5' to '5:05'
    let min = schedule.local_time[1].toString();
    min = min.length === 1 ? `0${min}` : min;

    const time = `${schedule.local_time[0]}:${min} (24 hr time)`;
    return `${days} at ${time}`;
};

/**
 * Takes a list of valid days and a Dayjs object containing
 * just a valid time and returns a schedule object.
 * @param {string[]} daysList 
 * @param {Dayjs} time 
 * @returns {{
 * utc_days: string[],
 * utc_time: number[],
 * local_days: string[],
 * local_time: number[]
 * }}
 */
const createSchedule = (daysList, time) => {

    // check if list of days is valid
    if (daysList.some(d => !validDays.includes(d))) {
        throw new ScheduleError('Invalid list of days. (abbreviations: m t w (th or h) f sa su).');
    }

    // days should be in chronological order with work week starting on sunday
    daysList.sort((a, b) => validDays.indexOf(a) - validDays.indexOf(b));


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
        utc_days:   utcDays,
        utc_time:   [utcHour, utcMin],
        local_days: [...daysList],
        local_time: [timeHours, timeMinutes],
    };
};

/**
 * Parse a string of days into a valid list of days
 * @param {string} days list of days separated by regex [,\s|]
 * @returns {string[]}
*/
const parseDaysList = (days) => {
    days = days.toString().trim();
    let parsedDays;
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

    // make sure days are distinct
    parsedDays = parsedDays.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });

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
 * @param {string} id user id
 */
const sendCheckInReminder = async (client, id) => {

    let user = await client.users.cache.get(id);
    if (!user) { // checks if user is already in cache
        user = await client.users.fetch(id); // fetches user (will add to the cache)
    }

    // check-in interface module
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
            content:    reply,
            components: [actions]
        });

    }
    catch (error) {
        console.log(error);
        await user.send({ content: 'could not process command' });
    }

};

/**
 * creates a reminder object to add to the que then inserts it in the correct chronological placement
 * @param {string[]} days array of schedule days
 * @param {int[]} utcTime utc reminder [hour,min]
 * @param {string} id user id
 * @param {bool} toRemove whether or not you want to remove (default=false)
 */
const updateQueue = async (days, utcTime, id, toRemove = false) => {
    const hour = utcTime[0];
    const min = utcTime[1];

    const reminder = {
        'id':   id,
        'hour': hour,
        'min':  min
    };

    // if affects today's queue
    if (days.includes(checkCurrentDay())) {
        let index = queue.indexOf(reminder);
        if (index && toRemove) { // if it exists in the queue and we want to remove
            queue.splice(index, 1);
            await deleteCheckInReminder(reminder)
        }
        else if (index == -1 && queue.length == 0) { // if queue is empty
            queue.push(reminder);
            await addCheckInQueue(reminder)
        }
        else { // inserting into queue
            for (let t = 0; t < queue.length; t++) {
                const time = queue[t];
                const same = time.id == id && time.hour == hour && time.min == min;
                if (hour <= time.hour && min <= time.min && !same) {
                    queue.splice(t, 0, reminder);
                    return;
                }
                else if (t == queue.length - 1 && !same) {
                    queue.push(reminder);
                    return;
                }
                await addCheckInQueue(reminder)
            }
        }

    }
};

/**
 * called when the day starts and the db queue is empty
 * gets the current day's scheduled times & users
 * orders them chronologically in the queue[] via updateQueue
 */
const getDayOrder = async () => {

    /**
    * checks to see if users have a scheduled day today
    * creates and adds a reminder object with the time and user id to the queue using updateQueue()
    */
    getCheckInSchedules().then(schedules => {
        schedules.forEach(schedule => {
            updateQueue(schedule.utc_days, schedule.utc_time, schedule.user_id);
        });
    });

};


/**
 * gets the current utc day of week number
 * converts number to name of day
 * @returns {string} currentDayOfWeek: current utc day of the week
 */
const checkCurrentDay = () => {
    const now = dayjs.utc();// .format()
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayOfWeek = daysOfWeek[now.weekday()];
    return currentDayOfWeek;
};

/**
 * gets the queue from the database 
 * then orders it chronologically into the queue via updateQueue()
 */
const getQueue = async() => {
    queue.length=0
    await getDBQueue("checkIn").then(reminder=>{
        updateQueue(reminder)
    } )
    getDayOrder(checkCurrentDay());
};

/** 
* Checks to see if a user has any schedules
* @param {object} user - The discord user who's schedules are being checked
* @return {object} a response that states if the user doesn't have any schedules or an error occurred, or if they do
*/
const validScheduleUser = async (user) => {
    const userId = user?.id;

    // todo: command should include a user
    if (!userId) {
        return { status: 'Fail', description: '*Invalid user*' };
    }

    // verify the person has schedules
    if ((await getCheckInSchedules(userId)).length === 0) {
        return { status: 'Fail', description: '*You have no schedules! Create one with `/check-in schedule`*' };
    }

    return { status: 'Success' };
};

/**
 * 
 * @param {User} user 
 * @returns {{
 * status: string,
 * description: string,
 * schedules: object}}
 */
const getSchedules = async (user) => {

    try {
        const response = await validScheduleUser(user);
        if (response.status === 'Fail') {
            return response;
        }

        const userId = user?.id;

        // get and return the schedules
        const schedules = await getCheckInSchedules(userId);

        return { status: 'Success', description: 'Here are your schedules', schedules: schedules };
    }
    catch (error) {
        return { status: 'Fail', description: error };
    }
};

/**
 * Adds a new check in schedule with 
 * @param {object} user the discord user who's schedule will be updated
 * @param {String} days the day(s) the user will be reminded
 * @param {String} time the time the user will be reminded
 * @returns either a successful response, or a failed one with a description as to why
 */
const scheduleCheckIn = async (user, days, time) => {
    try {
        const userId = user.id;
        const userTag = user.tag;

        // todo: command should include a user
        if (!userId || !userTag) {
            return { status: 'Fail', description: '*User is invalid*' };
        }

        const parsedDays = parseDaysList(days);
        const parsedTime = parseTime(time);
        const schedule = createSchedule(parsedDays, parsedTime);

        await
        upsertUser({
            id:           userId,
            tag:          userTag,
            display_name: user.display_name ?? '',
            global_name:  user.display_name ?? '',
        }).then(() => addCheckInSchedule(user.id, schedule));

        updateQueue(schedule.utc_days, schedule.utc_time, userId);

        return { status: 'Success', description: `Check ins scheduled for ${displaySchedule(schedule)}` };

    }
    catch (error) {
        return { status: 'Fail', description: error };
    }
};

module.exports = {
    createSchedule,
    parseDaysList,
    parseTime,
    displaySchedule,
    sendCheckInReminder,
    getQueue,
    updateQueue,
    getSchedules,
    scheduleCheckIn,
    getDayOrder,
    queue,
    ScheduleError,
    validScheduleUser
};
