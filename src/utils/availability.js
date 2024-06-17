const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const { ScheduleError, parseDaysList, parseTime } = require('./schedule.js');
const { addUnavailableRole, removeUnavailableRole } = require('./roles.js');
const { EmbedBuilder } = require('discord.js');
const {
    addUnavailable, setAvailable, upsertUser, getConfig, updateConfig,
    getAvailable, getUnavailable, getAllUnavailable,
    addAvailableQueue, addUnavailableQueue,
    deleteUnavailableStart, deleteUnavailableStop,
    getUserByDBId,
    deleteExpiredUnavailable
} = require('../database');

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



/**
 * Save an Unavailable object to a user in the JSON file
 * @param {string} userId ID of the user that is scheduling unavailability
 * @param {string} userTag tag of the user that is scheduling unavailability
 * @param {object} unavail object to be pushed to the "unavailable" property's array
 * @param {string} path path to JSON file
 */
const saveUnavailability = async (userId, userTag, unavail) => {

    await upsertUser({
        id:  userId,
        tag: userTag
    })
        .then(() => addUnavailable({
            id: userId,
            ...unavail
        }));

    // Update queues
    await getQueues();
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
        id:  userId,
        tag: userTag
    })
        .then(() => setAvailable({
            id: userId,
            ...avail
        }));

    // Update queues
    await getQueues();
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
 * @param {string} queueType whether it is start queue or stop queue: start, stop
 */
const updateQueue = async (queue, time, id, queueType) => {
    if (isToday(time)) {
        const hour = dayjs(time).hour();
        const min = dayjs(time).minute();

        const unavailTime = {
            'id':   id,
            'hour': hour,
            'min':  min
        };
        if (queue.length == 0) {
            queue.push(unavailTime);

            // adds to prespective db tables
            if (queueType == 'start') {
                await addUnavailableQueue(unavailTime);
            }
            else {
                await addAvailableQueue(unavailTime);
            }

        }
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

                // adds to prespective db tables
                if (queueType == 'start') {
                    await addUnavailableQueue(unavailTime);
                }
                else {
                    await addAvailableQueue(unavailTime);
                }
            }
        }
    }
};

/**
 * Add or remove the unavailable role from a server member
 * @param {Client} client Discord client
 * @param {string} queueItem queue item user change role of
 * @param {boolean} isUnavail Add(true) or remove(false) unavailable role
 */
const changeRole = async (client, queueItem, isUnavail) => {
    let user = await client.users.cache.get(queueItem.id); // Get user if already in cache
    if (!user)
        user = await client.users.fetch(queueItem.id); // Fetches user and adds to cache

    // Add or remove unavailable role depending on isUnavail
    if (isUnavail) {
        await addUnavailableRole(user);
        await deleteUnavailableStart(queueItem);
    }
    else {
        await removeUnavailableRole(user);
        await deleteUnavailableStop(queueItem);
    }
};

/**
 * Populate the start and end queues with most up to date unavailability info
 */
const getQueues = async() => {
    await deleteExpiredUnavailable();

    return getAllUnavailable().then(async schedules=>{ // returns list of unavailable start and stop
        // Empty queues when reloading from file
        startQueue.length = 0;
        endQueue.length = 0;

        for (let i = 0; i < schedules.length; i++) {
            const user = await getUserByDBId(schedules[i].user_id);
            await updateQueue(startQueue, schedules[i].from_time, user.discord_user_id, 'start');// //get user ID from user table object *vNote*
            await updateQueue(endQueue, schedules[i].to_time, user.discord_user_id, 'stop');
        }
    });
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
        if (timeFrom)
            timeFrom = parseTime(timeFrom);
        if (timeTo)
            timeTo = parseTime(timeTo);

        timeFrom ??= dayjs('2024 00:00');
        timeTo ??= dayjs('2024 23:59');

        // Create a start and end dayjs obj (Parse times if present and default times to 0:00 if empty)
        const startUnavail = dayjs(`2024 ${dateFrom}`).hour(timeFrom.hour()).minute(timeFrom.minute());
        const endUnavail = dayjs(`2024 ${dateTo}`).hour(timeTo.hour()).minute(timeTo.minute());

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
                reply = `*Failed to save to database*`;
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
            reply = `*Failed to save to database*`;
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
        await saveAvailability(userId, userTag, avail).catch(err => {
            reply = `*Failed to save to database*`;
            console.log(err);
        });
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
        await upsertUser({
            id:           user.id,
            tag:          user.tag,
            display_name: user.displayName,
            global_name:  user.globalName
        });
        const availability = await getAvailable(user.id);

        // Create an embed to send to the user

        // '==' intentional, null == undefined
        if (availability == undefined) {
            return { content: `*${targetMember.username} has not set up their availabilities. Try running /available set-availability.*` };
        }

        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Availability`)
            .setDescription(`Available from ${dayjs(availability.from_time).format('hh:mm A')}-${dayjs(availability.to_time).format('hh:mm A')} on ${availability.days.join(', ')}`);
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

        await upsertUser({
            id:           user.id,
            tag:          user.tag,
            display_name: user.displayName,
            global_name:  user.globalName
        });
        const unavailability = await getUnavailable(targetMember.id);

        if (unavailability == undefined) {
            return { content: `*${targetMember.username} has not set up their availabilities. Try running /available set-availability.*` };
        }

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle(`${targetMember.username}'s Unavailability`);

        // fill embed with list of user's unavailability
        unavailability.forEach(entry => {

            // Check for reason (leave empty if none)
            const reason = entry.reason ? `Reason: ${entry.reason}` : ` `;
            embed.addFields({
                name:  `From ${dayjs(entry.from_time).format('MM-DD hh:mm A')} to ${dayjs(entry.to_time).format('MM-DD hh:mm A')}`,
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
    createAvailability,
    createUnavailability,
};
