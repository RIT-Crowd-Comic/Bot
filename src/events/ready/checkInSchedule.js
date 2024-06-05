const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const weekday = require('dayjs/plugin/weekday');
const timezone = require('dayjs/plugin/timezone');
const { queue, sendCheckInReminder, getQueue } = require('../../utils/schedule');
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(timezone);



/**
 * checks the first item in the day's queue to see if the time has passed or is the current time
 * remover the reminder from the queue
 * keep doing this until all past and current reminders have been sent
 * @param {*} client 
 */
const checkList = (client)=>{

    const today = dayjs.utc();

    if (today.hour() == 0 && today.minute() == 1) {
        getQueue();
    }
    while (queue.length > 0 && queue[0].hour <= today.hour()) {
        if (queue[0].min <= today.minute() || queue[0].hour < today.hour()) {
            sendCheckInReminder(client, queue[0].id); // send dm reminder message
            queue.shift();
        }
        else { break; }
    }

};


module.exports = (client) =>{

    getQueue();

    try {
        setInterval(()=>{ checkList(client); }, 20 * 1000);// check every 20 seconds

    }
    catch (error) {
        console.log(`There was an error: ${error}`);
    }
};

