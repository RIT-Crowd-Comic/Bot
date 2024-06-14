const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const weekday = require('dayjs/plugin/weekday');
const timezone = require('dayjs/plugin/timezone');
const {
    queue, sendCheckInReminder, getQueue, getDayOrder
} = require('../../utils/schedule');
const { deleteWholeQueue } = require('../../database');
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(timezone);


/**
 * Runs through the queue
 * if the first item in the queue has passed or is the current time
 * then it will send the reminder and remove from the queue
 */
const checkQueue = (client, day)=>{
    while (queue.length > 0 && queue[0].hour <= day.hour()) {
        if (queue[0].min <= day.minute() || queue[0].hour < day.hour()) {
            sendCheckInReminder(client, queue[0].id); // send dm reminder message
            queue.shift();
        }
        else { break; }
    }
};

/**
 * checks the first item in the day's queue to see if the time has passed or is the current time
 * remover the reminder from the queue
 * keep doing this until all past and current reminders have been sent
 * @param {*} client 
 */
const checkList = async (client)=>{

    const today = dayjs.utc();

    if (today.hour() == 0 && today.minute() == 1) {
        await deleteWholeQueue().then(async()=>{ await getDayOrder().then(()=>{ checkQueue(client, today); }); });

    }
    else {
        checkQueue(client, today);
    }


};


module.exports = async(client) =>{

    await getQueue();

    try {
        setInterval(async ()=>{ checkList(client); }, 20 * 1000);// check every 20 seconds

    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
};

