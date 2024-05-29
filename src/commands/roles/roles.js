const { roles } = require('../../../config.json');
const {ActionRowBuilder, ButtonStyle, ButtonBuilder} = require('discord.js');
//Shows buttons for roles on command
//NOTE the bot has to have a higher role than others to properly assign roles
module.exports = {
    name: 'roles',
    description: 'Brings up a menu to assign a role',
    devOnly: true,
    testOnly: false,

    //logic, 
    callback: async(client, interaction) =>{
        interaction.reply(`Sending Roles...`);
        try {
            const channel = await interaction.channel;
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