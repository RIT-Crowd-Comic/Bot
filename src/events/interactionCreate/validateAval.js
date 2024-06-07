const {setAvail} = require('../../utils/availability');
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const path = './src/savedAvailability.json';
module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;
    
    const [action, globalName, id, start, end, monday, tuesday, wednesday, thursday, friday] = interaction.customId.split('_');
    if (action === 'v-a-y') {
        interaction.reply({content: 'Data Saved', ephemeral: true});

        const mappedDays = [monday, tuesday, wednesday, thursday, friday]
            .map((value, index) => ((value === 'true') ? daysOfWeek[index] : null)) // Map days to corresponding day names or null
            .filter(day => day !== null);
        
        setAvail(id, globalName, start, end, mappedDays, path)  
    }
    else if (interaction.customId == 'v-a-n'){
        interaction.reply({content: 'Availability save canceled. Try rephrasing your message and trying again.', ephemeral: true});
    }
    
};