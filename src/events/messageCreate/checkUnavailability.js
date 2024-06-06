const { getAvailabilityChannel, setUnavailAI } = require('../../utils/availability');
const { openAiClient } = require('../../openAi/init');
const path = './src/savedAvailability.json';

const rememberUnavailability = (message,times) =>
{
        // Loop through the array and print each time range
        times.times.forEach(timeRange => {
            let {start, end, reason } = timeRange;
            reason = reason ?? 'a mystery event';
            message.reply(setUnavailAI(message.author.id, message.author.globalName, start, end, reason, path));
        });
};

const rememberAvailability = (message, times) =>
{
    const {days, from, to} = times;
    message.reply({ content: `${message.author.globalName} is available from ${from} to ${to}` });
};

const unableToParse = (message) =>
{
    message.reply({ content: `${message.author.globalName} something went wrong, try again` });
};

const tools = [
    {
        'type':     'function',
        'function': {
            'name':        'rememberUnavailability',
            'description': 'In relation to the local current date, determines future chunks of time that the user is unavailable as well as reasons for that unavailability. In local time.',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'times' :{
                        'type' : 'array',
                        'description' : 'An array of {start, end, reason} dates and times the user is unavailable. In local time.',
                        "items":{
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
                                'description': 'The reason why the user unavailable at those times. If nothing was given make something funny up.',
                            }
                        }
                }
                },
                'required': ['times'],
            },
        },
    },
    /*{
        'type':     'function',
        'function': {
            'name':        'rememberAvailability',
            'description': 'Gets the time the user is available using the current date in local time and gets which week days the user is available.',
            'parameters':  {
                'type': 'object',
                'properties': {
                    'from': {
                            'type':        'string',
                            'description': 'The start time that the user is available each day. Is a date in local time.',
                    },
                    'to': {
                            'type':        'string',
                            'description': 'The end time that the user is available each day. Is a date in local time.',
                    },
                    'days' :{
                        'type' : 'array',
                        'description' : 'An array of booleans representing the days the user is available. Only monday through friday.',
                        'items':{
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
    },*/
    {
        'type':     'function',
        'function': {
            'name':        'unableToParse',
            'description': 'If the user inputs content that cannot be used in the other functions.',
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

        const date = new Date(message.createdTimestamp).toLocaleDateString()
        const response = await openAiClient.chat.completions.create({
            model:    'gpt-3.5-turbo',
            messages: [
                {
                    'role':    'user',
                    'content': message.content + `the current local date is ${date} and tomorrow is not today.`,
                    'date': date
                }
            ],
            tools:       tools,
            tool_choice: 'required',
        }).catch((error) => console.log('OpenAI Error ' + error));

        const output = response.choices[0].message;

        if (!output.tool_calls)
        {
            message.reply('Unable to parse message');
            return;
        }
        parseResults(message, output.tool_calls[0].function)      
    }
    catch (error) { console.log(error); }
};

