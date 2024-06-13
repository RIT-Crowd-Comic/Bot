const { SlashCommandBuilder } = require('@discordjs/builders');
const { openAiClient } = require('../../openAi/init');
const { getRememberedMessages } = require('../../utils/rememberMessages');
const { stripIndent } = require('common-tags');
const {splitMessageToFitTokenLimit} = require('../../openAi/splitToken')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summarize')
        .setDescription('Summarizes messages that were remembered.')
        .addNumberOption(option =>
            option.setName('number-words')
                .setDescription('Length in words of the summary')
                .setRequired(false)
        ),



    async execute(client, interaction) {
        try {
            const numWords = interaction.options.getNumber('number-words');
            
            //defer reply
            await interaction.deferReply();

            const numWordsStr = numWords !== null ? `The summary has to be ${numWords.toString()} words long.` : 'The summary can be any length.'

            //get messages and remove piece of the message object we dont want to reduce tokens

            const messages = getRememberedMessages().map(message =>{
                return {
                    globalName: message.author.globalName,
                    content: message.content,
                };
            }); 
  
            //openai stuff
            const prompt = stripIndent`Summarize the 'content' of the following array of messages, 
            listing the messages in the order they appear. ${numWordsStr}: 
            ${splitMessageToFitTokenLimit(JSON.stringify(messages, null, 2))[0]}`

            const response = await openAiClient.chat.completions.create({
                model:    'gpt-3.5-turbo',
                messages: [
                    {
                        'role':    'user',
                        'content': prompt,
                    }
                ]
            });

            await interaction.editReply(response.choices[0].message.content);
        }
        catch (error) {
            await interaction.editReply({
                content:   `Something went wrong.  Ensure that not too many messages are being summarized. ${error}`,
                ephemeral: false,
            });
        }
    }
};
