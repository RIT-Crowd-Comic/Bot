/**
 * Author: Arthur Powers
 * Date: 5/22/2024
 * 
 * 
 * Handle when a user submits the checkup modal survey. 
 * 
 * TODO: store the result in a database
 */


/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    // only handle when the user submits the checkup form
    if (!interaction?.isModalSubmit()) return;
    if (interaction.customId !== 'checkup-form-modal') return;

    try {
        // TODO: save to a database and provide feedback
        const roseResponse = interaction.fields?.getTextInputValue('checkup-form-roses') ?? '';
        const thornResponse = interaction.fields?.getTextInputValue('checkup-form-thorns') ?? '';

        

        // user finished form, give them words of encouragement
        await interaction.reply(
            {
                ephemeral: true,
                content: `Thanks for responding! Make sure to take short breaks and to drink plenty of water!`
            }
        );
    }
    catch (error) {
        console.log(error);
    }
}