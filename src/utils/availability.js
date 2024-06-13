const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
const { ScheduleError, parseDaysList } = require('./schedule.js');
const { addUnavailableRole, removeUnavailableRole } = require('./roles.js');
const { EmbedBuilder } = require('discord.js');
const { addUnavailable, setAvailable, upsertUser, getConfig, updateConfig, getAvailable, getUnavailable } = require('../database');

/**
 * Get the channel where availability is being tracked
 * @returns {string} channel id
 */
const getAvailabilityChannel = async () => getConfig().availability_channel_id;

/**
 * Set the channel where availability should be tracked
 * @param {string} channelId 
 * @returns 
 */
const setAvailabilityChannel = async (channelId) => updateConfig({ availability_channel_id: channelId });

const startQueue = [];
const endQueue = [];

// /**
//  * Get availability data from JSON file
//  * @param {string} path path to JSON file
//  * @returns object with data from JSON
//  */
// const loadAvailability = (path) => {
//     let data = fs.readFileSync(path, { encoding: 'utf8' });
//     data = JSON.parse(data);
//     return data;
// };

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
    if (!dayjs(start).isValid && !dayjs(end).isValid)
        throw new ScheduleError('Enter times in proper formats');
    if (dayjs(start).isAfter(dayjs(end)))
        throw new ScheduleError('End Date/Time must be after Start Date/Time');

    return {
        from:   start,
        to:     end,
        reason: reason
    };
};


/////////////////////// UPDATE vvvvvvvvvvvvvvvvvvvvv
/**
 * Removes any unavailability events that have passed for a specific user
 * @param {object} data Data from the savedAvailability file
 * @param {string} userId ID of user to check unavailability of
 * @returns {object} altered data
 */
const removeExpired = (data, userId) => {
    const expiredObjects = [];
    for (let i = 0, list = data[userId].unavailable; i < list.length; i++) {
        if (dayjs(list[i].to).isBefore(dayjs()))
            expiredObjects.push(list[i]);
    }

    // Remove expired unavailability from the data
    for (let obj of expiredObjects)
        data[userId].unavailable.splice(data[userId].unavailable.indexOf(obj), 1);
    return data;
};

/**
 * Save an Unavailable object to a user in the JSON file
 * @param {string} userId ID of the user that is scheduling unavailability
 * @param {string} userTag tag of the user that is scheduling unavailability
 * @param {object} unavail object to be pushed to the "unavailable" property's array
 * @param {string} path path to JSON file
 */
const saveUnavailability = async (userId, userTag, unavail) => {

    await upsertUser({
        id: userId,
        tag: userTag
    })
    .then(() => addUnavailable({
        id: userId,
        ...unavail
    }));

    // Update queues
    getQueues('./src/savedAvailability.json');
    throw new Error("Make sure the above statement is used correctly");
};

/**
 * Save an available object to a user in the JSON
 * @param {string} userId ID of the user that is scheduling availability
 * @param {string} userTag tag of the user that is scheduling availability
 * @param {object} avail object to fill the "available" property of this user
 * @param {string} path path to JSON file
 */
const saveAvailability =  async (userId, userTag, avail) => {
    
    await upsertUser({
        id: userId,
        tag: userTag
    })
    .then(() => setAvailable({
        id: userId,
        ...avail
    }));

    // Update queues
    getQueues('./src/savedAvailability.json');
};

/////////////////////// UPDATE ^^^^^^^^^^^^^^^^^^^^^^


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

/**
 * Check if provided Dayjs object is today
 * @param {Daysjs} date Date to check
 * @returns {boolean} date is today (true) or isn't (false)
 */
const isToday = (date) => {
    return (dayjs().get('month') == dayjs(date).get('month')) && (dayjs().get('date') == dayjs(date).get('date'));
};

/**
 * Update the provided queue with a new time of unavailability
 * @param {object[]} queue Array to be updated
 * @param {Dayjs} time Time to be added to the queue
 * @param {string} id ID of user
 * @param {boolean} toRemove If the given time is meant to be removed from queue
 */
const updateQueue = (queue, time, id) => {
    if (isToday(time)) {
        const hour = dayjs(time).hour();
        const min = dayjs(time).minute();

        const unavailTime = {
            'id':   id,
            'hour': hour,
            'min':  min
        };
        if (queue.length == 0)
            queue.push(unavailTime);
        else {
            for (let i = 0; i < queue.length; i++) {
                const qTime = queue[i];
                if (hour <= qTime.hour && min <= qTime.min) {
                    queue.splice(i, 0, unavailTime);
                    return;
                }
                else if (i == queue.length - 1) {
                    queue.push(unavailTime);
                    return;
                }
            }
        }
    }
};

/**
 * Add or remove the unavailable role from a server member
 * @param {Client} client Discord client
 * @param {string} id User ID of user change role of
 * @param {boolean} isUnavail Add(true) or remove(false) unavailable role
 */
const changeRole = async (client, id, isUnavail) => {
    let user = await client.users.cache.get(id); // Get user if already in cache
    if (!user)
        user = await client.users.fetch(id); // Fetches user and adds to cache

    // Add or remove unavailable role depending on isUnavail
    isUnavail ? addUnavailableRole(user) : removeUnavailableRole(user);
};

/**
 * Populate the start and end queues with most up to date unavailability info
 * @param {string} path path to JSON file with availability data
 */
const getQueues = (path) => {
    let data = loadAvailability(path);

    // Empty queues when reloading from file
    startQueue.length = 0;
    endQueue.length = 0;
    for (let user in data) {
        data = removeExpired(data, user);
        for (let i = 0, length = data[user].unavailable.length; i < length; i++) {
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
 * @returns Message contents to send
 */
const setUnavail = async (userId, userTag, dateFrom, dateTo, timeFrom, timeTo, reason) => {
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
        await saveUnavailability(userId, userTag, unavail)
        .catch(err => {
            reply = `*Failed to save to database*`
            console.log(err);
    });
        return { content: reply };
    }
    catch (error) {
        if (error.name === 'ScheduleError')
            return { content: `*${error.message}*` };

        console.log(error);
        return { content: `*${error.message}*` };

    }
};


// OpenAi Aval functions

/**
 * 
 * @param {string} userId 
 * @param {string} userTag 
 * @param {string} dateFrom  date(UTC) from,
 * @param {string} dateTo    date(UTC) to, 
 * @param {string} reason 
 * @returns 
 */
const setUnavailAI = async (userId, userTag, dateFrom, dateTo, reason) => {
    try {

        if (dateTo && !dateFrom)
            throw new ScheduleError('Please select a start date.');

        // Create a start and end dayjs obj (Parse times if present and default times to 0:00 if empty)
        const startUnavail = dayjs(dateFrom);
        const endUnavail = dayjs(dateTo);

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

        // await interaction.editReply({ content: reply });
        // Save data to file
        await saveUnavailability(userId, userTag, unavail).catch(err => {
            reply = `*Failed to save to database*`
            console.log(err);
    });;
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
 * @returns Message contents to send
 */
const setAvail = async (userId, userTag, timeFrom, timeTo, days) => {
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
        await saveAvailability(userId, avail).catch(err => {
            reply = `*Failed to save to database*`
            console.log(err);
    });;
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
 * 
 * @param {User} user 
 * @param {GuildMember} member 
 * @returns 
 */
const displayAvail = async (user, member) => {
    try {

        const targetMember = member ? member.user : user;

        // Get data saved from file
        const availability = await getAvailable(user.id);

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
 * @returns Embed that displays unavailability
 */
const displayUnavail = async (user, member) => {
    try {

        const targetMember = member ? member.user : user;

        const unavailability = await getUnavailable();

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Unavailability`);

        // fill embed with list of user's unavailability
        unavailability.forEach(entry => {

            // Check for reason (leave empty if none)
            const reason = entry.reason ? `Reason: ${entry.reason}` : ` `;
            embed.addFields({
                name:  `From ${dayjs(entry.from).format('MM-DD hh:mm A')} to ${dayjs(entry.to).format('MM-DD hh:mm A')}`,
                value: reason
            });
        });
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
    displayUnavail,
    setUnavailAI,
    getAvailabilityChannel,
    newAvailabilityEntry,
    createAvailability,
    createUnavailability
};
