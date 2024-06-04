const { Dayjs } = require('dayjs');
const fs = require('fs');
const dayjs = require('dayjs');
const availability = require('../commands/availability/availability');

let availabilityChannel = undefined;
const getAvailabilityChannel = async () => { return availabilityChannel; };
const setAvailabilityChannel = (channel) => { availabilityChannel = channel; };

const saveUnavailability = (userId, userTag, unavail, path) => {
    //Get saved data from file and turn into array with objects
    let fileContent = null;
    fileContent = loadAvailability(path);
    
    const userIndex = getUserIndex(fileContent.data, userId);

    if(userIndex!=-1)
        fileContent.data[userIndex].unavailable.push(unavail);
    else{
        fileContent.data.push(newAvailabilityEntry(userId, userTag));
        fileContent.data[fileContent.data.length-1].unavailable.push(unavail);
    }

    //Send data back to file
    fs.writeFile(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));
};

const saveAvailability = (userId, userTag, avail, path) => {
    let fileContent = null;
    fileContent = loadAvailability(path);

    const userIndex = getUserIndex(fileContent.data, userId);

    if(userIndex!=-1)
        fileContent.data[userIndex].available = avail;
    else{
        fileContent.data.push(newAvailabilityEntry(userId, userTag));
        fileContent.data.availabile = avail;
    }

    //Send data back to file
    fs.writeFile(path, JSON.stringify(fileContent, null, 2), (err) => err && console.error(err));
}

const newAvailabilityEntry = (userId, userTag) => {
    return {
        userId: userId,
        userTag: userTag,
        available: {
            //Random day used for object creation, has no effect on result
            from: dayjs('6-4 09:00').format('hh:mm A'),
            to: dayjs('6-4 17:00').format('hh:mm A'),
            days: 'Monday-Friday'
        },
        unavailable: []
    };
};

const loadAvailability = (path) => {
    let data = fs.readFileSync(path, {encoding: 'utf8'});
    data = JSON.parse(data);
    return data;
}

//Get the index of the user in the data
const getUserIndex = (fileData, userId) => {
    for(let i = 0, length=fileData?.length; i<length; i++ )
    {
        if(fileData[i].userId == userId) {
            return i;
        }
    }
    return -1;
}

module.exports = {
    getAvailabilityChannel,
    setAvailabilityChannel,
    saveUnavailability,
    saveAvailability,
    newAvailabilityEntry,
    loadAvailability,
    getUserIndex
};