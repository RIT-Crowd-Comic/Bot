// gets all the text channels in the guild
module.exports = async(client, guildId) => {

    // get the guild
    const guild = await client.guilds.fetch(guildId);

    const channels = guild.channels.cache;

    let textChannels = [];

    channels.forEach(channel => {
        if (channel.type === 0)
            textChannels.push(channel);
    });
    return textChannels;
};
