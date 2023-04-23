import cron from "node-cron";
import "./model/database.js";
import { Campaign } from "./model/campaign.js";
import { Member } from "./model/member.js";
import { sendToS3 } from "./util/upload.js";
import { REGISTERED, PROCESSING } from "./statusConstant.js";
import * as q from "./util/queue.js";

const MIN = 1000 * 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// DB 取出此時間範圍內該發送的 campaign & 對象名單
const getList = async () => {
    let now = new Date(); // UTC+0 time
    let prev = now - 1.5 * MIN;
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
                    localField: "segmentId",
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

        // list = 要做的campaign + segment query. 依據 query 篩出對應的 email
        // TODO: 其他推播類型不用拿 email
        const campaignsWithSeg = list.map(async (campaign) => {
            const query = campaign.segment.query;
            const emails = await Member.find(query, { _id: 0, email: 1 });
            // campaign 多一個 key-value 紀錄符合的 emails(db 取出是 array of objs, map 整理成 array )
            campaign.emails = emails.map((item) => item.email);
            return campaign;
        });
        return Promise.all(campaignsWithSeg);
    } catch (e) {
        console.error(e);
    }
};

const findLastestJob = (jobs, targetTime) => {
    const jobLen = jobs.length;
    // 從後面找
    for (let i = jobLen - 1; i >= 0; i--) {
        if (jobs[i].send_time.getTime() == targetTime.getTime()) {
            return [i, jobs[i]];
        }
    }
    return [Null, Null];
};

const updateStatus = async (record, idx, totalCount, emailKeys) => {
    const filter = { _id: record._id };
    record.jobs[idx].status = PROCESSING;
    record.jobs[idx].total_count = totalCount;
    record.jobs[idx].email_keys = emailKeys;

    const update = [
        {
            $set: {
                bucket: record.bucket,
                jobs: record.jobs,
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
        // return;
    }
    // send bucketName, objKey, message to SQS
    try {
        for (let record of records) {
            const campaignName = record.name;
            const parsedEmail = JSON.parse(JSON.stringify(record.emails));
            const totalCount = parsedEmail.length;
            const [lastestIdx, lastestJob] = findLastestJob(record.jobs, record.next_send_time);
            if (!lastestIdx || !lastestJob) {
                console.error(`[${new Date().toISOString()}] There is a registered campaign without jobs.`);
                return;
            }
            const jobId = lastestJob._id;

            // divide receivers into smaller pack and sent to SQS
            let i = 0;
            const BATCH_SIZE = 5;
            let msgStatuses = [];
            let emailKeys = [];
            while (i * BATCH_SIZE < totalCount) {
                let emails = JSON.stringify(parsedEmail.slice(i, i + BATCH_SIZE));
                let [bucket, emailKey] = await sendToS3(emails, campaignName, i);

                const msg = {
                    _id: record._id + "_" + i,
                    job_id: jobId,
                    message_variant: record["message_variant"][0],
                    bucket,
                    emailKey,
                    totalCount,
                };
                console.log(`msg._id(${i}):`, msg._id);
                record.bucket = bucket;

                const msgStatus = await q.sendMessage(msg);
                msgStatuses.push(msgStatus);
                emailKeys.push(emailKey);
                i += 1;
            }

            // update status of sent to SQS
            const hasAllSent = msgStatuses.every((msgStatus) => msgStatus.$metadata.httpStatusCode == 200);

            if (hasAllSent) {
                updateStatus(record, lastestIdx, totalCount, emailKeys);
            } else {
                console.log("send to SQS failed");
                record.msgStatus = "failed";
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
