const { EmbedBuilder } = require('@discordjs/builders')

module.exports = {
    name: 'help-remember',
    description: 'List of remember commands',

    callback: (client, interation) => {
        
        const embed = new EmbedBuilder()
        .setTitle('Remember Commands')
        /*.setDescription('List of server commands')*/
        .addFields(
            {
                name: '/remember',
                value: 'Stores a message from the current channel based on its message-id'
            },
            {
                name: '/print-storage',
                value: 'Recall and print stored messages'
            },
            {
                name: '/remember-chunk-time',
                value: 'Saves messages from past set amount of \"minutes\" in the current channel.'
            },
            {
                name: '/remember-count',
                value: 'Saves the last x messages from the current channel. Has an option to save from a specific channel.'
            },
            {
                name: '/remember-messages',
                value: 'Remember all messages between two specific messages (inclusivley)'
            }
        );

        interation.reply({embeds: [embed], ephemeral: true});
    }
}