const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help-remember')
        .setDescription('List of commands for remembering messages'),

    options:
    {
        devOnly:  false,
        testOnly: false,
        deleted:  false
    },

    async execute(client, interaction)
    {

        // Create an embed to send to the user
        const embed = new EmbedBuilder()
            .setTitle('Remember Commands')
            .setDescription('Commands relating to message storage and retrieval')
            .addFields(
                {

                    // name - /[name of command]
                    name: '/remember message',

                    // value - description of command
                    value: 'Stores a message from the current channel based on its message-id'
                },
                {
                    name:  '/remember clear-messages',
                    value: 'Clear all messages currently saved in remembrance'
                },
                {
                    name:  '/remember recall',
                    value: 'creates a JSON of all the saved message'
                },
                {
                    name:  '/remember past',
                    value: 'Saves messages from past set amount of "hours" and "minutes" in the current channel.'
                },
                {
                    name:  '/remember number',
                    value: 'Saves the last x messages from the current channel. Has an option to save from a specific channel.'
                },
                {
                    name:  '/remember range',
                    value: 'Remember all messages between two specific messages (inclusively)'
                },
                {
                    name:  '/remember start-remembering',
                    value: 'Start remembering messages in a specific channels'
                },
                {
                    name:  '/remember stop-remembering',
                    value: 'Stop remembering messages in a specific channels'
                }
            );

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
