// assigns a role when a button is pressed for the role

//
// NOTE the bot has to have a higher role than others to properly assign roles, otherwise it will infinitely think
//

module.exports = async (client, interaction) =>
{
    return; // temporarily remove until roles are fixed
    // this script runs for every button press.
    // instead, include some kind of check to make sure the button is a role button
    try
    {

        // if not a button, return
        if (!interaction.isButton()) return;

        // wait for a reply
        await interaction.deferReply({ ephemeral: true });

        // get the role from the interaction (buttons)
        const role = interaction.guild.roles.cache.get(interaction.customId);

        // if nothing return
        if (!role)
        {
            interaction.editReply({ content: "I couldn't find that role", });
            return;
        }

        // if member has role remove it
        const hasRole = interaction.member.roles.cache.has(role.id);
        if (hasRole)
        {
            await interaction.member.roles.remove(role);
            await interaction.editReply(`The role ${role} has been removed.`);
            return;
        }

        // otherwise add it
        await interaction.member.roles.add(role);
        await interaction.editReply(`The role ${role} has been added.`);
    }
    catch (error)
    {
        console.log(error);
    }
};
