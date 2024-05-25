const { ApplicationCommandOptionType } = require('discord.js');
const { getRememberedMessage } = require("../../utils/rememberMessages");
const { ephemeral } = require('../../../config.json');
//remembers a message based on a message id parameter
module.exports = {
    name: 'recall',
    description: 'creates a JSON of all the saved message',

    options: [
        {
            name: "private",
            description: `If the JSON will seen by only the person sending the command. Default is ${ephemeral.recall}`,
            type: ApplicationCommandOptionType.Boolean
        }
    ],

    //logic, 
    callback: async (client, interaction) => {
        try {
            const hideMessage = interaction.options.getBoolean('private') ?? ephemeral.recall
            await interaction.deferReply({ ephemeral: hideMessage })
            const messageObj = []
            const messages = getRememberedMessage();
            messages.forEach(m => messageObj.push(m))
            const json = JSON.parse(JSON.stringify(messageObj))
            interaction.editReply("Success")
        }
        catch (error) {
            await interaction.editReply({
                content: `${error}`
            });
        }
    }
};