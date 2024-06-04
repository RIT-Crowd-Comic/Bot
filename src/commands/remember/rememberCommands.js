const {
    SlashCommandBuilder, PermissionFlagsBits, ActivityType, ChannelType
} = require('discord.js');
const {
    getRememberedMessages, clearRememberedMessages, rememberRangeGrab, rememberOneMessage, rememberPast, rememberNumber, startRemembering, stopRemembering
} = require('../../utils/rememberMessages');
const fs = require('fs');
const { defaultExcludeBotMessages, ephemeral } = require('../../../config.json');
const { clamp } = require(`../../utils/mathUtils`);

// remembers a message based on a message id parameter
module.exports = {
    data: new SlashCommandBuilder()
        .setName('remember')
        .setDescription('Stores messages in a variety of ways')
        .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory)

        // remember message
        .addSubcommand(subcommand =>
            subcommand.setName('message')
                .setDescription('Stores a message from the current channel based on its message-id')
                .addStringOption(option =>
                    option.setName('message-id')
                        .setDescription('The id of the message')
                        .setRequired(true))
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText)))

        // remember past
        .addSubcommand(subcommand =>
            subcommand.setName('past')
                .setDescription('Saves messages from past set amount of "hours" and "minutes" in the current channel.')
                .addNumberOption(option =>
                    option.setName('hours')
                        .setDescription('The number of hours to save. Max 5.')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('minutes')
                        .setDescription('The number of minutes to save to save. Max 59.')
                        .setRequired(true))
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText))
                .addNumberOption(option =>
                    option.setName('speed')
                        .setDescription('Speed of the Search. Lower value is more accurate but slower. Range 25-100 inclusive'))
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.rememberPast}`)))

        // remember recall
        .addSubcommand(subcommand =>
            subcommand.setName('recall')
                .setDescription('Creates a JSON of all the saved message'))

        // remember clear
        .addSubcommand(subcommand =>
            subcommand.setName('clear-messages')
                .setDescription('Clear all messages currently saved in remembrance'))

        // remember number
        .addSubcommand(subcommand =>
            subcommand.setName('number')
                .setDescription('Saves the last x messages from the current channel. Has an option to save from a specific channel.')
                .addNumberOption(option =>
                    option.setName('number-of-messages')
                        .setDescription('The number of messages to save. Min 1, Max 1000.')
                        .setRequired(true))
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText))
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.rememberNumber}`)))

        // remember range
        .addSubcommand(subcommand =>
            subcommand.setName('range')
                .setDescription('Remember all messages between two specific messages (inclusively)')
                .addStringOption(option =>
                    option.setName('start-message-id')
                        .setDescription("The first message's id")
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('end-message-id')
                        .setDescription("the second message's id")
                        .setRequired(true))
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText))
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.rememberRangeGrab}`)))
        .addSubcommand(subcommand =>
            subcommand.setName('start-remembering')
                .setDescription('Start remembering messages in a specific channel')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('text channel')
                    .addChannelTypes(ChannelType.GuildText))
                .addBooleanOption(option =>
                    option.setName('exclude-bot-messages')
                        .setDescription(`If bot messages should be excluded in the message collection. Default is ${defaultExcludeBotMessages.startRemember}`)))

        .addSubcommand(subcommand =>
            subcommand.setName('stop-remembering')
                .setDescription('Stop remembering messages in a specific channel')
        ),


    options:
    {
        devOnly:  false,
        testOnly: false,
        deleted:  false,
    },


    // logic, 
    async execute(client, interaction) {


        const action = {
            'message':           () => rememberMessage(interaction),
            'past':              () => rememberPastMessages(client, interaction),
            'recall':            () => rememberRecall(interaction),
            'clear-messages':    () => rememberClear(interaction),
            'number':            () => rememberNumberMessages(client, interaction),
            'range':             () => rememberRange(interaction),
            'start-remembering': () => startRemember(client, interaction),
            'stop-remembering':  () => stopRemember(client, interaction)
        };

        try {

            // get the used subcommand
            const subcommand = interaction.options.getSubcommand();

            action[subcommand]();
        } catch (error) {
            await interaction.editReply({
                content:   `Something went wrong. ${error}`,
                ephemeral: false,
            });
        }
    }
};

// Callbacks
// remember message 
const rememberMessage = async interaction => {

    await interaction.deferReply(); // defer waits for logic to finish

    // get the id of the message  
    const idMessage = interaction.options.get('message-id').value;

    // channel id
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    const rememberResponse = await rememberOneMessage(channel.id, idMessage);

    await interaction.editReply(rememberResponse);
};

// remember past messages
const rememberPastMessages = async (client, interaction) => {
    await interaction.deferReply(); // defer waits for logic to finish

    // get the hours   
    const valueHours = interaction.options.get('hours').value;

    // get the minutes   
    const valueMinutes = interaction.options.get('minutes').value;

    // bot messages
    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.rememberPast;

    // validate accuracy
    const accuracy = clamp(25, 100, interaction.options.getNumber('speed') ?? 50);

    // format and clamp
    const numberOfHours = clamp(0, 5, valueHours).toString() + 'h'; // formatting for ms
    const numberOfMinutes = clamp(0, 59, valueMinutes).toString() + 'm'; // formatting for ms

    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    const reply = await rememberPast(numberOfHours, numberOfMinutes, channel, excludeBotMessages, accuracy);

    // show that it saved
    interaction.editReply(reply);
};

// remember recall
const rememberRecall = async interaction =>{
    await interaction.deferReply(); // defer waits for logic to finish
    const jsonFilePath = './src/rememberedMessages.json';
    const json = JSON.stringify(getRememberedMessages(), null, 2);
    interaction.editReply('Success');

    // send the json
    fs.writeFile(jsonFilePath, json, err => err && console.error(err));
    await interaction.channel.send({
        files: [
            {
                attachment: jsonFilePath,
                name:       'rememberedMessages.json'
            }
        ]
    });
};

// remember clear
const rememberClear = async interaction =>{
    await interaction.deferReply(); // defer waits for logic to finish
    await interaction.editReply(clearRememberedMessages());
};

// remember number
const rememberNumberMessages = async(client, interaction) =>{
    await interaction.deferReply(); // defer waits for logic to finish
    // get the id    
    const value = interaction.options.get('number-of-messages').value;
    const numberOfMessages = clamp(1, 1000, value);

    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.rememberNumber;

    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    const reply = await rememberNumber(numberOfMessages, channel, excludeBotMessages);

    // show that it saved
    interaction.editReply(reply);
};

const rememberRange = async interaction=>{
    const startMessageId = interaction.options.get('start-message-id').value;
    const endMessageId = interaction.options.get('end-message-id').value;
    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.rememberRangeGrab;
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    await interaction.deferReply({ ephemeral: ephemeral.rememberRangeGrab });
    const rememberRangeGrabResponse = await rememberRangeGrab(channel.id, startMessageId, endMessageId, excludeBotMessages);
    if (rememberRangeGrabResponse.status === 'Fail') {
        interaction.editReply({ content: rememberRangeGrabResponse.description });
        return;
    }

    interaction.editReply({ content: rememberRangeGrabResponse.status });
};

const startRemember = async(client, interaction)=>{
    await interaction.deferReply({ ephemeral: ephemeral.startRemember });

    // start remembering messages from the last message in the channel
    const excludeBotMessages = interaction.options.getBoolean('exclude-bot-messages') ?? defaultExcludeBotMessages.startRemember;
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;

    const reply = await startRemembering(channel, excludeBotMessages, ephemeral.startRemember);
    await interaction.editReply(reply);

    // change the status of the bot to say which channel it's remembering from
    client.user.setActivity({
        name: `Remembering #${reply.obj.name}`,
        type: ActivityType.Custom
    });
};

const stopRemember = async(client, interaction)=>{
    interaction.deferReply({ ephemeral: ephemeral.startRemember });

    // stop the remembering activity
    client.user.setActivity(null);
    const reply = await stopRemembering();
    interaction.editReply(reply);
};
