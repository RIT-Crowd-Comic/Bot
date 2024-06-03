const {EmbedBuilder } = require('@discordjs/builders');

const help = () =>{
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

 return { embeds: [embed], ephemeral: true }
}

const helpRemember = () =>{
            //Create an embed to send to the user
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
                    name: '/remember clear-messages',
                    value: 'Clear all messages currently saved in remembrance'
                },
                {
                    name: '/remember recall',
                    value: 'creates a JSON of all the saved message'
                },
                {
                    name: '/remember past',
                    value: 'Saves messages from past set amount of "hours" and "minutes" in the current channel.'
                },
                {
                    name: '/remember number',
                    value: 'Saves the last x messages from the current channel. Has an option to save from a specific channel.'
                },
                {
                    name: '/remember range',
                    value: 'Remember all messages between two specific messages (inclusively)'
                },
                {
                    name: '/remember start-remembering',
                    value: 'Start remembering messages in a specific channels'
                },
                {
                    name: '/remember stop-remembering',
                    value: 'Stop remembering messages in a specific channels'
                }
            );

        return{embeds: [embed], ephemeral: true};
}

module.exports = {
    help,
    helpRemember
}