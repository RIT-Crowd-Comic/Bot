const fs = require('fs');
const dayjs = require('dayjs');
const { ScheduleError } = require('./schedule.js');

let availabilityChannel = undefined;
const getAvailabilityChannel = async () => { return availabilityChannel; };
const setAvailabilityChannel = (channel) => { availabilityChannel = channel; };

/**
 * Create Available object
 * @param {Dayjs} start
 * @param {Dayjs} end
 * @param {string} days
 * @returns {Object}
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
 * @param {Dayjs} start
 * @param {Dayjs} end
 * @param {string} reason
 * @returns {Object}
 */
const createUnavailability = (start, end, reason) => {
    if (!dayjs(startUnavail).isValid && !dayjs(endUnavail).isValid)
        throw new ScheduleError('Enter dates and times in proper formats');
    if (dayjs(start).isAfter(dayjs(end)))
        throw new ScheduleError('End Date/Time must be after Start Date/Time');

    return {
        from:   start,
        to:     end,
        reason: reason
    };
};

const saveUnavailability = (userId, userTag, unavail, path) => {

    // Get saved data from file and turn into array with objects
    let fileContent = loadAvailability(path);

    fileContent[userId] ??= newAvailabilityEntry(userId, userTag);
    fileContent[userId].unavailable.push(unavail);

    // Send data back to file
    fs.writeFile(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));
};

const saveAvailability = (userId, userTag, avail, path) => {
    let fileContent = loadAvailability(path);

    fileContent[userId] ??= newAvailabilityEntry(userId, userTag);
    fileContent[userId].available = avail;

    // Send data back to file
    fs.writeFile(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));
};

const newAvailabilityEntry = (userId, userTag) => {
    return {
        userId:    userId,
        userTag:   userTag,
        available: {

            // Random day used for object creation, has no effect on result
            from: JSON.stringify(dayjs('6-4 09:00')),
            to:   JSON.stringify(dayjs('6-4 17:00')),
            days: 'Monday-Friday'
        },
        unavailable: []
    };
};

const loadAvailability = (path) => {
    let data = fs.readFileSync(path, { encoding: 'utf8' });
    data = JSON.parse(data);
    return data;
};

module.exports = {
    createAvailability,
    createUnavailability,
    getAvailabilityChannel,
    setAvailabilityChannel,
    saveUnavailability,
    saveAvailability,
    newAvailabilityEntry,
    loadAvailability
};
