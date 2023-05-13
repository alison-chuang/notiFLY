import cron from "node-cron";
import "./util/database_connection.js";
import { Campaign } from "./server/model/campaign.js";
import { REGISTERED, RUNNING, REGISTER_RANGE } from "./cron_constant.js";

const MIN = 1000 * 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const getDate = (date) => {
    return new Date(date.toISOString().split("T")[0]);
};

const addMins = (date, numOfMins) => {
    return new Date(date.getTime() + numOfMins * MIN);
};

const addDays = (date, numOfDays) => {
    return new Date(date.getTime() + numOfDays * DAY);
};

const registerJobs = async () => {
    let now = new Date(); // now => object, UTC+0 time
    let nowPlusRange = addMins(now, REGISTER_RANGE);
    const cond = { $gte: now, $lt: nowPlusRange };
    console.log("condition:", cond);
    try {
        const list = await Campaign.find({
            status: RUNNING,
            $and: [
                { end_time: { $gte: now } },
                {
                    $or: [
                        { next_send_time: cond },
                        /* send_time 在這個區間，應該是第一次發送情形（）send_time = next_send_time，所以要把他更新 next_send_time並註冊到job */
                        /* next_send_time 在這個區間，表示要註冊到job
                        /* next_send_time 意義：cron_job要看
                        send_time 意義：要留起始日期資料 
                        jobs["send_time"] 意義：留下每次發送的紀錄*/
                    ],
                },
            ],
        });
        if (list.length == 0) {
            console.log(`[${new Date().toISOString()}] There is no task for now.`);
            return;
        }
        console.log("length of list:", list.length);
        const updates = list.map(async (item) => {
            let filter = { _id: item._id };
            let updated = {};

            //如果不是第一次發送，jobs 裡會有之前註冊過的job，要用最後一個job加上interval = next_send_time
            if (item.jobs.length != 0) {
                let nextSendTime;
                nextSendTime = addDays(item.jobs[item.jobs.length - 1].send_time, item.interval);
            }

            // 組裝 mongoose systax
            updated.$push = { jobs: { send_time: nextSendTime } };
            updated.$set = { status: REGISTERED, next_send_time: nextSendTime };
            console.log(updated);

            return Campaign.findOneAndUpdate(filter, updated, { new: true });
        });
        // 非同步 map => array of promises, 要 await Promise.all
        const results = await Promise.all(updates);
        console.log("await results", results);
    } catch (e) {
        console.error(e);
    }
};

cron.schedule("*/4 * * * *", async () => {
    console.log("cron register jobs starts.");
    registerJobs();
});
