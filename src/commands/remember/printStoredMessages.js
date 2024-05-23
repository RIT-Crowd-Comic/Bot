const {getRememberedMessage} = require("../../utils/rememberMessages");

//remembers a message based on a message id parameter
module.exports = {
    name: 'print-storage',
    description: 'Stores a message from the current channel based on its message-id',

    //logic, 
    callback: async(client, interaction) =>{
        
        try{
            await interaction.deferReply();
            const messages = getRememberedMessage();
            let print = "Messages: ";
            messages.forEach(async(msg)=>{
                print+=`\n${msg.content}`;
            });
            await interaction.editReply({
                content:`Message ${print}`,
                ephemeral: false,
            });          
        }
        catch(error){ 
            await interaction.editReply({
                content:`Unable to find message. ${error}`,
                ephemeral: false,
            }); 
        }
    }
};