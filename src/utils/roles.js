const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const apiCalls = require('./apiCalls');
const addUnavailableRole = async (user) => {
    const unavailableRole = await findRole('unavailable');

    // make sure a role called 'unavailable' exists
    if (!unavailableRole) {
        return { status: 'Fail', description: 'No role named "unavailable" exists' };
    }

    // don't give the role to a bot
    if (user.bot) {
        return { status: 'Fail', description: `Can't assign roles to bots (<@${user.id}>)` };
    }

    // don't give the role to someone who already has it
    if (await hasRole(user, unavailableRole)) {
        return { status: 'Fail', description: `<@${user.id}> already has the unavailable role` };
    }

    // add the role to the user
    return await apiCalls.addRole(process.env.TESTSERVER_ID, user.id, unavailableRole.id);
};

const removeUnavailableRole = async (user) => {
    const serverId = process.env.TESTSERVER_ID;
    const unavailableRole = await findRole('unavailable');

    // make sure the role exists
    if (!unavailableRole) {
        return { status: 'Fail', description: `No role named "unavailable" exists` };
    }

    // make sure the person is being called has the role
    if (!await hasRole(user, unavailableRole)) {
        return { status: 'Fail', description: `<@${user.id}> does not have the unavailable role` };
    }

    // remove the role
    return await apiCalls.removeRole(serverId, user.id, unavailableRole.id);
};

/**
 * Checks if a role exists in the server
 * @param {*} roleName 
 * @returns the role with the name {roleName}. Or undefined if the role doesn't exist
 */
const findRole = async (roleName) => {
    const roles = await apiCalls.getRoles(process.env.TESTSERVER_ID);
    return roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());
};

/**
 * Checks if a user has a specific role
 * @param {*} user 
 * @param {*} role 
 * @returns true if the user has the role. False otherwise
 */
const hasRole = async (user, role) => {
    const serverUser = await apiCalls.getServerUser(process.env.TESTSERVER_ID, user.id);
    return serverUser.roles.some(id => id === role.id);
};

module.exports = {
    addUnavailableRole,
    removeUnavailableRole,
    findRole,
    hasRole
};
