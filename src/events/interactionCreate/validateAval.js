const { setAvail } = require('../../utils/availability');
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const path = './src/savedAvailability.json';
module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;

    try{
    const [action, id, start, end, monday, tuesday, wednesday, thursday, friday] = interaction.customId.split('_');
    if (action === 'v-a-y') {
        interaction.reply({ content: 'Data Saved', ephemeral: true });

        const mappedDays = [false, monday, tuesday, wednesday, thursday, friday, false]
            .map((value, index) => ((value === 't') ? daysOfWeek[index] : null)) // Map days to corresponding day names or null
            .filter(day => day !== null);

        const user = await client.users.fetch(id);

        setAvail(id, user.username, start, end, mappedDays, path);

        // Remove the button by editing the message
        await interaction.message.edit({ components: [] });

    }
    else if (interaction.customId == 'v-a-n') {
        interaction.reply({ content: 'Availability save canceled. Try rephrasing your message and trying again.', ephemeral: true });

        // Remove the button by editing the message
        await interaction.message.edit({ components: [] });
    }
}catch(error){interaction.channel.send({content:'Failed to save data: ' + error})};

};
