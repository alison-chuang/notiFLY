import cron from "node-cron";
import "./model/database.js";
import { Campaign } from "./model/campaign.js";
import { Segment } from "./model/segment.js";
import { sendToS3 } from "./util/upload.js";
import * as q from "./util/queue.js";

const MIN = 1000 * 60;
const DAY = 1440 * MIN;
const getList = async () => {
    let now = new Date();
    let prev = now - 1 * DAY;
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
            // @campaigns to lookup members collection
            {
                $lookup: {
                    from: "members",
                    localField: "company",
                    foreignField: "company",
                    pipeline: [
                        {
                            // TODO 應會有更多 filter 條件，目前只有會員 created date
                            $match: {
                                "list.created_at": {
                                    $gte: "$segment.query.created_at.$gte",
                                    // $lte: "$segment.query.created_at.$lte", // 加了就找不到了
                                },
                            },
                        },
                        // pick up column
                        {
                            $project: {
                                _id: 0,
                                emails: {
                                    $map: {
                                        input: "$list",
                                        as: "item",
                                        in: "$$item.email",
                                    },
                                },
                            },
                        },
                    ],
                    as: "info",
                },
            },

            // unwind the members array, 可以把key拿掉
            { $unwind: "$info" },
        ]);
        console.log("length of list:", list.length);
        // console.log("list:", list);
        // console.log("query:", list[0].segment.query);
        // console.log("emails:", list[0].info.emails);
        return list;
    } catch (e) {
        console.error(e);
    }
};

// update campaign status: saved => processing
// save bucketName objKey to db
const updateStatus = async (record) => {
    const filter = { _id: record._id };
    const update = [{ $set: { status: "processing", bucket: record.bucket, emailKey: record.emailKey } }];
    const doc = await Campaign.findOneAndUpdate(filter, update, {
        new: true,
    });
    console.log("updated doc:", doc);
};

const main = async () => {
    // mongodb 篩選名單
    const records = await getList();
    if (records.length == 0) {
        console.log(`[${new Date().toISOString()}] There is no task for now.`);
        // return;
    }
    // send bucketName, objKey, messageto SQS
    try {
        for (let record of records) {
            const jsonInfo = JSON.stringify(record.info.emails);
            const campaignName = record.name;
            let [bucket, emailKey] = await sendToS3(jsonInfo, campaignName);

            const msg = {
                _id: record._id,
                message_variant: record["message_variant"][0],
                bucket,
                emailKey,
            };
            console.log({ msg });

            record.bucket = bucket;
            record.emailKey = emailKey;

            const msgStatus = await q.sendMessage(msg);
            console.log({ msgStatus });

            // SQS update sending status
            if (msgStatus.$metadata.httpStatusCode == 200) {
                record.msgStatus = "processing";
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

main();

// 每分鐘去資料庫 取出 match 當下時間的 campaign document + member info
// cron.schedule(`* * * * *`, async () => {
//     console.log(`cron started.`);
//     main();
// });
