const { Dayjs } = require('dayjs');
const fs = require('fs');
const dayjs = require('dayjs');
const availability = require('../commands/availability/availability');

let availabilityChannel = undefined;
const getAvailabilityChannel = async () => { return availabilityChannel; };
const setAvailabilityChannel = (channel) => { availabilityChannel = channel; };

const saveUnavailability = (userId, userTag, unavail, path) => {
    //Get saved data from file and turn into array with objects
    let fileContent = fs.readFile(path);
    fileContent = JSON.parse(fileContent);
    
    let savedIndex = -1;
    //Check if array contains the user already
    for(let i = 0, length=fileContent.length; i<length; i++ )
    {
        if(fileContent[i].userId == userId) {
            savedIndex = i;
            continue;
        }
    }

    if(savedIndex!=-1)
        fileContent[savedIndex].unavailable.push(unavail);
    else{
        fileContent.push(newAvailabilityEntry(userId, userTag));
        fileContent[fileContent.length-1].unavailable.push(unavail);
    }

    //Send data back to file
    fs.writeFile(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));
};

const newAvailabilityEntry = (userId, userTag) => {
    return {
        userId: userId,
        userTag: userTag,
        available: {
            from: dayjs('09:00').format('hh:mm'),
            to: dayjs('17:00').format('hh:mm'),
            days: 'Monday-Friday'
        },
        unavailable: []
    };
};

module.exports = {
    getAvailabilityChannel,
    setAvailabilityChannel,
    saveUnavailability,
    newAvailabilityEntry
};