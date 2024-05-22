const {rolesChannelId} = require('../../../config.json');


module.exports = async(client) =>{
    //gets the channel
    const channel = await client.channels.cache.get(rolesChannelId);
    if(!channel) return;

    const getRoles = require('../../utils/getRoles');
    console.log(getRoles);

    getRoles(client, channel);
    
};