const {Client} = require('discord.js');
const dayjs = require('dayjs')
const utc=require('dayjs/plugin/utc')
const weekday = require('dayjs/plugin/weekday')
// const duration=require('dayjs/plugin/duration')
const timezone=require('dayjs/plugin/timezone')
const { fakeCheckupDatabase } = require("../../commands/dailyCheckup/checkupInterface");
dayjs.extend(utc)
dayjs.extend(weekday)
// dayjs.extend(duration)
dayjs.extend(timezone)

let scheduleData={
    "Monday":{
        405162577673453569:{//A ID
            "time":[12,15]
        },
        483485649198907393:{//v ID
            "time":[12,15]
        }
    },
    "Tuesday":{
        405162577673453569:{//A ID
            "time":[9,15]
        },
        483485649198907393:{//v ID
            "time":[9,0]
        }
    },
    "Wednesday":{
        405162577673453569:{//A ID
            "time":[9,15]
        },
        483485649198907393:{//v ID
            "time":[17,10]
        }
    },
    "Thursday":{
        483485649198907393:{//V ID
            "time":[9,15]
        },
        483485649198907393:{//v ID
            "time":[14,20]
        }
    },
}
let cue=[]//cue of day's reminders


const getDayOrder=(day)=>{
    let times=[]
    let structuredTimes={}

    for(let user in scheduleData[day]){
        u=scheduleData[day][user]
        // console.log(`user ${u}`)
        times.push({
            id:user,
            hour:u.time[0],
            min:u.time[1]
        })
    }
    

    for(let t of times){
        if(t.hour in structuredTimes){
        if(t.min in structuredTimes[t.hour]){
            structuredTimes[t.hour][t.min].push(t)
        }else{
            structuredTimes[t.hour][t.min]=[t]
        }
        }else{
        structuredTimes[t.hour]={[t.min]:[t]}
        }
    }
    
    for(let h in structuredTimes){
        for(let m in structuredTimes[h]){
        structuredTimes[h][m].forEach((reminder)=>{
            cue.push(reminder)
        })
        }
    }
    
}

const sendMessage=async (client,id)=>{
    // const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"] });
    console.log("client guilds")
    console.log(client.guilds)
    const user = await client.users.cache.get(id);
    console.log("\nclient.user")
    console.log(user)
    user.send("This is a DM!");

}

const checkCurrentDay=()=>{
    const now=dayjs.utc()//.format()
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; 
    const currentDayOfWeek = daysOfWeek[now.weekday()];
    return(currentDayOfWeek)
}

const getCue=()=>{
    getDayOrder(checkCurrentDay())
}

const checkList=(client)=>{
    const today=dayjs.utc()

    if(today.hour()==0&&today.minute()==1){
        getCue()
    }
    while(cue.length>0&&cue[0].hour<=today.hour()){
        if(cue[0].min<=today.minute()||cue[0].hour<today.hour()){
            sendMessage(client,cue[0].id) //send dm reminder message
            console.log(`reminder for `)
            console.log(cue[0].id)
            cue.shift()
        }else{break}
    }
    
}


module.exports =  (client) =>{

    console.log(`current day: ${checkCurrentDay()}`)
    console.log(client.users)
    getCue()

    try{

        setInterval(()=>{checkList(client)},10*1000)//check every minute
         
    }catch(error){
        console.log(`There was an error: ${error}`);
    }
};
