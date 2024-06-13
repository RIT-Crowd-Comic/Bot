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

            //get messages and remove piece of the message object we dont want to reduce tokens

            const messages = getRememberedMessages().map(message =>{
                return {
                    globalName: message.author.globalName,
                    content: message.content,
                };
            }); 
  
            const splitMessages = splitMessageToFitTokenLimit(JSON.stringify(messages, null, 2));
            //openai stuff
            const prompt = stripIndent`
            Summarize the 'content' of the following array of messages, listing the messages in the order they appear. 

            ${numWords != null
                ?`The summary has to be ${numWords.toString()} words long`
                : 'The summary can be any length.'
            }.
            ${splitMessages[0]}
            `;

            const response = await openAiClient.chat.completions.create({
                model:    'gpt-3.5-turbo',
                messages: [
                    {
                        'role':    'user',
                        'content': prompt,
                    }
                ]
            });
            let reply = `${response.choices[0].message.content} `
            if(splitMessages.length > 1) reply += '\n\nWarning: Messages to summarize had to be clamped.';
            await interaction.editReply(reply);
        }
        catch (error) {
            await interaction.editReply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};
