const { roles } = require('../../../config.json');
const {ActionRowBuilder, ButtonStyle, ButtonBuilder} = require('discord.js');


module.exports = {
    name: 'roles',
    description: 'Brings up a menu to assign a role',
    devOnly: false,
    testOnly: false,

    //logic
    callback: async(client, interaction) =>{
        interaction.reply(`Sending Roles...`);
        try {
            const channel = await client.channels.cache.get('1242556174591594576');
            if(!channel) return;
    
            const row = new ActionRowBuilder();
    
            roles.forEach((role) =>{
                row.components.push(
                    new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary)
                )
            });
    
            await channel.send({
                content: 'Claim a role below.',
                components: [row],
            });
            
    
        } catch(error) {
            console.log(error);
        }
    }
};