const dayjs = require('dayjs');
const { ScheduleError, parseDaysList } = require('./schedule.js');
const { EmbedBuilder } = require('discord.js');
const {
    updateConfig, getConfig, addUnavailable, getUnavailable, setAvailable, getAvailable
} = require('../database');

/**
 * Get the channel where availability is being tracked
 * @returns {string} channel id
 */
const getAvailabilityChannel = () => getConfig().availability_channel_id;

/**
 * Set the channel where availability should be tracked
 * @param {string} channelId 
 * @returns 
 */
const setAvailabilityChannel = (channelId) => void updateConfig({ availability_channel_id: channelId });


// const newAvailabilityEntry = (userId, userTag) => {
//     return {
//         userId:    userId,
//         userTag:   userTag,
//         available: {

//             // Random day used for object creation, has no effect on result
//             from: dayjs('2024 5-20 09:00'),
//             to:   dayjs('2024 8-9 17:00'),
//             days: parseDaysList('daily')
//         },
//         unavailable: []
//     };
// };

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
    if (dayjs(start).isAfter(dayjs(end)))
        throw new ScheduleError('End Date/Time must be after Start Date/Time');

    return {
        from:   start,
        to:     end,
        reason: reason
    };
};

/**
 * Save a user's unavailability schedule
 * @param {string} userId 
 * @param {{
 * from: string,
 * to: string,
 * reason: string}} unavail 
 */
const saveUnavailability = async (userId, unavail) => {
    await addUnavailable({
        id: userId,
        ...unavail
    }).catch(err => console.log(err));
};

/**
 * Save a user's availability schedule
 * @param {string} userId 
 * @param {{
* from: string,
* to: string,
* days: string[]}} avail 
*/
const saveAvailability = async (userId, avail) => {
    await setAvailable({
        id: userId,
        ...avail
    }).catch(err => console.log(err));
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

        // await interaction.editReply({ content: reply });

        // Save data to file
        await saveUnavailability(userId, unavail);
        return { content: reply };
    }
    catch (error) {
        if (error.name === 'ScheduleError')
            return { content: `*${error.message}*` };

        console.log(error);
        return { content: `*${error.message}*` };

    }
};

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
        await saveAvailability(userId, avail);
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
    createAvailability,
    createUnavailability,
    getAvailabilityChannel,
    setAvailabilityChannel,
    updateAvailabilityChannel,
    saveUnavailability,
    saveAvailability,
    setUnavail,
    setAvail,
    displayAvail,
    displayUnavail
};
