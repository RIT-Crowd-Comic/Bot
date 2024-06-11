const { EmbedBuilder } = require('@discordjs/builders');

const help = () => {

    // Create an embed to send to the user
    const embed = new EmbedBuilder()
        .setTitle('General Server Commands')
        .addFields(
            {
                name: '/help remember',
                value: 'Shows a brief description of all of the remember subcommands'
            },
            {
                name: '/help availability',
                value: 'Shows a brief description of all of the availability subcommands'
            },
            {
                name: '/help check-in',
                value: 'Shows a brief description of all of the check-in subcommands'
            },
            {
                name: '/check-in-interface',
                value: 'Check in with how your are feeling for the day'
            },
            {
                name: '/role add',
                value: 'Adds the unavailable role to a specific user'
            },
            {
                name: '/role remove',
                value: 'Removes the unavailable role to a specific user'
            }
        );

    return { embeds: [embed], ephemeral: true };
};

const helpRemember = () => {

    // Create an embed to send to the user
    const embed = new EmbedBuilder()
        .setTitle('Remember Commands')
        .setDescription('Commands relating to message storage and retrieval')
        .addFields(
            {
                name: '/remember message',
                value: 'Remember and save a specific message'
            },
            {
                name: '/remember clear-messages',
                value: 'Clear all messages currently saved in remembrance'
            },
            {
                name: '/remember past',
                value: 'Saves messages from past set amount of "hours" and "minutes" in a specific channel    '
            },
            {
                name: '/remember recall',
                value: 'creates a JSON of all the saved message'
            },
            {
                name: '/remember number',
                value: 'Saves a number of the most recent messages from a specific channel'
            },
            {
                name: '/remember range',
                value: 'Remember all messages between two specific messages inclusively'
            },
            {
                name: '/remember start-remembering',
                value: 'Start remembering messages in a specific channel'
            },
            {
                name: '/remember stop-remembering',
                value: 'Stop remembering messages in a specific channel'
            }
        );

    return { embeds: [embed], ephemeral: true };
};

const helpAvailability = () => {

    // Create an embed to send to the user
    const embed = new EmbedBuilder()
        .setTitle('Availability Server Commands')
        .addFields(
            {
                name: '/availability set-availability',
                value: 'Saves the times and days provided by the user to record when they are (typically) available during the week'
            },
            {
                name: '/availability set-unavailability',
                value: 'Saves individual instances where the user will be unavailable'
            },
            {
                name: '/availability view-availability',
                value: 'Sends the user a message with the requested availability'
            },
            {
                name: '/availability view-unavailability',
                value: 'Sends the user a message that lists all of the days the requested server member is unavailable'
            }
        );

    return { embeds: [embed], ephemeral: true };
};

const helpCheckIn = () => {
    const embed = new EmbedBuilder()
        .setTitle('Check in Commands')
        .addFields(
            {
                name: '/check-in view',
                value: 'View your check-in schedules'
            },
            {
                name: '/check-in schedule',
                value: 'Schedule a day and time to be notified'
            },
            {
                name: '/check-in remove',
                value: 'See a list of schedules to remove'
            }
        );

    return { embeds: [embed], ephemeral: true };
}

module.exports = {
    help,
    helpRemember,
    helpAvailability,
    helpCheckIn
};
