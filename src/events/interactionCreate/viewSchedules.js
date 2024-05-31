
/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {

    if (interaction.customId === 'show-schedule-dropdown') {
        await interaction.deferUpdate();
    }
};