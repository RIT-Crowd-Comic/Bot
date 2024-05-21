//gets the application commands
module.exports =  async(client, guildId)=>{
    let applicationCommands;

    //if guild
    if(guildId){
        const guild = await client.guilds.fetch(guildId);
        applicationCommands = guild.commands;
        console.log(guild.commands);
    }
    else{
        applicationCommands = await client.application.commands;
    }
    await applicationCommands.fetch();
    
    console.log(applicationCommands);
    return applicationCommands;
}