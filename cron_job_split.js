import cron from "node-cron";
import "./model/database.js";
import { Campaign } from "./model/campaign.js";
import { Member } from "./model/member.js";
import { Segment } from "./model/segment.js";
import { sendToS3 } from "./util/upload.js";
import * as q from "./util/queue.js";

const MIN = 1000 * 60;
const DAY = 1440 * MIN;
const getList = async () => {
    let now = new Date();
    let prev = now - DAY;
    console.log("prev:", new Date(prev), "now:", new Date(now));
    try {
        const list = await Campaign.aggregate([
            {
                $match: {
                    sendDate: { $gte: new Date(prev), $lt: new Date(now) },
                    status: { $eq: "launched" },
                },
            },
            // @campaigns to lookup segments collection
            {
                $lookup: {
                    from: "segments",
                    localField: "segmentId",
                    foreignField: "_id",
                    pipeline: [
                        // pick up column
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
            // // @campaigns to lookup members collection
            // {
            //     $lookup: {
            //         from: "members",
            //         let: {
            //             gte: "$segment.query.created_at.gte",
            //             lt: "$segment.query.created_at.lt",
            //         },
            //         pipeline: [
            //             {
            //                 // TODO 應會有更多 filter 條件，目前只有會員 created date
            //                 $match: {
            //                     $expr: {
            //                         $and: [{ $gte: ["$created_at", "$$gte"] }, { $lt: ["$created_at", "$$lt"] }],
            //                     },
            //                 },
            //             },
            //             // pick up column
            //             {
            //                 $project: {
            //                     _id: 0,
            //                     email: 1,
            //                 },
            //             },
            //         ],
            //         as: "members",
            //     },
            // },
        ]);
        console.log("length of list:", list.length);
        // list.map((doc) => {
        //     doc.emails = doc.members.map((member) => member.email);
        //     delete doc.members;
        //     return doc;
        // });
        const segmented = list.map(async (item) => {
            const query = item.segment.query;
            console.log(query);
            const emails = await Member.find(query, { _id: 0, email: 1 });
            item.emails = emails.map((item) => item.email);
            console.log(emails);
            return item;
        });
        return segmented;
    } catch (e) {
        console.error(e);
    }
};

// update campaign status: saved => processing
// save bucketName objKey to db
const updateStatus = async (record) => {
    const filter = { _id: record._id };
    const update = [
        {
            $set: {
                status: "processing",
                bucket: record.bucket,
                emailKey: record.emailKey,
                total_count: record.total_count,
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
            const jsonInfo = JSON.stringify(record.emails);
            const campaignName = record.name;
            const parsedEmail = JSON.parse(jsonInfo);
            const totalCount = parsedEmail.length;

            // divide receivers into smaller pack and sent to SQS
            let i = 0;
            const BATCH_SIZE = 1;
            let msgStatuses = [];
            let emailKeys = [];
            while (i * BATCH_SIZE < totalCount) {
                let emails = JSON.stringify(parsedEmail.slice(i, i + BATCH_SIZE));
                let [bucket, emailKey] = await sendToS3(emails, campaignName, i);

                const msg = {
                    _id: record._id + "_" + i,
                    message_variant: record["message_variant"][0],
                    bucket,
                    emailKey,
                    totalCount,
                };
                console.log(`msg._id(${i}):`, msg._id);
                record.bucket = bucket;

                const msgStatus = await q.sendMessage(msg);
                msgStatuses.push(msgStatus);
                i += 1;
                emailKeys.push(emailKey);
            }

            // update status of sent to SQS
            const hasAllSent = msgStatuses.every((msgStatus) => msgStatus.$metadata.httpStatusCode == 200);

            if (hasAllSent) {
                record.total_count = totalCount;
                record.msgStatus = "processing";
                record.emailKey = emailKeys; // array
                updateStatus(record);
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
getList();

// 每分鐘去資料庫 取出 match 當下時間的 campaign document + member info
// cron.schedule(`* * * * *`, async () => {
//     console.log(`cron started.`);
//     main();
// });
