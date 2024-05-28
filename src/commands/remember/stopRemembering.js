const { ApplicationCommandOptionType, PermissionFlagsBits, ActivityType } = require('discord.js');
const remeberMessagesUtils = require("../../utils/rememberMessages");
const apiCalls = require("../../utils/apiCalls")
const path = require('path');
const { ephemeral } = require('../../../config.json');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
module.exports = {
    name: 'stop-remembering',
    description: 'Stop remembering message in a specic channels',
    permissionsRequired: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],

    callback: async (client, interaction) => {
        try {
            const obj = remeberMessagesUtils.rememberMessageObj;
            await interaction.deferReply({ ephemeral: obj?.ephemeral ?? ephemeral.startRemember })
            
            //if a message is not being remembered, send a waring message
            if(!obj) {
                await interaction.editReply({
                    content: `No channel is being remembered. Use "start-remembering" to start remember messsages in a channel`
                })
                return;
            }

            // stop the remembering activity
            client.user.setActivity(null)

            //todo:remeber all message in between then and now (refactor rememberRangeGrab)
            const channelObj = await apiCalls.getChannelObject(obj.id);
            const rememberRangeGrabResponse = await remeberMessagesUtils.rememberRangeGrab(obj.id, obj.last_message_id, channelObj.last_message_id, obj.excludeBotMessages)
            if (rememberRangeGrabResponse.status === "Fail") {
                interaction.editReply({
                    content: rememberRangeGrabResponse.description
                });
                return;
            }

            
            await interaction.editReply({
                content: `Success`
            })
            
            //make rememberMessageObj undefined
            remeberMessagesUtils.rememberMessageObj = undefined;
        }

        catch (error) {
            interaction.editReply(error)
            console.log("Error: " + error)
        }


    }
};