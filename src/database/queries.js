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
    CheckInSchedule,
    UnavailableStart,
    UnavailableStop
} = require('./models');
const { Op } = require('sequelize');

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
 * Get a user's id, tag, and name from a discord user id. Keep in mind
 * that even if a user's id exists in another table, 
 * they might not be present in the users table. In that case,
 * it is a good idea to insert a new user (taking info from the Discord
 * API) if they don't exist yet
 * @param {string} userId discord id
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
 * Get a user's id, tag, and name from a user_id foreign key. Keep in mind
 * that even if a user's id exists in another table, 
 * they might not be present in the users table. In that case,
 * it is a good idea to insert a new user (taking info from the Discord
 * API) if they don't exist yet
 * @param {string} userId discord id
 */
const getUserByDBId = async (id) => {
    const user_id = id?.toString()?.trim() ?? '';

    assertArgument(user_id.length > 0, 'Invalid argument: id');

    const filter = {
        where: { user_id },
        order: [['id', 'ASC']],
        limit: 1
    };

    return User.findOne(filter);
};

/**
 * Get all entries of a table by user, applying additional filter settings
 * @param {string} userId 
 * @param {ModelCtor<Model<any, any>>} model 
 * @param {object} filter additional filter settings
 * @returns 
 */
const getAllByUser = async (userId, model, filter = {}) => {
    return getUser(userId).then(user => {

        // make sure to get the most recent responses
        const _filter = {
            where: { user_id: user.id },
            ...filter
        };
        return model.findAll(_filter);
    });
};

/**
 * Get a single entry of a table by user, applying additional filter settings
 * @param {string} userId 
 * @param {ModelCtor<Model<any, any>>} model 
 * @param {object} filter additional filter settings
 * @returns 
 */
const getModelEntryByUser = async (userId, model, filter = {}) => {
    return getUser(userId).then(user => {

        // make sure to get the most recent responses
        const _filter = {
            where: { user_id: user.id },
            ...filter
        };
        return model.findOne(_filter);
    });
};

/**
 * 
 * @param {{
 * discord_user_id: string, 
 * content: string, 
 * id: string,
 * timestamp: string}} message 
 */
const addMessage = async (message) => {


    const discord_user_id = message?.discord_user_id?.toString().trim() ?? '';
    const content = message?.content?.toString().trim() ?? '';
    const message_id = message?.id?.toString().trim() ?? '';
    const message_ts = message?.timestamp?.toString().trim() ??
        'CURRENT_TIMESTAMP';

    assertArgument(discord_user_id.length > 0, 'Invalid argument: message.id');

    return getUser(discord_user_id).then(user =>
        Message.create({
            user_id:   user.id,
            content,
            author_id: discord_user_id,
            message_id,
            message_ts
        }));
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
    const message_id = msg_id;
    assertArgument(message_id.length > 0, 'Invalid argument: msg_id');


    const filter = {
        where: { message_id },
        order: [['message_ts', 'ASC']]
    };

    return Message.findOne(filter);
};

const getMessagesByTimestamp = async (msg_timestamp) => {
    const message_ts = msg_timestamp;
    assertArgument(message_ts.length > 0, 'Invalid argument: msg_timestamp');

    const filter = {
        where: { message_ts },
        order: [['message_ts', 'ASC']]
    };

    return Message.findOne(filter);
};

const getAllMessages = async() => {

    const filter = { order: [['message_ts', 'ASC']] };

    return Message.findAll(filter)
        .then(messages => {

            // get discord_user_id to send as message author
            return messages.map(message => ({
                authorId:  message.author_id,
                timestamp: message.message_ts,
                messageId: message.message_id,
                content:   message.content,
            }));
        });
};

const deleteAllMessages = async () => {
    await Message.truncate();
    return { content: 'Success' };
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

    // get all schedules for the specified user
    return getAllByUser(discord_user_id, CheckInSchedule);

    // return getUser(discord_user_id)
    //     .then(user => {
    //         const filter = { where: { user_id: user.id } };
    //         return CheckInSchedule.findAll(filter);
    //     });
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

    const filter = {
        order: [['created_at', 'DESC']],
        limit
    };
    return getAllByUser(discord_user_id, CheckInResponse, filter);
};

/**
 * Get a list of check in schedules that contain today utc day
 * @param {string} utcDay 
 * @returns 
 */
const getDaySchedules = (utcDay) => {


    const day = utcDay?.toString()?.trim() ?? '';

    assertArgument(day.length > 0, 'Invalid argument: day');

    const filter = {
        where: { utc_day: { [Op.contains]: [day], } },
        order: [['hour', 'DESC']]
    };

    return CheckInReminder.findAll(filter);
};

/**
 * Adds a reminder object to the day's checkIn queue db table
 * @param {{
* id: string
* hour: int,
* min: int}} reminder required
*/
const addCheckInQueue = async (schedule) => {
    const discord_user_id = schedule?.id?.toString()?.trim() ?? '';
    const hour = schedule?.utcTime[0];
    const min = schedule?.utcTime[1];

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: schedule.id');

    // make sure to set the user_id foreign key
    return getUser(discord_user_id)
        .then(user => CheckInReminder.create({
            user_id: user.id,
            discord_user_id,
            hour,
            min
        }));

};

/**
 * Adds a unavailableStart object to the day's unavailable queue db table
 * @param {{
* id: string
* hour: int,
* min: int}} unavailableStart required
*/
const addUnavailableQueue = async (schedule) => {
    const discord_user_id = schedule?.id?.toString()?.trim() ?? '';
    const hour = schedule?.utcTime[0];
    const min = schedule?.utcTime[1];

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: schedule.id');

    // make sure to set the user_id foreign key
    return getUser(discord_user_id)
        .then(user => UnavailableStart.create({
            user_id: user.id,
            discord_user_id,
            hour,
            min
        }));

};

/**
 * Adds a unavailableStop object to the day's available queue db table
 * @param {{
* id: string
* hour: int,
* min: int}} unavailableStop required
*/
const addAvailableQueue = async (schedule) => {
    const discord_user_id = schedule?.id?.toString()?.trim() ?? '';
    const hour = schedule?.utcTime[0];
    const min = schedule?.utcTime[1];

    assertArgument(discord_user_id.length > 0, 'Invalid Argument: schedule.id');

    // make sure to set the user_id foreign key
    return getUser(discord_user_id)
        .then(user => UnavailableStop.create({
            user_id: user.id,
            discord_user_id,
            hour,
            min
        }));

};

/**
 * gets the scheduled event from a queue *unordered*
 * @param {string} queue which queue type to add to
 */
const getDBQueue = async (queue) => {

    const filter = { order: [['hour', 'DESC']] };

    if (queue == 'checkIn') {
        return CheckInReminder.findAll(filter);
    }
    else if (queue == 'unavailable') {
        return UnavailableStart.findAll(filter);
    }
    else if (queue == 'available') {
        return UnavailableStop.findAll(filter);
    }
    return undefined;
};

/**
 * Soft deletes a schedule reminder
 * @param {
 * id:string,
 * hour:number,
 * min:number
 * } schedule
 */
const deleteCheckInReminder = async (schedule) => {
    return CheckInReminder.destroy({
        where: {
            id:   schedule.id,
            hour: schedule.hour,
            min:  schedule.min
        }
    });
};

/**
 * Soft deletes an unavailableStart
 * @param {
* id:string,
* hour:number,
* min:number
* } schedule
 */
const deleteUnavailableStart = async (schedule) => {
    return UnavailableStart.destroy({
        where: {
            id:   schedule.id,
            hour: schedule.hour,
            min:  schedule.min
        }
    });
};

/**
 * Soft deletes an unavailableStop
  * @param {
* id:string,
* hour:number,
* min:number
* } schedule
 */
const deleteUnavailableStop = async (schedule) => {
    return UnavailableStop.destroy({
        where: {
            id:   schedule.id,
            hour: schedule.hour,
            min:  schedule.min
        }
    });
};

/**
 * hard deletes whole queue table data while keeping table structure
 * @param {string} queue which queue to delete : checkIn,unavailable,available
 * @returns 
 */
const deleteWholeQueue = async (queue)=>{
    if (queue == 'checkIn') {
        return CheckInReminder.truncate();
    }
    else if (queue == 'unavailable') {
        return UnavailableStart.truncate();
    }
    else if (queue == 'available') {
        return UnavailableStop.truncate();
    }
    return undefined;
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

    return getAllByUser(discord_user_id, UnavailableSchedule);

    // return getUser(discord_user_id).then(user => {
    // const filter = { where: { user_id: user.id } };
    //     return UnavailableSchedule.findAll(filter);
    // });
};

/**
 * Get a list of all unavailable dates
 * @returns 
 */
const getAllUnavailable = async () => {

    // TODO: figure out a way to filter out past dates
    // TODO: figure out a way to delete past schedules

    return UnavailableSchedule.findAll();
};

/**
 * Soft deletes an unavailableSchedule
  * @param {
* id:string,
* hour:number,
* min:number
* } schedule
 */
const deleteUnavailableSchedule = async (schedule) => {
    return UnavailableStop.destroy({
        where: {
            id:   schedule.id,
            hour: schedule.hour,
            min:  schedule.min
        }
    });
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
                        from_time,
                        to_time,
                        days
                    });
                    return AvailableSchedule.create({
                        user_id: user.id,
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

    return getModelEntryByUser(discord_user_id, AvailableSchedule);

    // return getUser(discord_user_id).then(user => {
    //     const filter = { where: { user_id: user.id } };
    //     return AvailableSchedule.findOne(filter);
    // }) 
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
    getUserByDBId,
    addMessage,
    getMessage,
    getMessagesByTimestamp,
    getMessagesRange,
    getAllMessages,
    deleteAllMessages,
    addCheckInSchedule,
    deleteCheckInSchedule,
    markCheckInScheduleForDelete,
    getCheckInSchedulesMarkedForDelete,
    deleteMarkedCheckInSchedules,
    getCheckInSchedules,
    addCheckInResponse,
    getCheckInResponses,
    addUnavailable,
    getUnavailable,
    setAvailable,
    getAvailable,
    getAllUnavailable,
    deleteUnavailableSchedule,
    getDaySchedules,
    addCheckInQueue,
    addAvailableQueue,
    addUnavailableQueue,
    getDBQueue,
    deleteCheckInReminder,
    deleteUnavailableStart,
    deleteUnavailableStop,
    deleteWholeQueue,
    updateConfig,
    getConfig,
    authenticate
};
