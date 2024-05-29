const { EmbedBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'help',
    description: 'List of commands',

    callback: (client, interation) => {
        
        const embed = new EmbedBuilder()
        .setTitle('Server Commands')
        /*.setDescription('List of server commands')*/
        .addFields(
            {
                name: '/help-remember',
                value: 'Brings up list of remember commands'
            },
            {
                name: '/roles',
                value: 'Brings up a menu to assign a role'
            },
            {
                name: '/ping',
                value: 'Replies with a bot ping'
            },
            {
                name: '/ban',
                value: 'Bans a member from the server'
            }
        );

        interation.reply({embeds: [embed], ephemeral: true});
    }
}