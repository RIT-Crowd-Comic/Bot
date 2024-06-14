const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const {
    startQueue, endQueue, getQueues, changeRole
} = require('../../utils/availability.js');
const { deleteWholeQueue } = require('../../database');
dayjs.extend(utc);


const checkQueues = async (client) => {
    const today = dayjs();

    if (today.hour() == 0 && today.minute() == 1) {

        await deleteWholeQueue('unavailable').then(async ()=>{ await deleteWholeQueue('unavailable').then(()=>{ getQueues('./src/savedAvailability.json'); }); });

    }

    // Check to add role
    if ((startQueue.length > 0 && startQueue[0].hour <= today.hour()) || (endQueue.length > 0 && endQueue[0].hour >= today.hour())) {
        if (endQueue[0]?.min <= today.minute() || endQueue[0]?.hour < today.hour()) {
            changeRole(client, endQueue[0].id, false); // Remove unavailable role from user
            // Move both start and end queue values for this unavailable slot
            endQueue.shift();
            startQueue.shift();
        }
        if (startQueue[0]?.min >= today.minute() || (today.minute() >= startQueue[0]?.min && today.minute() <= endQueue[0]?.min) || startQueue[0]?.hour > today.hour())
            changeRole(client, startQueue[0].id, true); // Give user the unavailable role

    }
};

module.exports = (client) =>{

    getQueues();

    try {
        setInterval(()=>{ checkQueues(client); }, 20 * 1000);// check every 20 seconds

    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
};
