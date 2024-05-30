const { SlashCommandBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder} = require('discord.js');
const { roles } = require('../../../config.json');

//Shows buttons for roles on command
//NOTE the bot has to have a higher role than others to properly assign roles
module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Brings up a menu to assign a role'),

    options:
    {
        devOnly: true,
        testOnly: false,
        deleted: false,
    },


    //logic, 
    async execute(_, interaction) {
        await interaction.deferReply();
        await interaction.editReply(`Sending Roles...`);
        try {
            const channel = await interaction.channel;
            if(!channel) return;
    
            const row = new ActionRowBuilder();
    
            roles.forEach((role) =>{
                row.components.push(
                    new ButtonBuilder().setCustomId(role.id).setLabel(role.label).setStyle(ButtonStyle.Primary)
                );
            });
    
            await channel.send({
                content: 'Claim a role below.',
                components: [row],
            });
            
    
        } catch(error) {
            await interaction.editReply(`Somthing went wrong ${error}`);
        }
    }
};