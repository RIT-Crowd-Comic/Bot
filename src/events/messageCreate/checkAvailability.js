const { getAvailabilityChannel } = require('../../utils/availability');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { openAiClient } = require('../../openAi/init');
const { stripIndents } = require('common-tags');

/**
 * 
 * @param {DiscordJS Message} message 
 * @param {Array of Times} times 
 */
const rememberUnavailability = async(message, times) => {

    // Loop through the array and print each time range
    times.times.forEach(async timeRange => {
        let { start, end, reason } = timeRange;
        reason = reason ?? 'a mystery event';
        const content = `Start: \`${start}\` End: \`${end}\` Reason: \`${reason}\``;

        // {author: message.author.globalName, id: message.author.id, start: start , end: end , reason: reason}
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`v-unA-y_${message.author.id}_${start}_${end}_${reason}`)
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('v-unA-n')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger),
            );
        await message.reply({ content: `${content}\n'Is this information correct? Times are in local 24 hour time.'`, components: [row], ephemeral: true });
    });

};

/**
 * Parse and save availability
 * @param {DiscordJS Message} message 
 * @param {Object of times} times 
 */
const rememberAvailability = async(message, times) => {
    const { days, from, to } = times;

    // swap days to a string
    const daysString = days.map(d => d.toString());

    const content = `Start:\`${from}\` End: \`${to}\` Days: M:\`${days[0]}\` T:\`${days[1]}\` W:\`${days[2]}\` Th:\`${days[3]}\` F:\`${days[4]}\``;
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()// save the data to the message id, days[i][0] represents the first char of a bool, so t
                .setCustomId(`v-a-y_${message.author.id}_${from}_${to}_${daysString[0][0]}_${daysString[1][0]}_${daysString[2][0]}_${daysString[3][0]}_${daysString[4][0]}`)
                .setLabel('Yes')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('v-a-n')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger),
        );
    await message.reply({ content: `${content}\n\nIs this information correct? Times are in local 24 hour time.`, components: [row], ephemeral: true });
};

/**
 * Called when openai fails to parse message
 * @param {DiscordJS Message} message 
 */
const unableToParse = (message) => {
    message.reply({ content: `Something went wrong, the message could not be interpreted,  please try again`, ephemeral: true });
};

const tools = [
    {
        'type':     'function',
        'function': {
            'name':        'rememberUnavailability',
            'description': 'In relation to the local current message date, determines future chunks of time that the user is unavailable or busy as well as reasons for that unavailability. In local time.',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'times': {
                        'type':        'array',
                        'description': 'An array of {start, end, reason} dates and times the user is unavailable. In local time. The reason must be under 30 characters, remove spaces.',
                        'items':       {
                            'from': {
                                'type':        'string',
                                'description': 'The start date and time that the user is unavailable. Is a date in local time.',
                            },
                            'to': {
                                'type':        'string',
                                'description': 'The end date and time that the user is unavailable. Is a date in local time',
                            },
                            'reason': {
                                'type':        'string',
                                'description': 'The reason why the user unavailable at those times. If nothing was given make something funny up. Under 30 characters',
                            }
                        }
                    }
                },
                'required': ['times'],
            },
        },
    },
    {
        'type':     'function',
        'function': {
            'name':        'rememberAvailability',
            'description': 'Gets the local time the user is generally available, and gets which week days the user is available. Each user only has one, and its the default time that the user is available.',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'from': {
                        'type':        'string',
                        'description': 'The start time that the user is available each day. Is a date in local time.',
                    },
                    'to': {
                        'type':        'string',
                        'description': 'The end time that the user is available each day. Is a date in local time.',
                    },
                    'days': {
                        'type':        'array',
                        'description': 'An array of booleans representing the days the user is available. Only monday through friday.',
                        'items':       {
                            'monday': {
                                'type':        'bool',
                                'description': 'If monday is available or not.',
                            },
                            'tuesday': {
                                'type':        'bool',
                                'description': 'If tuesday is available or not.',
                            },
                            'wednesday': {
                                'type':        'bool',
                                'description': 'If wednesday is available or not.',
                            },
                            'thursday': {
                                'type':        'bool',
                                'description': 'If thursday is available or not.',
                            },
                            'friday': {
                                'type':        'bool',
                                'description': 'If friday is available or not.',
                            }
                        }

                    }
                },
                'required': ['from', 'to', 'days'],
            },
        },
    },
    {
        'type':     'function',
        'function': {
            'name':        'unableToParse',
            'description': 'If the user inputs content that cannot be used in the other functions.',
            'parameters':  {},
        },
    },
];


const examples =
   `{
        'role':    'user',
        'content': I am busy from 10-12 tommorow. Message date 6/12/2024. Day is wednesday.,
    },
    {
        'role':    'assistant',
        'content': {name: 'rememberUnavailability', arguments: '{"times":[{"start":"2024-06-13T10:00:00","end":"2024-06-13T14:00:00","reason":"busy"}]}"}',
    },
    {
        'role':    'user',
        'content': I am busy all day this upcoming wednesday, thursday i am busy from 10-2 and friday 10-4. Message date 6/11/2024. Day is tuesday.,
    },
    {
        'role':    'assistant',
        'content': {name: 'rememberUnavailability', arguments: '{"times":[{"start":"2024-06-12T00:00:00","end":"2024-06-12T23:59:59","reason":"busy"}, {"start":"2024-06-13T10:00:00","end":"2024-06-13T14:00:00","reason":"busy"}, {"start":"2024-06-14T10:00:00","end":"2024-06-14T16:00:00","reason":"busy"}]}"}',
    },
    {
        'role':    'user',
        'content': I free from 9-5 monday through friday. Message date 6/12/2024, day is wednesday,
    },
    {
        'role':    'assistant',
        'content': {name: "rememberAvailability", arguments: "{"from":"09:00","to":"17:00","days":[true,true,true,true,true]}",},
    },
    `;

/**
 * Given a function object from open ai and a message, attempt to parse 
 * @param {DiscordJS Message} message 
 * @param {OpenAI Tool} calledFunction 
 */
const parseResults = (message, calledFunction) =>{
    const action = {
        'rememberUnavailability': () => rememberUnavailability(message, JSON.parse(calledFunction.arguments)),
        'rememberAvailability':   () => rememberAvailability(message, JSON.parse(calledFunction.arguments)),
        'unableToParse':          () => unableToParse(message),
    };

    try { action[calledFunction.name](); }
    catch (error) { console.log(`There was an issue ${error}`); }
};

// checks the message sent in the channel and sends it to openai to parse, then if possible saves the availability data
module.exports = async (client, message) => {
    try {
        const availabilityChannel = await getAvailabilityChannel();

        // only send a message if it's not from a bot and it's from the available channel
        if (message.author.bot || !availabilityChannel || message.channelId !== availabilityChannel.id) {
            return;
        }
        const date = new Date(message.createdTimestamp).toLocaleDateString();
        const day = new Date(message.createdTimestamp).getDay();

        const prompt = stripIndents`Based on the attached message and examples, 
        use one of the provided tools to parse unavailability using 'rememberUnavailability' or availability using 'rememberAvailability'. 
        Availability represents the general default time the user is free to work during the week. Unavailability are the times the user cannot work during the week.
        Avoid calling both 'rememberUnavailability' and 'rememberAvailability' unless the user's wording makes it clear and necessary.
        If neither work, call 'unableToParse' from the tools. The message date is ${date} and the current day of the week is ${day}.
        These are some example input and outputs to mimic. The dates within the example don't align to the current message date so make sure to parse with the current message date. ${examples}.`;
        const response = await openAiClient.chat.completions.create({
            model:    'gpt-3.5-turbo',
            messages: [
                {
                    'role':    'system',
                    'content': prompt,
                },
                {
                    'role':    'user',
                    'content': stripIndents`${message.content}`,
                }
            ],
            tools:       tools,
            tool_choice: 'required',
        }).catch((error) => console.log('OpenAI Error ' + error));

        const output = response.choices[0].message;

        if (!output.tool_calls) {
            message.reply('Unable to parse message');
            return;
        }

        output.tool_calls.forEach(tool =>{
            parseResults(message, tool.function);
        });
    }
    catch (error) { console.log(error); }
};

