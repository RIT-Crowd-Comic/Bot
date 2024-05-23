//gets the application commands
module.exports =  async(client, guildId)=>{
    let applicationCommands;

    //if guild
    if(guildId){
        //get the guild
        const guild = await client.guilds.fetch(guildId);
        //get the guild commands
        applicationCommands = guild.commands;
    }
    else{
        applicationCommands = await client.application.commands;
    }
    //fetch all the commands
    await applicationCommands.fetch();
    
    return applicationCommands;
}