const {getRememberedMessages} = require("../../utils/rememberMessages");

const fs = require('fs');

//remembers a message based on a message id parameter
module.exports = {
    name: 'print-storage',
    description: 'Stores a message from the current channel based on its message-id',
    devOnly: true,

    //logic, 
    callback: async(client, interaction) =>{
        
        try{
            await interaction.deferReply();
            const messages = getRememberedMessages();
            let print = "Messages: ";
            messages.forEach(async(msg)=>{
                print+=`
                ${msg.content}
                `;
            });
            

            const path = './storedFiles/storage.txt';
            fs.writeFile(path, print, error =>{
                if(error) console.log(error); 
                return;
            });

            interaction.channel.send({
                files: [{
                    attachment: path,
                    name: 'storage.txt'
                }],
            });

            await interaction.editReply({
                content:`Sent Message`,
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