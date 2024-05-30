const { roles, rolesChannelId } = require('../../../config.json');

const {ActionRowBuilder, ButtonStyle, ButtonBuilder} = require('discord.js');

//send the roles message into a specific channel - id is inside of config.json
module.exports = async(client) =>{
    try {
        //gets the channel
        const channel = await client.channels.cache.get(rolesChannelId);
        if(!channel) return;

        //makes a row
        const row = new ActionRowBuilder();

        //makes a button on that row for each role
        roles.forEach((role) =>{
            row.components.push(
                new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary)
            )
        });

        //sends a message to that row
        // await channel.send({
        //     content: 'Claim a role below.',
        //     components: [row],
        //     ephemeral: true
        // });
        

    } catch(error) {
        console.log(error);
    }
};
