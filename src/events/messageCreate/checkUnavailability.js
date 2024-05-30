const { getAvailabilityChannelId } = require('../../utils/availability');
const { getChannelObject } = require('../../utils/apiCalls');
module.exports = async (client, message) => {
    const availabilityId = getAvailabilityChannelId();
    const availabilityChannel = availabilityId === undefined ? undefined : await getChannelObject(availabilityId);
    //only send a message if it's not from a bot and it's from the available channel
    if (message.author.bot || !availabilityChannel || message.channelId !== availabilityChannel.id) {
        return;
    }

    client.channels.cache.get(availabilityId).send(message.content);
}