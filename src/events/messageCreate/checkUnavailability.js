const availabilityUtils  = require('../../utils/availability');

/**
 * Repeats the message that was sent in the availability channel
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns N/A
 */
module.exports = async (client, message) => {
    try {
        const availabilityChannel = await availabilityUtils.getAvailabilityChannel();

        // only send a message if it's not from a bot and it's from the available channel
        if (message.author.bot || !availabilityChannel || message.channelId !== availabilityChannel.id) {
            return;
        }

        client.channels.cache.get(availabilityChannel.id).send(message.content);
    }
    catch (error) {

        // ! might want to make it so this is sent to a channel, but it's not guaranteed the availability channel was set up correctly
        console.log(error);
    }

};
