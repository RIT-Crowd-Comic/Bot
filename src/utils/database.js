const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool, Client } = require('pg');

// configuration variables must be in .env

/*
PGUSER=postgres
PGHOST=localhost
PGPASSWORD=testdb
PGDATABASE=database_name
PGPORT=port


alternatively use config object 
{
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    password: '1234abcd',
    port: port,
}
*/

const pool = new Pool();

/**
 * @type {Client}
 */
let client;

let retry = true;

class ConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConnectionError';
        this.code = 'ConnectionError';
    }
}

class ArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArgumentError';
        this.code = 'ArgumentError';
    }
}

const assert = (condition, message = 'Invalid Arguments') => {

    if (typeof condition !== 'boolean' && typeof condition !== 'function')
        throw new Error('Assert condition must be a function or boolean');

    const _condition = typeof condition === 'boolean' ?
        condition :
        condition();

    if (!_condition) throw new ArgumentError(message);
};

/**
 * Throw an error if disconnected
 */
const verifyConnected = () => {
    if (!(client?._connected ?? false))
        throw new ConnectionError('Client not connected');
};
const testQuery = async () => {
    verifyConnected();
    return pool.query('SELECT * FROM users');
};

const connect = async () => {
    client = await pool.connect();
    return client;
};

/**
 * Tries to connect to the database every {ms}
 * @param {*} ms 
 * @returns 
 */
const retryConnect = async (ms) => {

    // a little bit cursed, but I'm using this to track number of retries
    for (let nRetry = 1; retry; nRetry++) {
        try {
            client = await pool.connect();
            console.info('Now successfully connected to Postgres');
            return client;
        }
        catch (e) {
            if (e.code?.includes('ECONNREFUSED')) {
                console.info(`ECONNREFUSED connecting to Postgres, ${nRetry} attempts`);

                // Wait 1 second
                await new Promise(resolve => void setTimeout(resolve, ms));
            }
            else {
                throw e;
            }
        }
    }
};

const disconnect = async () => {
    return pool.end();
};

/**
 * Create a user entry only if the user doesn't already exist
 * @param {{ id: string, tag: string, name: string }} user 
 */
const touchUser = async (user) => {
    verifyConnected();

    const id = user?.id?.toString()?.trim() ?? '';
    const tag = user?.id?.toString()?.trim() ?? '';
    const name = user?.id?.toString()?.trim() ?? '';

    // must be a valid user
    assert(id?.length > 0, 'Invalid Argument: user.id');
    assert(tag?.length > 0, 'Invalid Argument: user.tag');
    assert(name?.length > 0, 'Invalid Argument: user.name');

    const values = [id, tag, name];
    const query =
`
IF NOT EXISTS (
    SELECT * FROM users WHERE user_id = $1
)
    INSERT INTO users (user_id, user_tag, user_name)
    VALUES ($1, $2, $3);
`;

    // QUERY PARAMETERS MUST BE DONE THIS WAY TO PREVENT
    // SQL INJECTION ATTACKS
    return client.query(query, values);
};

/**
 * Create or update a user entry
 * @param {{ id: string, tag: string, name: string }} user 
 */
const updateUser = async (user) => {
    verifyConnected();

    const id = user?.id?.toString()?.trim() ?? '';
    const tag = user?.id?.toString()?.trim() ?? '';
    const name = user?.id?.toString()?.trim() ?? '';

    // must be a valid user
    assert(id?.length > 0, 'Invalid Argument: user.id');
    assert(tag?.length > 0, 'Invalid Argument: user.tag');
    assert(name?.length > 0, 'Invalid Argument: user.name');

    const values = [id, tag, name];
    const query =
`
BEGIN touch_user;
    IF EXISTS (
        SELECT * FROM users WITH (
            UPDLOCK, SERIALIZABLE
        )
        WHERE user_id = $1
    )
        UPDATE users
        SET user_tag = $2, user_name = $3
        WHERE user_id = $1
    ELSE
        INSERT INTO users (user_id, user_tag, user_name)
        VALUES ($1, $2, $3);
COMMIT touch_user;
`;

    // QUERY PARAMETERS MUST BE DONE THIS WAY TO PREVENT
    // SQL INJECTION ATTACKS
    return client.query(query, values);
};

/**
 * 
 * @param {string} userId 
 */
const getUser = async (userId) => {
    verifyConnected();

    const id = userId?.toString()?.trim() ?? '';

    assert(id.length > 0, 'Invalid argument: userId');

    const values = [id];
    const query =
        `
SELECT * FROM users
    WHERE user_id = $1
    ORDER BY user_pk ASC
    LIMIT 1;
`;

    return client.query(query, values);
};

/**
 * 
 * @param {{
 * userId: string, 
 * content: string, 
 * timestamp: string}} message 
 */
const addMessage = async (message) => {
    verifyConnected();

    const id = message?.userId?.toString().trim() ?? '';
    const content = message?.content?.toString().trim() ?? '';
    const timestamp = message?.timestamp?.toString().trim() ??
        'CURRENT_TIMESTAMP';

    assert(id.length > 0, 'Invalid argument: message.id');

    const values = [id, content, timestamp];
    const query =
`
INSERT INTO messages (user_id, content, timestamp)
    VALUES ($1, $2, $3);
`;

    return client.query(query, values);
};

const getMessages = async (filter) => {

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
    verifyConnected();

    const id = schedule?.userId?.toString().trim() ?? '';
    const utcDays = schedule?.utcDays;
    const utcTime = schedule?.utcTime;
    const localDays = schedule?.localDays;
    const localTime = schedule?.localTime;

    assert(id.length > 0, 'Invalid argument: schedule.id');

    // replace with schedule.validDays() or something
    assert(utcDays.constructor === Array, 'Invalid argument: schedule.utcDays');
    assert(utcTime.constructor === Array && utcTime.length === 2, 'Invalid argument: schedule.utcTime');
    assert(localDays.constructor === Array, 'Invalid argument: schedule.localDays');
    assert(localTime.constructor === Array && localTime.length === 2, 'Invalid argument: schedule.localTime');

    const values = [id, utcDays, utcTime, localDays, localTime];
    const query =
`
INSERT INTO checkin_schedules (user_id, utc_days, utc_time, local_days, local_time)
    VALUES ($1, $2, $3, $4, $5);
`;
    return client.query(query, values);
};

/**
 * Marks a schedule for deletion
 * @param {*} schedule 
 */
const deleteCheckinSchedule = (schedule) => {
    verifyConnected();

    // TODO: figure out best way to delete a schedule
};

/**
 * Get a list of check in schedules for a specific user
 * @param {string} userId 
 * @returns 
 */
const getCheckinSchedules = (userId) => {
    verifyConnected();

    const id = userId?.toString()?.trim() ?? '';

    assert(id.length > 0, 'Invalid argument: userId');

    const values = [id];
    const query =
`
SELECT * FROM checkin_schedules
    WHERE user_id = $1
    ORDER BY checkin_schedule_pk ASC;
`;
    return client.query(query, values);
};

const addCheckinResponse = (response) => {

};

const getCheckinResponse = (userId) => {

};

/**
 * 
 * @param {{
 * from: string,
 * to: string,
 * reason: string | undefined}} schedule 
 */
const addUnavailable = async (schedule) => {
    verifyConnected();
};

/**
 * 
 * @param {object} entry 
 */
const checkinQueuePush = async (entry) => {
    verifyConnected();
};

/**
 * 
 * @returns {object} 
 */
const checkinQueuePop = async () => {
    verifyConnected();
};

module.exports = {
    testQuery,
    touchUser,
    getUser,
    addMessage,
    addCheckinSchedule,
    addUnavailable,
    checkinQueuePush,
    checkinQueuePop,
    connect,
    retryConnect,
    disconnect,
    ConnectionError
};
