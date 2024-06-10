const { SlashCommandBuilder } = require('@discordjs/builders');
const { openAiClient } = require('../../openAi/init');
const { getRememberedMessages } = require('../../utils/rememberMessages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summarize')
        .setDescription('Summarizes messages that were remembered.')
        .addNumberOption(option =>
            option.setName('number')
                .setDescription('Number of messages to summarize')
                .setRequired(false)
        ),


    async execute(client, interaction) {
        try {

            //grab the option 
            const num = interaction.options.getNumber('number');
            
            //defer reply
            await interaction.deferReply();

            const numStr = num !== null ? `the most recent ${num.toString()}` : 'all'

            //openai stuff
            const prompt = `Summarize the 'content' of the following array of messages, listing the messages in the order they appear: ${JSON.stringify(getRememberedMessages(), null, 2)}`

            const response = await openAiClient.chat.completions.create({
                model:    'gpt-3.5-turbo',
                messages: [
                    {
                        'role':    'user',
                        'content': prompt,
                    }
                ]
            }).catch((error) => console.log('OpenAI Error ' + error));

            await interaction.editReply(response.choices[0].message.content);
        }
        catch (error) {
            await interaction.editReply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
