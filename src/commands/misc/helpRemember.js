const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'help-remember',
    description: 'List of commands for remembering messages',

    callback: (client, interaction) => {
        //Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle('Remember Commands')
            .setDescription('Commands relating to message storage and retrieval')
            .addFields(
                {
                // name - /[name of command]
                    name: '/remember',
                    // value - description of command
                    value: 'Stores a message from the current channel based on its message-id'
                },
                {
                    name: '/clear-messages',
                    value: 'Clear all messages currently saved in remembrance'
                },
                {
                    name: '/print-storage',
                    value: 'Recall and print stored messages'
                },
                {
                    name: '/recall',
                    value: 'creates a JSON of all the saved message'
                },
                {
                    name: '/remember-chunk-time',
                    value: 'Saves messages from past set amount of "minutes" in the current channel.'
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

        interaction.reply({embeds: [embed], ephemeral: true});
    }
};