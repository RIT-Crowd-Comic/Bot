const fs = require('fs');
const dayjs = require('dayjs');
const { ScheduleError, parseDaysList } = require('./schedule.js');
const { EmbedBuilder } = require('discord.js');

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

// Command Functions
const setUnavail = (userId, userTag, dateFrom, dateTo, timeFrom, timeTo, reason, path) => {
    try {
        if (dateTo && !dateFrom)
            throw new ScheduleError('Please select a start date.');
        if (timeTo && !timeFrom)
            throw new ScheduleError('Please select a start time.');

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

        // await interaction.editReply({ content: reply });

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

const displayAvail = (user, member, path) => {
    try {

        const targetMember = member ? member : user;

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

const displayUnavail = (user, member, path) => {
    try {

        const targetMember = member ? member : user;

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
    createAvailability,
    createUnavailability,
    getAvailabilityChannel,
    setAvailabilityChannel,
    updateAvailabilityChannel,
    saveUnavailability,
    saveAvailability,
    newAvailabilityEntry,
    loadAvailability,
    setUnavail,
    setAvail,
    displayAvail,
    displayUnavail
};
