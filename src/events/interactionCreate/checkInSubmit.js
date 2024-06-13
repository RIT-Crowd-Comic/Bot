const scheduleUtils = require('../../utils/schedule')
/**
 * 
 * Handle when a user submits the check in modal survey. 
 * 
 */



/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    // only handle when the user submits the check in form
    if (!interaction?.isModalSubmit()) return;
    if (interaction.customId !== 'check-in-form-modal') return;

    await interaction.deferReply({ ephemeral: true });
    const user = interaction.user;
    if (!user) {
        await interaction.editReply(`User is undefined`);
        return;
    }

    try {

        // TODO: save to a database and provide feedback
        let roseResponse = interaction.fields?.getTextInputValue('check-in-form-roses') ?? '';
        let budResponse = interaction.fields?.getTextInputValue('check-in-form-buds') ?? '';
        let thornResponse = interaction.fields?.getTextInputValue('check-in-form-thorns') ?? '';

        roseResponse = roseResponse ? `"${roseResponse}"` : 'N/A'
        budResponse = budResponse ? `"${budResponse}"` : 'N/A'
        thornResponse = thornResponse ? `"${thornResponse}"` : 'N/A'

        const response = scheduleUtils.parseResponse(roseResponse, budResponse, thornResponse, user, new Date().getTime().toString());
        scheduleUtils.addResponse(response)
        let reply = ['Thanks for responding! Make sure to take short breaks and to drink plenty of water!',].join('\n');

        // user finished form, give them words of encouragement
        await interaction.editReply({
            ephemeral: true,
            content:   reply
        });
    }
    catch (error) {
        console.log(error);
    }
};
