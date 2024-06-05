const fs = require('fs');
const dayjs = require('dayjs');
const { ScheduleError, parseDaysList } = require('./schedule.js');

let availabilityChannel = undefined;
const getAvailabilityChannel = async () => { return availabilityChannel; };
const setAvailabilityChannel = channel => { availabilityChannel = channel; };

const loadAvailability = (path) => {
    let data = fs.readFileSync(path, { encoding: 'utf8' });
    data = JSON.parse(data);
    return data;
};

const newAvailabilityEntry = (userId, userTag) => {
    return {
        userId:    userId,
        userTag:   userTag,
        available: {

            // Random day used for object creation, has no effect on result
            from: JSON.stringify(dayjs('2024 5-20 09:00')),
            to:   JSON.stringify(dayjs('2024 8-9 17:00')),
            days: parseDaysList('daily')
        },
        unavailable: []
    };
};

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
    if (!dayjs(start).isValid && !dayjs(end).isValid)
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
    fs.writeFileSync(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));
};

const saveAvailability = (userId, userTag, avail, path) => {
    let fileContent = loadAvailability(path);

    fileContent[userId] ??= newAvailabilityEntry(userId, userTag);
    fileContent[userId].available = avail;

    // Send data back to file
    fs.writeFile(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));
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

const getSUData = (interaction, path) => {
    return {
        userId: interaction?.user?.id,
        userTag: interaction?.user?.tag,
        dateFrom: interaction.options.get('date-from')?.value,
        dateTo: interaction.options.get('date-to')?.value,
        timeFrom: interaction.options.get('time-from')?.value,
        timeTo: interaction.options.get('time-to')?.value,
        reason: interaction.options.get('reason')?.value,
        path: path
    }

};

//Command Functions
const setUnavail = (userId,userTag,dateFrom,dateTo,timeFrom,timeTo,reason,path) => {
    try {
        if (dateTo && !dateFrom)
            throw new ScheduleError('Please select a start date.');
        if (timeTo && !timeFrom)
            throw new ScheduleError('Please select a start time.');
    
        // Create a start and end dayjs obj (Default times to 0:00 if empty)
        const startUnavail = dayjs(`2024 ${dateFrom} ${timeFrom ? timeFrom : '0:00'}`);
        const endUnavail = dayjs(`2024 ${dateTo} ${timeTo ? timeTo : '23:59'}`);
    
        const unavail = createUnavailability(startUnavail, endUnavail, reason);
    
        // Print data for now
        let reply = [
            '```',
            JSON.stringify(unavail, undefined, 2),
            '```',
        ].join('\n');
    
        //await interaction.editReply({ content: reply });
    
        // Save data to file
        saveUnavailability(userId, userTag, unavail, path);
    
        return reply;
    } catch (error) {
        if (error.name === 'ScheduleError')
            return `*${error.message}*`;
        else {
            console.log(error);
            return `*Issue running command*`;
        }
    }
}

module.exports = {
    createAvailability,
    createUnavailability,
    getAvailabilityChannel,
    setAvailabilityChannel,
    updateAvailabilityChannel,
    saveUnavailability,
    saveAvailability,
    newAvailabilityEntry,
    loadAvailability,
    getSUData,
    setUnavail
};
