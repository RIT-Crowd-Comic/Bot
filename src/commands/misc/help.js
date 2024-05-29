const { EmbedBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'help',
    description: 'List of commands',

    callback: (client, interaction) => {
        //Create an embed to send to the user
        const embed = new EmbedBuilder()
        .setTitle('Server Commands')
        .addFields(
            {
                // name - /[name of command]
                name: '/help-remember',
                // value - description of command
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