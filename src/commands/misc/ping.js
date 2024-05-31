const { SlashCommandBuilder} = require('discord.js');

//displays the bots ping
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with bot ping'),

    options:
    {
        devOnly: true,
        testOnly: false,
        deleted: false,
    },


    //logic, 
    async execute(client, interaction) {

        try {
            await interaction.deferReply();

            const reply = await interaction.fetchReply();
    
            const ping = reply.createdTimestamp - interaction.createdTimestamp;
    
            interaction.editReply(`Client ${ping}ms | Websocket: ${client.ws.ping}ms`);     
        }
        catch (error) {
            await interaction.editReply({
                content: `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};