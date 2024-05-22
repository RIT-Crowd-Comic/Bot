module.exports = {
    name: 'ping',
    description: 'Replies with a bot ping',
    devOnly: false,
    testOnly: false,
    //options []

    callback: async (client, interaction) =>{
        await interaction.deferReply();

        const reply = await interaction.fetchReply();

        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply(`Client ${ping}ms | Websocket: ${client.ws.ping}ms`);
        
    }
};
