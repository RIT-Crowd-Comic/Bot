const {clearRememberedMessages} = require("../../utils/rememberMessages");
module.exports = {
    name: 'clear-messages',
    description: 'Clear all messages currently saved in remembrance',

    callback: async (_, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: false })
            clearRememberedMessages();
            await interaction.editReply({content: "Success"})

        } catch (error) {
            interaction.editReply(error)
            console.log("Error: " + error)
        }
    }
};