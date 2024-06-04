const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const apiCalls = require('./apiCalls')
const addUnavailableRole = async (user) => {
    const serverId = process.env.TESTSERVER_ID;
    const roles = await apiCalls.getRoles(serverId);
    const unavailableRole = roles.find(role => role.name.toLowerCase() === 'unavailable')

    //make sure a role called 'unavailable' exists
    if (!unavailableRole) {
        return { status: 'Fail', description: 'No role named "unavailable" exists' }
    }

    //don't give the role to a bot
    if (user.bot) {
        return { status: 'Fail', description: `Can't assign roles to bots (<@${user.id}>)` }
    }

    //don't give the role to someone who already has it
    const serverUser = await apiCalls.getServerUser(serverId, user.id);
    if (serverUser.roles.some((id => id === unavailableRole.id))) {
        return { status: 'Fail', description: `<@${user.id}> already has the unavailable role` }
    }

    //add the role to the user
    return await apiCalls.addRole(serverId, user.id, unavailableRole.id);
}

const removeUnavailableRole = async (user) => {
    const serverId = process.env.TESTSERVER_ID;
    const roles = await apiCalls.getRoles(serverId);
    const unavailableRole = roles.find(role => role.name.toLowerCase() === 'unavailable');
    
    //make sure the role exists
    if (!unavailableRole) {
        return { status: 'Fail', description: `No role named "unavailable" exists` }
    }

    //make sure the person is being called has the role
    const serverUser = await apiCalls.getServerUser(serverId, user.id);
    if (serverUser.roles.every((id => id !== unavailableRole.id))) {
        return { status: 'Fail', description: `<@${user.id}> does not have the unavailable role`}
    }

    //remove the role
    return await apiCalls.removeRole(serverId, user.id, unavailableRole.id)
}

module.exports = {
    addUnavailableRole,
    removeUnavailableRole
};