const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');

const { ArgumentError } = require('./errors');
const {
    User, sequelize, UnavailableSchedule, CheckInResponse,
    Config,
    AvailableSchedule,
    CheckInReminder,
    Message,
    CheckInSchedule
} = require('./models');
<<<<<<< HEAD
const { measureMemory } = require('vm');
=======
const { Op } = require('sequelize');
>>>>>>> 4d41815065a2f7bb36408876eff2409c20a206cc

// configuration variables must be in .env

/*
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=testdb
PGDATABASE=database_name
PGPORT=port


alternatively use config object with Pool()
{
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: '1234abcd',
    port: port,
}
*/

const pool = new Pool();

// pool.query(query, configValues) for most queries
// This automatically connects/releases clients

// For transactions, use the following:
// const client = await pool.connect();
// await client.query(...)
// ...
// client.release()


pool.on('error', (err) => {
    console.log(err);

    // in the future, potentially do additional handling
});

// let retry = true;

/**
 * Throw an error if a condition is not met
 * @param {boolean | function} condition throw error if condition is not met
 * @param {string} message message to send when assertion fails
 * @param {ArgumentError | Error} ErrConstructor type of error to throw
 */
const assertArgument = (
    condition,
    message = 'Invalid Arguments',
    ErrConstructor = ArgumentError
) => {

    if (typeof condition !== 'boolean' && typeof condition !== 'function')
        throw new Error('Assert condition must be a function or boolean');

    const _condition = typeof condition === 'boolean' ?
        condition :
        condition();

    // this would be fixed with typescript
    const validErrors = [ArgumentError, Error];
    if (validErrors.some(e => ErrConstructor === e)) ErrConstructor = Error;

    if (!_condition) throw new ErrConstructor(message);
};

const testQuery = async () => {

    return pool.query('SELECT * FROM users');
};

/**
 * Check if successfully connected to database
 * @returns 
 */
const authenticate = () => {
    return sequelize.authenticate();
};

/**
 * Create a user entry only if the user doesn't already exist
 * @param {{ id: string, tag: string, display_name: string, global_name: string }} user 
 */
const touchUser = async (user) => {
    const discord_user_id = user?.id?.toString()?.trim() ?? '';
    const tag = user?.tag?.toString()?.trim() ?? '';

    // these can be null/undefined
    const display_name = user?.display_name?.toString()?.trim();
    const global_name = user?.global_name?.toString()?.trim();

    assertArgument(discord_user_id?.length > 0, 'Invalid Argument: user.id');
    assertArgument(tag?.length > 0, 'Invalid Argument: user.tag');

    // Create only if user doesn't exist

    const filter = { where: { discord_user_id } };

    return User
        .findOne(filter)
        .then(user => {
            if (!user) return User.create({
                discord_user_id,
                tag,
                display_name,
                global_name
            });
            return user;
        });
};

/**
 * Create or update a user entry
 * @param {{ id: string, tag: string, display_name: string, global_name: string }} user 
 */
const upsertUser = async (user) => {

    const discord_user_id = user?.id?.toString()?.trim() ?? '';
    const tag = user?.tag?.toString()?.trim() ?? '';

    // these can be undefined
    const display_name = user?.display_name?.toString()?.trim();
    const global_name = user?.global_name?.toString()?.trim();

    assertArgument(discord_user_id?.length > 0, 'Invalid Argument: user.id');
    assertArgument(tag?.length > 0, 'Invalid Argument: user.tag');

    const filter = { where: { discord_user_id } };

    // don't want to modify any columns that are null/undefined
    const updates = { tag };
    if (display_name) updates.display_name = display_name;
    if (global_name) updates.global_name = global_name;

    // update or create if there's nothing
    return User
        .findOne(filter)
        .then(user => {
            if (user) return user.update(updates);
            return User.create({
                discord_user_id,
                tag,
                display_name,
                global_name
            });
        });
};

/**
 * Get a user's id, tag, and name. Keep in mind
 * that even if a user's id exists in another table, 
 * they might not be present in the users table. In that case,
 * it is a good idea to insert a new user (taking info from the Discord
 * API) if they don't exist yet
 * @param {string} userId 
 */
const getUser = async (userId) => {
    const id = userId?.toString()?.trim() ?? '';

    assertArgument(id.length > 0, 'Invalid argument: userId');

    const filter = {
        where: { discord_user_id: id },
        order: [['id', 'ASC']],
        limit: 1
    };

    return User.findOne(filter);
};

/**
 * 
 * @param {{
 * userId: string, 
 * content: string, 
 * timestamp: string}} message 
 */
const addMessage = async (message) => {


    const id = message?.userId?.toString().trim() ?? '';
    const content = message?.content?.toString().trim() ?? '';
    const msg_id = message?.id?.toString().trim() ?? '';
    const timestamp = message?.timestamp?.toString().trim() ??
        'CURRENT_TIMESTAMP';

    assertArgument(id.length > 0, 'Invalid argument: message.id');

    const values = [id, content, msg_id, timestamp];
    const query =
`
INSERT INTO messages (user_id, content, message_id, message_ts)
    VALUES ($1, $2, $3, $4);
`;

    return pool.query(query, values);
};

// expects 
const getMessagesRange = async (start_msg_id, end_msg_id) => {
    const start = start_msg_id;
    const end = end_msg_id;

    assertArgument(start.length > 0, 'Invalid argument: start_msg_id');
    assertArgument(end.length > 0, 'Invalid argument: end_msg_id');

    const filter = {
        where: { message_id: { [sequelize.between]: [start, end] } },
        order: [['message_ts', 'ASC']]
    };

    return Message.findAll(filter);
};

const getMessage = async (msg_id) => {
    const ms_id = msg_id;
    assertArgument(message_id.length > 0, 'Invalid argument: msg_id');


    const filter = {
        where: { message_id: { [sequelize.eq]: ms_id } },
        order: [['message_ts', 'ASC']]
    };

    return Message.findOne(filter);
};

const getMessagesByTimestamp = async (msg_timestamp) => {
    const message_timestamp = msg_timestamp;
    assertArgument(message_timestamp.length > 0, 'Invalid argument: msg_timestamp');

    const filter = {
        where: { message_ts: { [sequelize.eq]: message_timestamp } },
        order: [['message_ts', 'ASC']]
    };

    return Message.findOne(filter);
};

const getMessageTable = async() => {
    return Message.findAll();
};


/**
 * Add a check-in schedule for a user
 * @param {string} userId
 * @param {{
 * utc_days: string[], 
 * utc_time: number[], 
 * local_days: string[], 
 * local_time: number[]}} schedule 
 * 
 */
const addCheckInSchedule = async (userId, schedule) => {
    const discord_user_id = userId?.toString().trim() ?? '';
    const utc_days = schedule?.utc_days;
    const utc_time = schedule?.utc_time;
    const local_days = schedule?.local_days;
    const local_time = schedule?.local_time;

    assertArgument(discord_user_id.length > 0, 'Invalid argument: schedule.id');

    // replace with schedule.validDays() or something
    assertArgument(utc_days.constructor === Array, 'Invalid argument: schedule.utc_days');
    assertArgument(utc_time.constructor === Array && utc_time.length === 2, 'Invalid argument: schedule.utc_time');
    assertArgument(local_days.constructor === Array, 'Invalid argument: schedule.local_days');
    assertArgument(local_time.constructor === Array && local_time.length === 2, 'Invalid argument: schedule.local_time');

    return getUser(discord_user_id)
        .then(user => CheckInSchedule.create({
            user_id: user.id,
            discord_user_id,
            utc_days,
            utc_time,
            local_days,
            local_time
        }));
};

/**
 * Soft deletes a schedule
 * @param {number} scheduleId
 */
const deleteCheckInSchedule = async (scheduleId) => {
    return CheckInSchedule.destroy({ where: { id: scheduleId } });
};

/**
 * Marks a schedule for deletion
 * @param {number} scheduleId
 */
const markCheckInScheduleForDelete = async (scheduleId) => {
    return CheckInSchedule.findOne({ where: { id: scheduleId } })
        .then(schedule => schedule.update({ mark_delete: true }));
};

const getCheckInSchedulesMarkedForDelete = async () => {
    return CheckInSchedule.findAll({ where: { mark_delete: true } });
};

/**
 * Deletes all marked tables
 * @param {number} scheduleId
 */
const deleteMarkedCheckInSchedules = async () => {
    return CheckInSchedule.destroy({ where: { mark_delete: true } });
};

/**
 * Get a list of check in schedules for a specific user
 * @param {string?} userId 
 * @returns 
 */
const getCheckInSchedules = async (userId) => {
    const discord_user_id = userId?.toString()?.trim() ?? '';

    // if there's no user, just get all schedules
    if (discord_user_id.length === 0) return CheckInSchedule.findAll();

    const filter = { where: { discord_user_id } };
    return CheckInSchedule.findAll(filter);
};


/**
 * Get a list of check in schedules for a that contain today utc day
 * @param {string} utcDay 
 * @returns 
 */
const getDaySchedules = (utcDay) => {


    const day = utcDay?.toString()?.trim() ?? '';

    assertArgument(day.length > 0, 'Invalid argument: day');

    const filter = {
        where: { [Op.in]: [day], },
        order: [['hour', 'ASC']]
    };

    return CheckInReminder.findAll(filter);
};

/**
 * Save a user's check-in response form
 * @param {string} userId
 * @param {object} content
 */
const addCheckInResponse = (userId, content) => {
    const discord_user_id = userId?.toString()?.trim() ?? '';

    assertArgument(discord_user_id?.length > 0, 'Invalid Argument: id');

    // if content is empty, silently return nothing
    if (typeof content === 'object' && Object.keys(content).length === 0) return undefined;

    // make sure to set the user_id foreign key
    return getUser(discord_user_id)
        .then(user => CheckInResponse.create({
            user_id: user.id,
            discord_user_id,
            content
        }));
};

/**
 * Get the most recent list of check-in responses for a user
 * ordered by created date, ascending.
 * @param {string} userId required
 * @param {number} limit optional
 * @returns 
 */
const getCheckInResponses = (userId, limit = 5) => {
    const discord_user_id = userId?.toString()?.trim() ?? '';

    assertArgument(discord_user_id?.length > 0, 'Invalid Argument: userId');
    assertArgument(limit >= 1, 'Invalid Argument: limit must be >= 1');

    // make sure to get the most recent responses
    const filter = {
        where: { discord_user_id },
        order: [['created_at', 'DESC']],
        limit
    };

    return CheckInResponse.findAll(filter);
};

/**
 * Adds a reminder object to the day queue db table
 * @param {{
* id: string
* hour: int,
* min: int}} reminder required
*/
const addQueue = async (schedule) => {
    const discord_user_id = schedule?.id?.toString()?.trim() ?? '';
    const hour = schedule?.utcTime[0];
    const min = schedule?.utcTime[1];

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: schedule.id');

    return CheckInReminder.create({
        discord_user_id,
        hour,
        min
    });
};

/**
 * 
 * @param {string} userId 
 */
const getDBQueue = async () => {

    const filter = { order: [['hour', 'ASC']] };

    return CheckInReminder.findAll(filter);
};

/**
 * Add an unavailable schedule to a user
 * @param {{
 * id: string
 * from: string,
 * to: string,
 * reason: string | undefined}} schedule required
 */
const addUnavailable = async (schedule) => {
    const discord_user_id = schedule?.id?.toString()?.trim() ?? '';
    const from_time = schedule?.from?.toString()?.trim() ?? '';
    const to_time = schedule?.to?.toString()?.trim() ?? '';
    const reason = schedule?.reason?.toString()?.trim() ?? '';

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: schedule.id');
    assertArgument(from_time.length > 0, 'Invalid Argument: schedule.from');
    assertArgument(to_time.length > 0, 'Invalid Argument: schedule.to');

    // reason can be empty, no need to assert :)

    // make sure to set the user_id foreign key
    return getUser(discord_user_id)
        .then(user => UnavailableSchedule.create({
            user_id: user.id,
            discord_user_id,
            from_time,
            to_time,
            reason
        }));
};

/**
 * Get a list of unavailable dates for a user 
 * @param {string} userId required
 * @returns 
 */
const getUnavailable = async (userId) => {
    const discord_user_id = userId?.toString()?.trim() ?? '';

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: userId');

    // TODO: figure out a way to filter out past dates
    // TODO: figure out a way to delete past schedules

    const filter = { where: { discord_user_id } };
    return UnavailableSchedule.findAll(filter);
};

/**
 * Add an unavailable schedule to a user
 * @param {{
* id: string
* from: string,
* to: string,
* days: string[]}} schedule required
*/
const setAvailable = async (schedule) => {
    const discord_user_id = schedule?.id?.toString()?.trim() ?? '';
    const from_time = schedule?.from?.toString()?.trim() ?? '';
    const to_time = schedule?.to?.toString()?.trim() ?? '';
    const days = schedule?.days?.map(day => day.toString().trim().toLocaleLowerCase());

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: schedule.id');
    assertArgument(from_time.length > 0, 'Invalid Argument: schedule.from');
    assertArgument(to_time.length > 0, 'Invalid Argument: schedule.to');
    assertArgument(days.length > 0, 'Invalid Argument: schedule.days');

    // create or update

    // make sure to set the user_id foreign key
    return getUser(discord_user_id)
        .then(user => {
            const filter = { where: { user_id: user.id }, };
            return AvailableSchedule.findOne(filter)
                .then(available => {
                    if (available) return available.update({
                        discord_user_id,
                        from_time,
                        to_time,
                        days
                    });
                    return AvailableSchedule.create({
                        user_id: user.id,
                        discord_user_id,
                        from_time,
                        to_time,
                        days
                    });
                });
        });
};

/**
* Get a list of unavailable dates for a user 
* @param {string} userId required
* @returns 
*/
const getAvailable = async (userId) => {
    const discord_user_id = userId?.toString()?.trim() ?? '';

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: userId');

    // TODO: figure out a way to filter out past dates
    // TODO: figure out a way to delete past schedules

    const filter = { where: { discord_user_id } };
    return AvailableSchedule.findOne(filter);
};

/**
 * Update config variables. Only include properties that should be changed
 * @param {{
 * availability_channel_id?: string,
 * server_id?: string}} config
 */
const updateConfig = async (config) => {

    // this would need to be updated if the Model options change
    const hiddenAttributes = ['created_at', 'updated_at', 'deleted_at', 'id'];

    const configAttributes = Object.keys(Config.getAttributes())
        .filter(value => !hiddenAttributes.includes(value));

    assertArgument(
        Object.keys(config).every(attr => configAttributes.includes(attr)),
        `Invalid argument: config can only include {${configAttributes.join(',')}}`
    );

    const filter = {
        order: [['created_at', 'DESC']],
        limit: 1
    };

    return Config.findOne(filter).then(configRow => {
        if (configRow) return configRow.update(config);
        return Config.create(config);
    });
};

/**
 * Get the most recent config vars
 * @param {string} channelId required
 * @param {string} channelName optional
 */
const getConfig = () => {

    const filter = {
        order: [['created_at', 'DESC']],
        limit: 1
    };
    return Config.findOne(filter);
};

module.exports = {
    testQuery,
    touchUser,
    upsertUser,
    getUser,
    addMessage,
<<<<<<< HEAD
    getMessage,
    getMessagesByTimestamp,
    getMessagesRange,
    getMessageTable,
    addCheckinSchedule,
=======
    addCheckInSchedule,
    deleteCheckInSchedule,
    markCheckInScheduleForDelete,
    getCheckInSchedulesMarkedForDelete,
    deleteMarkedCheckInSchedules,
    getCheckInSchedules,
>>>>>>> 4d41815065a2f7bb36408876eff2409c20a206cc
    addCheckInResponse,
    getCheckInResponses,
    addUnavailable,
    getUnavailable,
    setAvailable,
    getAvailable,
    updateConfig,
    getConfig,
    authenticate
};
