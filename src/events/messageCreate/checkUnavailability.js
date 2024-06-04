const { getAvailabilityChannel } = require('../../utils/availability');
const {openAiClient} = require('../../openAi/init');

module.exports = async (client, message) => {
    try {

        const availabilityChannel = await getAvailabilityChannel();
        //only send a message if it's not from a bot and it's from the available channel
        if (message.author.bot || !availabilityChannel || message.channelId !== availabilityChannel.id) {
            return;
        }
    
        const response = await openAiClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            tools: tools,
            tool_choice: "auto",
        }).catch((error) => console.log('OpenAI Error ' + error));
        
        const from = response.function_call.arguments;
        const to = response.function_call.arguments;
        const reason = response.function_call.arguments;
         

    } catch (error) {
        //! might want to make it so this is sent to a channel, but it's not guaranteed the availability channel was set up correctly
        console.log(error)
    }
}


const messages = [{"role": "user", "content": "I am busy between 1 pm and 3pm on this upcoming 5th"}];

const tools = [
    {
      "type": "function",
      "function": {
        "name": "remember_unavailability",
        "description": "Determines if the user is busy between certain times ",
        "parameters": {
          "type": "object",
          "properties": {
            "from": {
              "type": "string",
              "description": "The start date and time that the user is unavailable",
            },
            "to":{
                "type" : "string",
                "description": "The end date and time that the user is unavailable",
            },
            "reason":{
                "type" : "string",
                "description": "The reason for the unavailability",
            }
          },
          "required": ["from", "to"],
        }
      }
    }
];


/*{
  from: <etc>,
  to: <etc>,
  reason: 'fourth'
}*/