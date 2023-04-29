import dotenv from "dotenv";
dotenv.config();
import cron from "node-cron";
import "./model/database.js";
import { Campaign } from "./model/campaign.js";
import { Member } from "./model/member.js";
import { sendToS3 } from "./util/upload.js";
import { REGISTERED, PROCESSING, FAILED } from "./statusConstant.js";
import * as q from "./util/queue.js";

const MIN = 1000 * 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const addDays = (date, numOfDays) => {
    return new Date(date.getTime() + numOfDays * DAY);
};
const fieldMap = {
    edm: "email",
    webpush: "subscription",
};

// DB 取出此時間範圍內該發送的 campaign & 對象名單
const getList = async () => {
    let now = new Date(); // UTC+0 time
    // let prev = now - 1.5 * MIN;
    let prev = now - 10 * MIN;
    console.log("prev:", new Date(prev), "now:", new Date(now));

    try {
        // 拿出每個 campaign 對應的 segment query
        const list = await Campaign.aggregate([
            {
                $match: {
                    next_send_time: { $gte: new Date(prev), $lt: new Date(now) },
                    status: { $eq: REGISTERED },
                },
            },
            {
                $lookup: {
                    from: "segments",
                    localField: "segment_id",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                query: 1,
                            },
                        },
                    ],
                    as: "segment",
                },
            },
            { $unwind: "$segment" },
        ]);
        // console.log(list);
        console.log("length of list:", list.length);

        // list = 要做的campaign + segment query. 依據 query 篩出對應的 email / push subscription
        const campaignsWithSeg = list.map(async (campaign) => {
            const field = fieldMap[campaign.channel];
            const query = campaign.segment.query;

            const leads = await Member.find(query, { _id: 0, [field]: 1 });
            campaign.leads = leads.map((item) => item[field]);

            return campaign;
        });
        return Promise.all(campaignsWithSeg);
    } catch (e) {
        console.error(e);
        return [];
    }
};

const findLatestJob = (jobs, targetTime) => {
    const jobLen = jobs.length;
    // 從後面找
    for (let i = jobLen - 1; i >= 0; i--) {
        if (jobs[i].send_time.getTime() == targetTime.getTime()) {
            return [i, jobs[i]];
        }
    }
    return [null, null];
};

const updateStatusAndNext = async (record, idx, totalCount, s3fileNames, status) => {
    const filter = { _id: record._id };

    const nextSendTime = addDays(record.send_time, record.interval);

    record.jobs[idx].total_count = totalCount;
    record.jobs[idx].s3fileNames = s3fileNames;
    record.jobs[idx].status = status;

    const update = [
        {
            $set: {
                jobs: record.jobs,
                bucket: record.bucket,
                next_send_time: nextSendTime,
            },
        },
    ];
    const doc = await Campaign.findOneAndUpdate(filter, update, { new: true });
    console.log("updated doc:", doc);
};

const main = async () => {
    // mongodb 篩選名單
    const records = await getList();

    if (records.length == 0) {
        console.log(`[${new Date().toISOString()}] There is no task for now.`);
    }

    // send bucketName, objKey, message to SQS
    try {
        for (let record of records) {
            console.log(record);
            // register worker 錯誤處理
            const [latestIdx, latestJob] = findLatestJob(record.jobs, record.next_send_time);
            if (latestIdx == null || !latestJob) {
                console.error(`[${new Date().toISOString()}] There is a registered campaign without jobs.`);
                return;
            }

            // divide receivers into smaller pack to send to s3
            // send campaign info(message))to SQS
            const jobId = latestJob._id;
            const campaignName = record.name;

            let totalCount;
            let parsedLead;
            if (record.leads) {
                parsedLead = JSON.parse(JSON.stringify(record.leads));
                totalCount = parsedLead.length;
            } else {
                console.error("Invalid record: no lead data found.");
            }

            let i = 0;
            const BATCH_SIZE = 1;
            let msgStatuses = [];
            let s3fileNames = [];
            while (i * BATCH_SIZE < totalCount) {
                let leads = JSON.stringify(parsedLead.slice(i, i + BATCH_SIZE));
                let [bucket, s3fileName] = await sendToS3(leads, campaignName, i);

                const msg = {
                    _id: record._id + "_" + i,
                    job_id: jobId,
                    message_variant: record["message_variant"][0],
                    bucket,
                    s3fileName,
                    totalCount,
                };
                console.log(`msg._id(${i}):`, msg._id);
                record.bucket = bucket;

                // 選擇要送到哪一個 SQS
                const sqsMap = {
                    edm: process.env.EDM_SQS_URL,
                    webpush: process.env.WEB_PUSH_SQS_URL,
                };

                const sqsURL = sqsMap[record.channel];
                console.log(record.channel);
                console.log({ sqsURL });

                if (!sqsURL) {
                    console.error("Do not match any SQS URL.");
                    return;
                }

                const msgStatus = await q.sendMessage(msg, sqsURL);
                msgStatuses.push(msgStatus);
                s3fileNames.push(s3fileName);
                i += 1;
            }

            // update status of sending campiagns to SQS
            // launched => processing, or failed
            const hasAllSent = msgStatuses.every((msgStatus) => msgStatus.$metadata.httpStatusCode == 200);
            if (hasAllSent) {
                updateStatusAndNext(record, latestIdx, totalCount, s3fileNames, PROCESSING);
            } else {
                console.error("send to SQS failed");
                updateStatusAndNext(record, latestIdx, totalCount, s3fileNames, FAILED);
            }
        }
    } catch (e) {
        console.error(e);
    }
};

// main();

cron.schedule(`* * * * *`, async () => {
    console.log(`cron started.`);
    main();
});

const oldmain = async () => {
    // mongodb 篩選名單
    const records = await getList();

    if (records.length == 0) {
        console.log(`[${new Date().toISOString()}] There is no task for now.`);
    }

    // send bucketName, objKey, message to SQS
    try {
        for (let record of records) {
            // register worker 錯誤處理
            const [latestIdx, latestJob] = findLatestJob(record.jobs, record.next_send_time);
            if (latestIdx == null || !latestJob) {
                console.error(`[${new Date().toISOString()}] There is a registered campaign without jobs.`);
                return;
            }

            // divide receivers into smaller pack to send to s3
            // send campaign info(message))to SQS
            const jobId = latestJob._id;
            const campaignName = record.name;
            const parsedEmail = JSON.parse(JSON.stringify(record.emails));
            const totalCount = parsedEmail.length;

            let i = 0;
            const BATCH_SIZE = 1;
            let msgStatuses = [];
            let s3fileNames = [];
            while (i * BATCH_SIZE < totalCount) {
                let emails = JSON.stringify(parsedEmail.slice(i, i + BATCH_SIZE));
                let [bucket, s3fileName] = await sendToS3(emails, campaignName, i);

                const msg = {
                    _id: record._id + "_" + i,
                    job_id: jobId,
                    message_variant: record["message_variant"][0],
                    bucket,
                    s3fileName,
                    totalCount,
                };
                console.log(`msg._id(${i}):`, msg._id);
                record.bucket = bucket;

                const msgStatus = await q.sendMessage(msg);
                msgStatuses.push(msgStatus);
                s3fileNames.push(s3fileName);
                i += 1;
            }

            // update status of sending campiagns to SQS
            // launched => processing, or failed
            const hasAllSent = msgStatuses.every((msgStatus) => msgStatus.$metadata.httpStatusCode == 200);
            if (hasAllSent) {
                updateStatus(record, latestIdx, totalCount, s3fileNames, PROCESSING);
            } else {
                console.error("send to SQS failed");
                updateStatus(record, latestIdx, totalCount, s3fileNames, FAILED);
            }
        }
    } catch (e) {
        console.error(e);
    }
};
