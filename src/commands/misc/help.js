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
                name: '/check-in-interface',
                value: 'Create an interface for users to schedule their check ins'
            },
            {
                name: '/schedule-check-in',
                value: 'Schedule a day and time to be notified'
            }
        );

        interation.reply({embeds: [embed], ephemeral: true});
    }
}