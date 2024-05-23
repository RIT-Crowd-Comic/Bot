const fs = require('fs');
const path = require('path');

//gets all the files within a specified directory, foldersonly makes it only return folders
module.exports = (directory, foldersOnly = false) => {
    let fileNames = [];

    //get files within a dir
    const files = fs.readdirSync(directory, {withFileTypes: true});

    //check if file or folder
    for (const file of files){
        const filePath = path.join(directory, file.name);

        //folders only
        if(foldersOnly){
            //add to filenames
            if(file.isDirectory()){
                fileNames.push(filePath);
            }
        }
        //files
        else{
            //add to filenames
            if(file.isFile()){
                fileNames.push(filePath);
            }
        }
    }

    return fileNames;
}