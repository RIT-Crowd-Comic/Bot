const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');

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
let client;

let retry = true;

class ConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConnectionError';
        this.code = 'ConnectionError';
    }
}

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

const retryConnect = async (ms) => {
    for (let nRetry = 1; retry; nRetry++) {
        try {
            client = await pool.connect();
            console.info('Now successfully connected to Postgres');
            break;
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
 * 
 * @param {{ id: string, tag: string, name: string }} user 
 */
const touchUser = async (user) => {
    verifyConnected();

    // must have valid data
    if (!user?.id?.length > 0 ||
        !user?.tag?.length > 0 ||
        !user?.name?.length > 0) return undefined;

    const values = [user.id, user.tag, user.name];

    const query =
        `BEGIN touch_user;
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
        INSERT INTO TABLE users
        VALUES ($1, $2, $3);
COMMIT touch_user;
`;
    return client.query(query, values);
};

/**
 * 
 * @param {{
 * user_id: string, 
 * content: string, 
 * timestamp: string}} message 
 */
const addMessage = async (message) => {

};

/**
 * 
 * @param {{
 * user_id: string, 
 * utc_days: string[], 
 * utc_time: number[2], 
 * local_days: string[], 
 * local_time: number[2]}} schedule 
 * 
 */
const addCheckinSchedule = async (schedule) => {

};

/**
 * 
 * @param {{
 * from: string,
 * to: string,
 * reason: string | undefined}} schedule 
 */
const addUnavailable = async (schedule) => {

};

/**
 * 
 * @param {object} entry 
 */
const checkinQueuePush = async (entry) => {

};

/**
 * 
 * @returns {object} 
 */
const checkinQueuePop = async () => {

};

module.exports = {
    testQuery,
    touchUser,
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
