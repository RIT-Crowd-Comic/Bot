//list of all the users in the server
let severUsers = [];
const apiCalls = require('./apiCalls')
const updateServerUsers = async (serverId, excludeBots) => {
    severUsers = await apiCalls.getServerUsers(serverId, excludeBots);
}

const findUser = (id) => {
    return severUsers.find(user => user.user.id === id);
}
const getServerUsers = () => { return structuredClone(severUsers); };

module.exports = {
    updateServerUsers,
    getServerUsers,
    findUser
}