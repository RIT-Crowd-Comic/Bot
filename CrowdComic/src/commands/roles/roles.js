const getRoles = require('../../utils/getRoles');
//Shows buttons for roles on command

module.exports = {
    name: 'roles',
    description: 'Brings up a menu to assign a role',
    devOnly: false,
    testOnly: false,

    //logic, 
    callback: async(client, interaction) =>{
        interaction.reply(`Sending Roles...`);

        const channel = await interaction.channel;
        if(!channel) return;

        getRoles(client, channel);
    }
    
        
};