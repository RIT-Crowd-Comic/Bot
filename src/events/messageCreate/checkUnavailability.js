const { getAvailabilityChannel } = require('../../utils/availability');
const { openAiClient } = require('../../openAi/init');

const rememberUnavailability = (message, from, to, reason = 'a mystery event') =>
{
    message.reply({ content: `${message.author.globalName} is unavailable from ${from} to ${to} for ${reason}` });
};

const rememberAvailability = (message, from, to) =>
{
    message.reply({ content: `${message.author.globalName} is available from ${from} to ${to}` });
};

const unableToParse = (message) =>
{
    message.reply({ content: `${message.author.globalName} did not give data that could be parsed` });
};

const tools = [
    {
        'type':     'function',
        'function': {
            'name':        'rememberUnavailability',
            'description': 'Determines if the user is busy between certain times ',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'from': {
                        'type':        'string',
                        'description': 'The start date and time that the user is unavailable. In UTC.',
                    },
                    'to': {
                        'type':        'string',
                        'description': 'The end date and time that the user is unavailable. In UTC.',
                    },
                    'reason': {
                        'type':        'string',
                        'description': 'The reason why the user unavailable at those times.',
                    }
                },
                'required': ['from', 'to'],
            },
        },
    },
    {
        'type':     'function',
        'function': {
            'name':        'rememberAvailability',
            'description': 'Determines if the user is available between certain times',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'from': {
                        'type':        'string',
                        'description': 'The start date and time that the user is available. In UTC.',
                    },
                    'to': {
                        'type':        'string',
                        'description': 'The end date and time that the user is available. In UTC.',
                    },
                },
                'required': ['from', 'to'],
            },
        },
    },
    {
        'type':     'function',
        'function': {
            'name':        'unableToParse',
            'description': 'If the user inputs data that cannot be interpreted',
            'parameters':  {},
        },
    },
];

module.exports = async (client, message) =>
{
    try
    {
        const availabilityChannel = await getAvailabilityChannel();

        // only send a message if it's not from a bot and it's from the available channel
        if (message.author.bot || !availabilityChannel || message.channelId !== availabilityChannel.id) {
            return;
        }

        const response = await openAiClient.chat.completions.create({
            model:    'gpt-3.5-turbo',
            messages: [
                {
                    'role':    'user',
                    'content': message.content
                }
            ],
            tools:       tools,
            tool_choice: 'auto',
        }).catch((error) => console.log('OpenAI Error ' + error));

        const output = response.choices[0].message;
        console.log(output);

        if (!output.tool_calls)
        {
            message.reply('Unable to parse message');
            return;
        }
        const calledFunction = output.tool_calls[0].function;

        const action = {
            'rememberUnavailability': () => rememberUnavailability(message, JSON.parse(calledFunction.arguments)['from'], JSON.parse(calledFunction.arguments)['to'], JSON.parse(calledFunction.arguments)['reason']),
            'rememberAvailability':   () => rememberAvailability(message, JSON.parse(calledFunction.arguments)['from'], JSON.parse(calledFunction.arguments)['to']),
            'unableToParse':          () => unableToParse(message),
        };

        action[calledFunction.name]();
    }
    catch (error) { console.log(error); }
};

