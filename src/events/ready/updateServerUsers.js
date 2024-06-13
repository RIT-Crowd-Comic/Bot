const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const serverUserUtils = require('../../utils/serverUsers');

/**
 * Updates the internal list of users in the server after an interval
 */
module.exports = async (_) => {
    await serverUserUtils.updateServerUsers(process.env.TESTSERVER_ID, false);
    try {

        setInterval(async () => {
            await serverUserUtils.updateServerUsers(process.env.TESTSERVER_ID, false);
        }, 43200 * 1000);// check every 12 hours

    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
};
