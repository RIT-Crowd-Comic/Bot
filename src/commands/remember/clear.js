const {clearRememeberedMessages} = require("../../utils/rememberMessages");
module.exports = {
    name: 'clear-messages',
    description: 'Clear all messages currently saved in rememberance',

    callback: async (_, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: false })
            clearRememeberedMessages();
            await interaction.editReply({content: "Success"})

        } catch (error) {
            interaction.editReply(error)
            console.log("Error: " + error)
        }
    }
};