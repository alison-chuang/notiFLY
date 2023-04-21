import cron from "node-cron";
import "./model/database.js";
import { Campaign } from "./model/campaign.js";
import { Member } from "./model/member.js";
import { Segment } from "./model/segment.js";
import { sendToS3 } from "./util/upload.js";
import * as q from "./util/queue.js";

const MIN = 1000 * 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const getDate = (date) => {
    return new Date(date.toISOString().split("T")[0]);
};

const addHours = (date, numOfHours) => {
    return new Date(date.getTime() + numOfHours * HOUR);
};

const getList = async () => {
    let now = new Date(new Date().toISOString());
    console.log(now);
    let isAm = now.getUTCHours() < 12;
    // 下午了就要跨日
    let nextTime = isAm ? addHours(getDate(now), 12) : addHours(getDate(now), 24);
    let nextTimePlus12 = addHours(nextTime, 12);
    console.log("gte:", nextTime, "lt:", nextTimePlus12);
    try {
        const list = await Campaign.find({
            status: "running",
            $or: [
                { next_send_time: { $gte: nextTime, $lt: nextTimePlus12 } },
                { send_time: { $gte: nextTime, $lt: nextTimePlus12 } },
            ],
        });
        console.log("length of list:", list.length);
        const updates = list.map(async (item) => {
            let filter = { _id: item._id };
            let updated = {};
            let nextSendTime = item.send_time;
            if (item.jobs.length != 0) {
                nextSendTime = addDays(item.jobs[item.jobs.length - 1].send_time, item.interval);
            }
            updated.$push = { jobs: { send_time: nextSendTime } };
            updated.$set = { next_send_time: nextSendTime };
            console.log(updated);
            return Campaign.findOneAndUpdate(filter, updated, { new: true });
        });
        const results = await Promise.all(updates);
        console.log(results);
    } catch (e) {
        console.error(e);
    }
};
