module.exports = {
    name: 'ping',
    description: 'Pong',
    devOnly: false,
    testOnly: false,
    //options []

    callback: (client, interaction) =>{
        interaction.reply(`Pong! ${client.ws.ping}ms`);
    }
};
