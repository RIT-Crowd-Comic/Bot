/**
 * delete the past 100 messages in a given channel
 * @param {*} client 
 * @param {*} interaction 
 */
const deleteAllDMs = async (client, interaction)=>{
    let msgs = [];
    await client.channels.fetch(interaction.channelId).then(cha=>{
        cha.messages.fetch({ limit: 100 }).then(messages => {
            console.log(`Received ${messages.size} messages`);

            // Iterate through the messages here with the variable "messages".
            messages.forEach(message => msgs.push(message));
            for (let m of msgs) {
                m.delete();
            }
        });
    });
};

module.exports = { deleteAllDMs };
