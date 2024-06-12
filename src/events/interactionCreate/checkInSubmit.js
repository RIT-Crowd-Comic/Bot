/**
 * 
 * Handle when a user submits the check in modal survey. 
 * 
 */

const db = require('../../database');

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

    await interaction.deferReply({ ephemeral: true });

    if (userId === undefined) {
        await interaction.editReply(`Could not process form data`);
        return;
    }

    try {

        let reply = 'Thanks for responding! Make sure to take short breaks and to drink plenty of water!';

        // save to the database
        const response = {
            rose:  interaction.fields?.getTextInputValue('check-in-form-roses') ?? '',
            thorn: interaction.fields?.getTextInputValue('check-in-form-thorns') ?? '',
            bud:   interaction.fields?.getTextInputValue('check-in-form-buds') ?? ''
        };

        // 
        try {
            db.upsertUser({
                id:           userId,
                tag:          interaction?.user?.tag,
                display_name: interaction?.user?.displayName,
                global_name:  interaction?.user?.globalName,
            });

            db.addCheckInResponse(interaction?.user?.id, response);
        }
        catch {
            reply = 'Error saving to database.';
        }

        // db.addCheckInResponse(interaction.user.id, response);


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
