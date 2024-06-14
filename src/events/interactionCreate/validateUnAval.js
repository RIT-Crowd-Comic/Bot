const { setUnavailAI } = require('../../utils/availability');
const path = './src/savedAvailability.json';


module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;

    try {
        const [action, id, start, end, reason] = interaction.customId.split('_');
        if (action === 'v-unA-y') {
            interaction.reply({ content: 'Data Saved', ephemeral: true });

            const user = await client.users.fetch(id);

            setUnavailAI(id, user.globalName, start, end, reason, path);

            // Remove the button by editing the message
            await interaction.message.edit({ components: [] });
        }
        else if (interaction.customId == 'v-unA-n') {
            interaction.reply({ content: 'Unavailability save canceled. Try rephrasing your message and trying again.', ephemeral: true });

            // Remove the button by editing the message
            await interaction.message.edit({ components: [] });
        }
    }
    catch (error) { interaction.channel.send({ content: 'Failed to save data: ' + error }); }

};
