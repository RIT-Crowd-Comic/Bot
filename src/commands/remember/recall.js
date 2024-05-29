const { getRememberedMessage } = require("../../utils/rememberMessages");
const fs = require('fs');
//remembers a message based on a message id parameter
module.exports = {
    name: 'recall',
    description: 'creates a JSON of all the saved message',
    //logic, 
    callback: async (_, interaction) => {
        try {
            //get the json
            //? There is probably a way to do this so we don't have to have a fle created to save to
            //? Will probably be resolved once DB is created
            await interaction.deferReply({ ephemeral: false })
            const jsonFilePath = './src/rememberedMessages.json';
            const json = JSON.stringify(getRememberedMessage(), null, 2)
            interaction.editReply("Success")

            //send the json
            fs.writeFile(jsonFilePath, json, (err) => err && console.error(err))
            await interaction.channel.send({
                files: [{
                    attachment: jsonFilePath,
                    name: 'rememberedMessages.json'
                }]
            })
        }
        catch (error) {
            console.log(error)
            await interaction.editReply({
                content: `${error}`
            });
        }
    }
};