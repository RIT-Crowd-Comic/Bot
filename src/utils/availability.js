const fs = require('fs');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const { ScheduleError, parseDaysList } = require('./schedule.js');
const {addUnavailableRole, removeUnavailableRole} = require('./roles.js');
const { EmbedBuilder } = require('discord.js');

let availabilityChannel = undefined;
const getAvailabilityChannel = async () => { return availabilityChannel; };
const setAvailabilityChannel = channel => { availabilityChannel = channel; };

const startQueue = [];
const endQueue = [];

/**
 * Get availability data from JSON file
 * @param {string} path path to JSON file
 * @returns object with data from JSON
 */
const loadAvailability = (path) => {
    let data = fs.readFileSync(path, { encoding: 'utf8' });
    data = JSON.parse(data);
    return data;
};

/**
 * Generate a default availability entry for a user
 * @param {string} userId ID of user to create object for
 * @param {string} userTag tag of user to create object for
 * @returns default availability object
 */
const newAvailabilityEntry = (userId, userTag) => {
    return {
        userId:    userId,
        userTag:   userTag,
        available: {

            // Random day used for object creation, has no effect on result
            from: dayjs('2024 5-20 09:00'),
            to:   dayjs('2024 8-9 17:00'),
            days: parseDaysList('daily')
        },
        unavailable: []
    };
};

/**
 * Create Available object
 * @param {Dayjs} start beginning time of availability
 * @param {Dayjs} end end time of availability
 * @param {string[]} days array of days the user is available 
 * @returns object to fill the "available" property in an availability entry
 */
const createAvailability = (start, end, days) => {
    if (!dayjs(start).isValid && !dayjs(end).isValid)
        throw new ScheduleError('Enter times in proper formats');
    if (dayjs(start).isAfter(dayjs(end)))
        throw new ScheduleError('End Date/Time must be after Start Date/Time');

    return {
        from: start,
        to:   end,
        days: days
    };
};

/**
 * Create Unavailable object
 * @param {Dayjs} start begining of an unavailability block
 * @param {Dayjs} end end of an unavailability block
 * @param {string} reason reason for being unavailable
 * @returns object to be pushed to the "unavailable" property array in the availability object
 */
const createUnavailability = (start, end, reason) => {
    if (dayjs(start).isAfter(dayjs(end)))
        throw new ScheduleError('End Date/Time must be after Start Date/Time');

    return {
        from:   start,
        to:     end,
        reason: reason
    };
};

/**
 * Save an Unavailable object to a user in the JSON file
 * @param {string} userId ID of the user that is scheduling unavailability
 * @param {string} userTag tag of the user that is scheduling unavailability
 * @param {object} unavail object to be pushed to the "unavailable" property's array
 * @param {string} path path to JSON file
 */
const saveUnavailability = (userId, userTag, unavail, path) => {

    // Get saved data from file and turn into array with objects
    let fileContent = loadAvailability(path);

    fileContent[userId] ??= newAvailabilityEntry(userId, userTag);
    fileContent[userId].unavailable.push(unavail);

    // Send data back to file
    fs.writeFileSync(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));

    //Update queues
    getQueues('./src/savedAvailability.json');
};

/**
 * Save an available object to a user in the JSON
 * @param {string} userId ID of the user that is scheduling availability
 * @param {string} userTag tag of the user that is scheduling availability
 * @param {object} avail object to fill the "available" property of this user
 * @param {string} path path to JSON file
 */
const saveAvailability = (userId, userTag, avail, path) => {
    let fileContent = loadAvailability(path);

    fileContent[userId] ??= newAvailabilityEntry(userId, userTag);
    fileContent[userId].available = avail;

    // Send data back to file
    fs.writeFile(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));

    //Update queues
    getQueues('./src/savedAvailability.json');
};

const updateAvailabilityChannel = async newChannel => {
    const oldChannel = await getAvailabilityChannel();

    // check if new id is the same as the current one
    if (oldChannel && oldChannel.id === newChannel.id) {
        return { content: `<#${oldChannel.id}> is already the availability channel` };
    }

    // set the new channel as the current one
    setAvailabilityChannel(newChannel);

    return { content: `<#${newChannel.id}> is the new availability channel` };
};

const isToday = (date) => {
    return (dayjs().get('month')==dayjs(date).get('month'))&&(dayjs().get('date')==dayjs(date).get('date'));
};

const updateQueue = (queue, time, id, toRemove = false) => {
    if(isToday(time)){
        const hour = dayjs(time).hour();
        const min = dayjs(time).minute();

        const reminder = {
            'id':   id,
            'hour': hour,
            'min':  min
        };
        let index = queue.indexOf(reminder);
        if(index && toRemove)
            queue.splice(index,1);
        else if(index==-1 && queue.length == 0)
            queue.push(reminder)
        else{
            for(let i = 0; i<queue.length; i++) {
                const qTime = queue[i];
                const same = qTime.id == id && qTime.hour == hour && qTime.min == min;
                if(hour <= qTime.hour && min <= qTime.min && !same){
                    queue.splice(i, 0, reminder);
                    return;
                }
                else if(i==queue.length-1 && !same){
                    queue.push(reminder);
                    return;
                }
            }
        }
    }
};

const changeRole = async (client, id, isUnavail) => {
    let user = await client.users.cache.get(id); //Get user if already in cache
    if(!user)
        user = await client.users.fetch(id); //Fetches user and adds to cache

    //Add or remove unavailable role depending on isUnavail
    isUnavail ? addUnavailableRole(user) : removeUnavailableRole(user);
}

const getQueues = (path) => {
    const data = loadAvailability(path);

    for (let user in data){
        for(let i = 0, length = data[user].unavailable.length; i<length; i++){
            updateQueue(startQueue, data[user].unavailable[i].from, user);
            updateQueue(endQueue, data[user].unavailable[i].to, user);
        }
    }
};

// Command Functions
/**
 * Schedule a block a user is unavailable for
 * @param {string} userId ID of user scheduling unavailability
 * @param {string} userTag tag of user scheduling unavailability
 * @param {string} dateFrom starting date of unavailability
 * @param {string} dateTo end date of unavailability
 * @param {string} timeFrom time on start date unavailability begins at
 * @param {string} timeTo time on end date unavailability stops at
 * @param {string} reason reason for unavailability
 * @param {string} path path to JSON file
 * @returns Message contents to send
 */
const setUnavail = (userId, userTag, dateFrom, dateTo, timeFrom, timeTo, reason, path) => {
    try {
        if (dateTo && !dateFrom)
            throw new ScheduleError('Please select a start date.');
        if (timeTo && !timeFrom)
            throw new ScheduleError('Please select a start time.');

        // Check if time given is a number and if it is in proper format
        if (timeFrom && !isNaN(timeFrom))
            timeFrom = timeFrom.includes(':') ? timeFrom : `${timeFrom}:00`;
        if (timeTo && !isNaN(timeTo))
            timeTo = timeTo.includes(':') ? timeTo : `${timeTo}:00`;

        // Create a start and end dayjs obj (Parse times if present and default times to 0:00 if empty)
        const startUnavail = dayjs(`2024 ${dateFrom} ${timeFrom ? timeFrom : '0:00'}`);
        const endUnavail = dayjs(`2024 ${dateTo} ${timeTo ? timeTo : '23:59'}`);

        // Check if dates are valid
        if (!dayjs(startUnavail).isValid() || !dayjs(endUnavail).isValid())
            throw new ScheduleError('Please enter correctly formatted dates and times');

        const unavail = createUnavailability(startUnavail, endUnavail, reason);

        // Print data for now
        let reply = [
            '```',
            JSON.stringify(unavail, undefined, 2),
            '```',
        ].join('\n');

        // Save data to file
        saveUnavailability(userId, userTag, unavail, path);
        return { content: reply };
    }
    catch (error) {
        if (error.name === 'ScheduleError')
            return { content: `*${error.message}*` };

        console.log(error);
        return { content: `*${error.message}*` };

    }
};

/**
 * Record when a user is typically available
 * @param {string} userId ID of user scheduling availability
 * @param {string} userTag tag of user scheduling availability
 * @param {string} timeFrom start time on available days
 * @param {string} timeTo end time on available days
 * @param {string} days days of the week a user works
 * @param {string} path path to the JSON file
 * @returns Message contents to send
 */
const setAvail = (userId, userTag, timeFrom, timeTo, days, path) => {
    try {
        if (!timeFrom || !timeTo)
            throw new ScheduleError('Enter both start AND end times');

        // Parse the day list into an array
        const parsedDays = parseDaysList(days ? days : 'daily');

        timeFrom = timeFrom.replace(/\s*([ap]m)/, ' $1');
        timeTo = timeTo.replace(/\s*([ap]m)/, ' $1');

        const timeFormats = ['Y h:mma', 'Y h:mmA', 'Y H:mm'];

        // Create a start and end dayjs obj (arbitrary day used, does not affect time result)
        const startAvail = dayjs(`2024 ${timeFrom}`, timeFormats);
        const endAvail = dayjs(`2024 ${timeTo}`, timeFormats);

        const avail = createAvailability(startAvail, endAvail, parsedDays, userId, userTag);

        // Print data for now
        let reply = [
            '```',
            JSON.stringify(avail, undefined, 2),
            '```',
        ].join('\n');

        // Save data to file
        saveAvailability(userId, userTag, avail, path);
        return { content: reply };
    }
    catch (error) {
        if (error.name === 'ScheduleError') {
            return { content: `*${error.message}*` };
        }

        console.log(error);
        return { content: `*${error.message}*` };
    }
};

/**
 * Display the availability of self or requested server member
 * @param {User} user User object of user that called the command
 * @param {GuildMember} member object of the (optional) requested member
 * @param {string} path path to the JSON file
 * @returns Embed that displays availability
 */
const displayAvail = (user, member, path) => {
    try {

        const targetMember = member ? member.user : user;

        // Get data saved from file
        const fileContent = loadAvailability(path);

        // If no matching user was found in the data, 
        if (!fileContent[targetMember.id])
            return { content: 'Requested member has no available data' };

        const availability = fileContent[targetMember.id].available;

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Availability`)
            .setDescription(`Available from ${dayjs(availability.from).format('hh:mm A')}-${dayjs(availability.to).format('hh:mm A')} on ${availability.days.join(', ')}`);
        return { embeds: [embed] };
    }
    catch (error) {
        console.log(error);
        return { content: `*Issue running command*` };
    }
};

/**
 * Display the availability of self or requested server member
 * @param {User} user User object of user that called the command
 * @param {GuildMember} member object of the (optional) requested member
 * @param {string} path path to the JSON file
 * @returns Embed that displays unavailability
 */
const displayUnavail = (user, member, path) => {
    try {

        const targetMember = member ? member.user : user;

        // Get data saved from file
        const fileContent = loadAvailability(path);

        // If no matching user was found in the data, 
        if (!fileContent[targetMember.id])
            return { content: 'Requested member has no available data' };

        const unavailability = fileContent[targetMember.id].unavailable;

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Unavailability`);
        for (let i = 0, length = unavailability.length; i < length; i++) {

            // Check for reason (leave empty if none)
            const reason = unavailability[i].reason ? `Reason: ${unavailability[i].reason}` : ` `;
            embed.addFields({
                name:  `From ${dayjs(unavailability[i].from).format('MM-DD hh:mm A')} to ${dayjs(unavailability[i].to).format('MM-DD hh:mm A')}`,
                value: reason
            });
        }
        return { embeds: [embed] };
    }
    catch (error) {
        console.log(error);
        return { content: `*Issue running command*` };
    }
};

module.exports = {
    updateAvailabilityChannel,
    startQueue,
    endQueue,
    getQueues,
    changeRole,
    setUnavail,
    setAvail,
    displayAvail,
    displayUnavail
};
