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


const fakeS = {
"available": {
    "from": "2024-05-20T14:00:00.000Z",
    "to": "2024-08-09T22:00:00.000Z",
    "days": [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday"
    ]
  },
  "unavailable": [
    {
      "from": "2024-07-03T05:00:00.000Z",
      "to": "2024-07-06T04:59:00.000Z",
      "reason": "Holiday"
    },
    {
      "from": "2024-08-01T20:00:00.000Z",
      "to": "2024-08-02T17:30:00.000Z"
    }
  ]
}
const tools = [
    {
        'type':     'function',
        'function': {
            'name':        'rememberUnavailability',
            'description': 'Determines chunks of time in the future and reasons that the user is available. If no reason is given make up something silly. In UTC.',
            'parameters':  {
                'type':       'object',
                'properties': {
                    'times' :{
                        'type' : 'array',
                        'description' : 'An array of {start, end, reason} dates and times the user is unavailable. In UTC.',
                        "items":{
                            'from': {
                                'type':        'string',
                                'description': 'The start date and time that the user is unavailable. Is a date in UTC.',
                            },
                            'to': {
                                'type':        'string',
                                'description': 'The end date and time that the user is unavailable. Is a date in UTC',
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
            'description': 'Gets a the time in UTC the user is available each day, then grabs which days the user is available. Match the properties exactly.',
            'parameters':  {
                'type': 'object',
                'properties': {
                    'from': {
                            'type':        'string',
                            'description': 'The start time that the user is available each day. In UTC.',
                    },
                    'to': {
                            'type':        'string',
                            'description': 'The end time that the user is available each day. In UTC',
                    },
                    'days' :{
                        'type' : 'array',
                        'description' : 'An array of booleans representing the days the user is available. Only check monday through friday.',
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
                'required': ['times', 'days'],    
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
                    'content': message.content + `the current date is ${date}.yea`,
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
        output.tool_calls.forEach(tool => {
            parseResults(message, tool.function)
        })
    }
    catch (error) { console.log(error); }
};

