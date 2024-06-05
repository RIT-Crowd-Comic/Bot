/**
 * 
 * Handle when a user submits the check in modal survey. 
 * 
 */


let formResult = {};

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

    const userId = interaction?.user?.id;
    const userTag = interaction?.user?.tag;

    await interaction.deferReply({ ephemeral: true });

    if (userId === undefined || userTag === undefined) {
        await interaction.editReply(`Could not process form data`);
        return;
    }

    try {

        // TODO: save to a database and provide feedback
        const roseResponse = interaction.fields?.getTextInputValue('check-in-form-roses') ?? '';
        const thornResponse = interaction.fields?.getTextInputValue('check-in-form-thorns') ?? '';

        formResult = {
            roseResponse,
            thornResponse,
            id:         userId,
            tag:        userTag,
            submitDate: interaction.createdAt
        };

        let reply = [
            'Thanks for responding! Make sure to take short breaks and to drink plenty of water!',

            // '',
            // '',
            // '[debug]',
            // '```json',
            // `${JSON.stringify(formResult, undefined, 2)}`,
            // '```'
        ].join('\n');

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
