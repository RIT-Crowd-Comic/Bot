// list of all the users in the server
let severUsers;
const apiCalls = require('./apiCalls');

/**
 * Updates the list of users in a server
 * @param {String} serverId the server that the bot is in
 * @param {boolean} excludeBots if the bots should be excluded from the list 
 */
const updateServerUsers = async (serverId, excludeBots) => {
    severUsers = await apiCalls.getServerUsers(serverId, excludeBots);
};

/**
 * Finds a user in the server list
 * @param {String} id the id of the user
 * @returns {Discord User Object} a user with the id if found. Otherwise, undefined
 */
const findUser = (id) => {
    return severUsers.find(user => user.user.id === id);
};

/**
 * Returns a list of users that are in the server
 * @returns {Discord User Object[]}
 */
const getServerUsers = () => { return structuredClone(severUsers); };

module.exports = {
    updateServerUsers,

    getServerUsers,
    findUser
};
