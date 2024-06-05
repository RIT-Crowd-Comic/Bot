const { getAvailabilityChannel } = require('../../utils/availability');
const { openAiClient } = require('../../openAi/init');

const rememberUnavailability = (message,times) =>
{
        // Loop through the array and print each time range
        times.times.forEach(timeRange => {
            let {start, end, reason } = timeRange;
            reason = reason ?? 'a mystery event';
            message.reply({ content: `${message.author.globalName} is unavailable from ${start} to ${end} for ${reason}` });
        });
};

const rememberAvailability = (message, times) =>
{
    // Loop through the array and print each time range
    times.times.forEach(timeRange => {
        const {start, end} = timeRange;
        message.reply({ content: `${message.author.globalName} is available from ${start} to ${end}` });
    });
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
            'description': 'Determines if the user is busy between certain times.',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'times' :{
                        'type' : 'array',
                        'description' : 'An array of {start, end, reason} dates and times the user is unavailable. In UTC',
                        "items":{
                            'from': {
                                'type':        'string',
                                'description': 'The start date and time that the user is unavailable. Returns a date in UTC.',
                            },
                            'to': {
                                'type':        'string',
                                'description': 'The end date and time that the user is unavailable. Returns a date in UTC',
                            },
                            'reason': {
                                'type':        'string',
                                'description': 'The reason why the user unavailable at those times.',
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
            'description': 'Determines if the user is available between certain times. Based on the current date passed to the api.',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'times' :{
                        'type' : 'array',
                        'description' : 'An array of {start, end} dates and times the user is available. In UTC.',
                        "items":{
                            'from': {
                                'type':        'string',
                                'description': 'The start date and time that the user is available. Returns a date in UTC.',
                            },
                            'to': {
                                'type':        'string',
                                'description': 'The end date and time that the user is available. Returns a date in UTC.',
                            },
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
            'name':        'unableToParse',
            'description': 'If the user inputs data that cannot be interpreted',
            'parameters':  {},
        },
    },
];

const parseResults = (message, calledFunction) =>{
    const action = {
        'rememberUnavailability': () => rememberUnavailability(message, JSON.parse(calledFunction.arguments)),
        'rememberAvailability':   () => rememberAvailability(message, JSON.parse(calledFunction.arguments)),
        'unableToParse':          () => unableToParse(message),
    };
    action[calledFunction.name]();
}

module.exports = async (client, message) =>
{
    try
    {
        const availabilityChannel = await getAvailabilityChannel();

        // only send a message if it's not from a bot and it's from the available channel
        if (message.author.bot || !availabilityChannel || message.channelId !== availabilityChannel.id) {
            return;
        }

        const date = new Date(message.createdTimestamp).toISOString()

        const response = await openAiClient.chat.completions.create({
            model:    'gpt-3.5-turbo',
            messages: [
                {
                    'role':    'user',
                    'content': message.content + `the current date is ${date}`,
                    'date': date
                }
            ],
            tools:       tools,
            tool_choice: 'auto',
        }).catch((error) => console.log('OpenAI Error ' + error));

        const output = response.choices[0].message;

        if (!output.tool_calls)
        {
            message.reply('Unable to parse message');
            return;
        }
        output.tool_calls.forEach(tool => {
            parseResults(message, tool.function)
        })
    }
    catch (error) { console.log(error); }
};

