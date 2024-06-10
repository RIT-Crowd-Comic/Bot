const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const {startQueue, endQueue, getQueues, changeRole} = require('../../utils/availability.js');
dayjs.extend(utc);


const checkQueues = (client) => {
    const today = dayjs.utc();

    if (today.hour() == 0 && today.minute() == 1) {
        getQueues('./src/savedAvailability.json');
    }
    //Check to add role
    while ((startQueue.length > 0 && startQueue[0].hour <= today.hour())|| (endQueue.length > 0 && endQueue[0].hour <= today.hour())){
        if(endQueue[0]?.min <= today.minute() || endQueue[0]?.hour < today.hour()){
            changeRole(client, endQueue[0].id, false); //Remove unavailable role from user
            endQueue.shift();
        }
        else if(startQueue[0]?.min <= today.minute() || startQueue[0]?.hour < today.hour()){
            changeRole(client, startQueue[0].id, true); //Give user the unavailable role
            startQueue.shift();
        }
        else { break; }
    }
};

module.exports = (client) =>{

    getQueues('./src/savedAvailability.json');

    try {
        setInterval(()=>{ checkQueues(client); }, 20 * 1000);// check every 20 seconds

    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
};