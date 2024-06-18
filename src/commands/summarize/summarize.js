const { SlashCommandBuilder } = require('@discordjs/builders');
const { openAiClient } = require('../../openAi/init');
const { stripIndent } = require('common-tags');
const { splitMessageToFitTokenLimit } = require('../../openAi/splitToken');
const { getAllMessages, getUser } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summarize')
        .setDescription('Summarizes messages that were remembered.')
        .addNumberOption(option =>
            option.setName('word-count')
                .setDescription('Length in words of the summary')
                .setRequired(false)),



    async execute(client, interaction) {
        try {
            const numWords = interaction.options.getNumber('number-words');

            // defer reply
            await interaction.deferReply();

            // get messages and remove pieces of the message object we dont want in order to reduce tokens


            const messages = await getAllMessages();
            const formattedMessages = await Promise.all(messages.map(async message => {
                const user = await getUser(message.authorId);
                return {
                    globalName: user.global_name ?? user.display_name ?? user.tag ?? message.authorId,
                    content:    message.content,
                };
            }));

            // const messages = Promise.all(getAllMessages()
            //     .then(messages =>
            //         messages.map(async message => {
            //             const user = await getUser(message.authorId);
            //             return {
            //                 globalName: user.global_name ?? user.display_name ?? user.tag ?? message.authorId,
            //                 content:    message.content,
            //             }
            //         }
            //     )));

            const splitMessages = splitMessageToFitTokenLimit(JSON.stringify(formattedMessages, null, 2));

            // openai stuff
            const prompt = stripIndent`
            Summarize the 'content' of the following array of messages, listing the messages in the order they appear. 

            ${numWords != null ?
        `The summary has to be ${numWords.toString()} words long` :
        'The summary can be any length.'
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
            let reply = `${response.choices[0].message.content} `;
            if (splitMessages.length > 1) reply += '\n\nWarning: Messages to summarize had to be clamped.';
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
