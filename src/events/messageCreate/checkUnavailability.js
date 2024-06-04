const { getAvailabilityChannel } = require('../../utils/availability');
const { getChannelObject } = require('../../utils/apiCalls');
module.exports = async (client, message) =>
{
    try
    {

        const availabilityChannel = await getAvailabilityChannel();

        // only send a message if it's not from a bot and it's from the available channel
        if (message.author.bot || !availabilityChannel || message.channelId !== availabilityChannel.id)
        {
            return;
        }

        client.channels.cache.get(availabilityChannel.id).send(message.content);
    }
    catch (error)
    {

        // ! might want to make it so this is sent to a channel, but it's not guaranteed the availability channel was set up correctly
        console.log(error);
    }

};
