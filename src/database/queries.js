const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');

const { ArgumentError, ConnectionError } = require('./errors');
const {
    User, sequelize, UnavailableSchedule, CheckInResponse
} = require('./models');

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
 * @param {{ id: string, tag: string, name: string }} user 
 */
const touchUser = async (user) => {
    const user_id = user?.id?.toString()?.trim() ?? '';
    const user_tag = user?.tag?.toString()?.trim() ?? '';
    const user_name = user?.name?.toString()?.trim() ?? '';

    assertArgument(user_id?.length > 0, 'Invalid Argument: user.id');
    assertArgument(user_tag?.length > 0, 'Invalid Argument: user.tag');
    assertArgument(user_name?.length > 0, 'Invalid Argument: user.name');

    // Create only if user doesn't exist

    const filter = { where: { user_id } };

    return User
        .findOne(filter)
        .then(user => {
            if (!user) return User.create({ user_id, user_tag, user_name });
            return user;
        });
};

/**
 * Create or update a user entry
 * @param {{ id: string, tag: string, name: string }} user 
 */
const upsertUser = async (user) => {


    const user_id = user?.id?.toString()?.trim() ?? '';
    const user_tag = user?.tag?.toString()?.trim() ?? '';
    const user_name = user?.name?.toString()?.trim() ?? '';

    // must be a valid user
    assertArgument(user_id?.length > 0, 'Invalid Argument: user.id');
    assertArgument(user_tag?.length > 0, 'Invalid Argument: user.tag');
    assertArgument(user_name?.length > 0, 'Invalid Argument: user.name');

    const filter = { where: { user_id } };

    return User
        .findOne(filter)
        .then(user => {
            if (user) return User.update({ user_tag, user_name });
            return User.create({ user_id, user_tag, user_name });
        });
};

/**
 * Get a user's id, tag, and name
 * @param {string} userId 
 */
const getUser = async (userId) => {
    const id = userId?.toString()?.trim() ?? '';

    assertArgument(id.length > 0, 'Invalid argument: userId');

    const filter = {
        where: { user_id: id },
        order: [['id', 'ASC']],
        limit: 1
    };

    return User.findAll(filter);
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
    const timestamp = message?.timestamp?.toString().trim() ??
        'CURRENT_TIMESTAMP';

    assertArgument(id.length > 0, 'Invalid argument: message.id');

    const values = [id, content, timestamp];
    const query =
`
INSERT INTO messages (user_id, content, timestamp)
    VALUES ($1, $2, $3);
`;

    return pool.query(query, values);
};

// expects 
const getMessagesRange = async (start_msg_id, end_msg_id) => {
    const start = start_msg_id;
    const end = end_msg_id;

    assertArgument(start.length > 0, 'Invalid argument: start_msg_id');
    assertArgument(end.length > 0, 'Invalid argument: end_msg_id');

    const values = [start, end];
    const query =
    `
    SELECT  * FROM messages
        WHERE message_id BETWEEN $1 AND $2
        ORDER BY message_ts ASC;
    `;
    return pool.query(query, values);
};

const getMessage = async (msg_id) => {
    const message_id = msg_id;
    assertArgument(message_id.length > 0, 'Invalid argument: msg_id');

    const values = [message_id];
    const query =
    `
    SELECT * FROM messages
        WHERE message_id = $1
        ORDER BY message_ts ASC;
    `;
    return pool.query(query, values);
};

const getMessagesByTimestamp = async (msg_timestamp) => {
    const message_timestamp = msg_timestamp;
    assertArgument(message_timestamp.length > 0, 'Invalid argument: msg_timestamp');
    const values = [message_timestamp];
    const query =
    `
    SELECT * FROM messages
        WHERE message_ts = $1
        ORDER BY message_ts ASC;
    `;
    return pool.query(query, values);
};


/**
 * 
 * @param {{
 * userId: string, 
 * utcDays: string[], 
 * utcTime: number[], 
 * localDays: string[], 
 * localTime: number[]}} schedule 
 * 
 */
const addCheckinSchedule = async (schedule) => {


    const id = schedule?.userId?.toString().trim() ?? '';
    const utcDays = schedule?.utcDays;
    const utcTime = schedule?.utcTime;
    const localDays = schedule?.localDays;
    const localTime = schedule?.localTime;

    assertArgument(id.length > 0, 'Invalid argument: schedule.id');

    // replace with schedule.validDays() or something
    assertArgument(utcDays.constructor === Array, 'Invalid argument: schedule.utcDays');
    assertArgument(utcTime.constructor === Array && utcTime.length === 2, 'Invalid argument: schedule.utcTime');
    assertArgument(localDays.constructor === Array, 'Invalid argument: schedule.localDays');
    assertArgument(localTime.constructor === Array && localTime.length === 2, 'Invalid argument: schedule.localTime');

    const values = [id, utcDays, utcTime, localDays, localTime];
    const query =
`
INSERT INTO checkin_schedules (user_id, utc_days, utc_time, local_days, local_time)
    VALUES ($1, $2, $3, $4, $5);
`;
    return pool.query(query, values);
};

/**
 * Marks a schedule for deletion
 * @param {*} schedule 
 */
const deleteCheckinSchedule = (schedule) => {


    // TODO: figure out best way to delete a schedule
};

/**
 * Get a list of check in schedules for a specific user
 * @param {string} userId 
 * @returns 
 */
const getCheckinSchedules = (userId) => {


    const id = userId?.toString()?.trim() ?? '';

    assertArgument(id.length > 0, 'Invalid argument: userId');

    const values = [id];
    const query =
`
SELECT * FROM checkin_schedules
    WHERE user_id = $1
    ORDER BY checkin_schedule_pk ASC;
`;
    return pool.query(query, values);
};

/**
 * Save a user's check-in response form
 * @param {{
 * id: string,
 * rose?: string | undefined,
 * thorn?: string | undefined,
 * bud?: string | undefined,
 * }} response required
 */
const addCheckInResponse = (response) => {
    const user_id = response?.id?.toString()?.trim() ?? '';
    const rose = response?.rose?.toString()?.trim() ?? '';
    const thorn = response?.thorn?.toString()?.trim() ?? '';
    const bud = response?.bud?.toString()?.trim() ?? '';

    assertArgument(user_id?.length > 0, 'Invalid Argument: response.id');

    // rose thorn bud can be empty

    // don't add entry if everything is empty
    if (rose.length === 0 && thorn.length === 0 && bud.length === 0) return undefined;


    return CheckInResponse.create({
        user_id,
        rose,
        thorn,
        bud
    });
};

/**
 * Get the most recent list of check-in responses for a user
 * ordered by created date, ascending.
 * @param {string} userId required
 * @param {number} limit optional
 * @returns 
 */
const getCheckInResponses = (userId, limit = 5) => {
    const user_id = userId?.toString()?.trim() ?? '';

    assertArgument(user_id?.length > 0, 'Invalid Argument: userId');
    assertArgument(limit >= 1, 'Invalid Argument: limit must be >= 1');

    // make sure to get the most recent responses
    const filter = {
        where: { user_id, },
        order: [['createdAt', 'ASC']],
        limit
    };

    return CheckInResponse.findAll(filter);
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
    const user_id = schedule?.id?.toString()?.trim() ?? '';
    const from_time = schedule?.from?.toString()?.trim() ?? '';
    const to_time = schedule?.to?.toString()?.trim() ?? '';
    const reason = schedule?.reason?.toString()?.trim() ?? '';

    assertArgument(user_id?.length > 0, 'Invalid Argument: schedule.id');
    assertArgument(from_time?.length > 0, 'Invalid Argument: schedule.from');
    assertArgument(to_time?.length > 0, 'Invalid Argument: schedule.to');

    // reason can be empty, no need to assert :)

    return UnavailableSchedule.create({
        user_id,
        from_time,
        to_time,
        reason
    });
};

/**
 * Get a list of unavailable dates for a user 
 * @param {string} userId required
 * @returns 
 */
const getUnavailable = async (userId) => {
    const user_id = userId?.toString()?.trim() ?? '';

    assertArgument(user_id?.length > 0, 'Invalid Argument: userId');

    // TODO: figure out a way to filter out past dates
    // TODO: figure out a way to delete past schedules

    const filter = { where: { user_id } };
    return UnavailableSchedule.findAll(filter);
};



module.exports = {
    testQuery,
    touchUser,
    upsertUser,
    getUser,
    addMessage,
    addCheckinSchedule,
    addCheckInResponse,
    getCheckInResponses,
    addUnavailable,
    getUnavailable,
    authenticate
};
