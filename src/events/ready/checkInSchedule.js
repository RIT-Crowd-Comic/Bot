const dayjs = require('dayjs');
const utc=require('dayjs/plugin/utc');
const weekday = require('dayjs/plugin/weekday');
const timezone=require('dayjs/plugin/timezone');
const { fakeScheduleEntry } = require('../../commands/dailyCheckIn/scheduleCheckIn');
const { queue,sendMessage } = require('../../utils/schedule');
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(timezone);


let scheduleData=fakeScheduleEntry
// let scheduleData={
//     '483485649198907393': {
//         "id": '483485649198907393',
//         "tag": ".kitkatqueen",
//         "schedules": [
//             {
//                 "utcDays": ["monday","friday"],
//                 "utcTime": [ 4,0],
//             },
//             {
//                 "utcDays": ["tuesday","thursday"],
//                 "utcTime": [ 9,4],
//             },
//             {
//                 "utcDays": ["monday","friday"],
//                 "utcTime": [ 23,50],
//             },
//         ]
//     },
    // "405162577673453569": {
    //     "id": "405162577673453569",
    //     "tag": ".moister_oyster",
    //     "schedules": [
    //         {
    //             "utcDays": ["monday","wednesday"],
    //             "utcTime": [ 19,0],
    //         },
    //         {
    //             "utcDays": ["tuesday","thursday"],
    //             "utcTime": [ 15,0],
    //          }
    //     ]
    // }
// };

let structuredTimes={};

/**
 * gets the current day's scheduled times & users
 * orders them chronologically in the queue[]
 * @param {*} day 
 */
const getDayOrder=(day)=>{
    let times=[];

    /**
    * checks to see if users have a scheduled day today
    * creates and adds a user object with the time to the times array
    */
    for(let user in scheduleData){
        for(let schedule of scheduleData[user].schedules){
          if(schedule.utcDays.includes(day)){
            times.push({
                id:user,
                hour:schedule.utcTime[0],
                min:schedule.utcTime[1]
            });
          }
        }
      }
    
    /**
     * runs through the times array and creates an object with unique times
     * this orders them in chronological order in the structuredTimes object
    */
    for(let t of times){
        if(t.hour in structuredTimes){
            if(t.min in structuredTimes[t.hour]){
                structuredTimes[t.hour][t.min].push(t);
            }else{
                structuredTimes[t.hour][t.min]=[t];
            }
        }else{
            structuredTimes[t.hour]={[t.min]:[t]};
        }
    }
    
    /**
     * takes all of the values in structured times object 
     * => adds it to the queue
    */
    for(let h in structuredTimes){
        for(let m in structuredTimes[h]){
            structuredTimes[h][m].forEach((reminder)=>{
                queue.push(reminder);
            });
        }
    }
    console.log(queue)
};


/**
 * gets the current utc day of week number
 * converts number to name of day
 * @returns current utc day of the week
 */
const checkCurrentDay=()=>{
    const now=dayjs.utc();//.format()
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']; 
    const currentDayOfWeek = daysOfWeek[now.weekday()];
    return(currentDayOfWeek);
};
/**
 * creates a new queue
 */
const getQueue=()=>{
    getDayOrder(checkCurrentDay());
};
/**
 * checks the first item in the day's queue to see if the time has passed or is the current time
 * remover the reminder from the queue
 * keep doing this until all past and current reminders have been sent
 * @param {*} client 
 */
const checkList=(client)=>{

    const today=dayjs.utc();

    if(today.hour()==0&&today.minute()==1){
        getQueue();
    }
    while(queue.length>0&&queue[0].hour<=today.hour()){
        if(queue[0].min<=today.minute()||queue[0].hour<today.hour()){
            sendMessage(client,queue[0].id); //send dm reminder message
            console.log(`reminder for `);
            console.log(queue[0].id);
            queue.shift();
        }else{break;}
    }
    
};


module.exports = (client) =>{

    getQueue();

    try{
        setInterval(()=>{checkList(client);},20*1000);//check every 20 seconds
        
    }catch(error){
        console.log(`There was an error: ${error}`);
    }
}
    
