const {testServer } = require('../../config.json');

const {ActionRowBuilder, ButtonStyle, ButtonBuilder} = require('discord.js');

module.exports = async(client, channel) =>{
    try {
        //get the guild
        const guild = await client.guilds.fetch(testServer);
        //get the guild commands
        
        //get the roles from the guild
        const testR = await guild.roles.cache;

        //parse into an array and remove bot and @everyone
        let roles = [];
        testR.forEach((role)=>{
            if(!role.tags.botId)
                if(role.name != '@everyone') //1242218138586841188
                    roles.push(role)
        });
        let rolesSubsets = [];
        while(roles.length > 5){
            rolesSubsets.push(roles.splice(0,5));
        }
        if(roles.length > 0) rolesSubsets.push(roles);

        let rows = [];
        //makes a button on that row for each role
        rolesSubsets.forEach((roleSet)=>{
            //makes a row
            rows.push(new ActionRowBuilder());
        })

        for(let i = 0; i < rows.length; i++){
            
            rolesSubsets[i].forEach((role) =>{
                rows[i].components.push(
                    new ButtonBuilder().setCustomId(role.id).setLabel(role.name).setStyle(ButtonStyle.Primary)
                )
            });
        }
        await channel.send({
            content: 'Select a Role Below',
            components: rows,
        });

    } catch(error) {
        console.log(error);
    }
}