const { getLocalCommands } = require('../../utils/getCommands');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


module.exports = async (client, interaction) =>{
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(cmd => cmd.data.name === interaction.commandName);

        if (!commandObject) return;



        if (commandObject.options?.devOnly) {
            if (!process.env.DEV_IDS.includes(interaction.member.id)) {
                interaction.reply({
                    content:   'Only developers are allowed to run this command.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.options?.testOnly) {
            if (!(interaction.guild.id === process.env.TESTSERVER_ID)) {
                interaction.reply({
                    content:   'This command cannot be ran here.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.data.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content:   'Not enough permissions.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }


        // bot permissions
        if (commandObject.data.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if (!bot.permissions.has(permission)) {
                    interaction.reply({
                        content:   "I don't have enough permissions.",
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        await commandObject.execute(client, interaction);



    }
    catch (error) {
        console.log(`There was an error running this command: ${error}`);
    }
};

