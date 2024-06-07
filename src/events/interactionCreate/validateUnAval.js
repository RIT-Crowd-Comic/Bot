const {setUnavailAI} = require('../../utils/availability');
const path = './src/savedAvailability.json';
module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;
    
    const [action, globalName, id, start, end, reason] = interaction.customId.split('_');
    if (action === 'v-unA-y') {
        interaction.reply({content:'Data Saved', ephemeral: true});
        setUnavailAI(globalName, id, start, end, reason, path); 
    }
    else if (interaction.customId == 'v-unA-n'){
        interaction.reply({content:'Unavailability save canceled. Try rephrasing your message and trying again.', ephemeral: true});
    }
    
};