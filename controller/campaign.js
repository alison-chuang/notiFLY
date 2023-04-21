import { generateImageURL, selectS3Images } from "../util/upload.js";
import "../model/database.js";
import { Campaign, updateCounts, checkRequest } from "../model/campaign.js";
import { selectSegmentNames } from "../model/segment.js";

// get presigned URL for client uploading image
const getS3Url = async (req, res) => {
    const url = await generateImageURL();
    console.log({ url });
    res.send({ url });
};

// save campaign info to db
const postCampaigns = async (req, res) => {
    console.log("req.body", req.body);
    // TODO 後端要做資料驗證 xss attack
    // TODO 時區問題（收local, 但 mongodb UTC 0 , 但cron_job拿也是 UTC 0 )
    const { name, segmentId, channel, subject, type, sendDate, htmlContent } = req.body;

    const data = {
        name,
        sendDate,
        local_sendDate: sendDate.toLocaleString(),
        segmentId,
        channel,
        recursive: {
            is_recursive: isRecursive,
        },
        message_variant: {
            source: "alison.mjchuang@gmail.com", // hard code for now
            subject: subject,
            html: htmlContent,
        },
    };

    const campaign = new Campaign(data);
    try {
        const newCampaign = await campaign.save();
        console.log("saved campaign to database");
        res.status(201).json(newCampaign);
    } catch (e) {
        console.log(e);
        res.status(500).json({ data: e.message });
    }
};

// for lambda, update DB after campaign sent successfully
const lambdaUpdateDb = async (req, res) => {
    // 驗證請求來自 lambda
    console.log("lambda打來的request body", req.body);
    const { _id, job_id, succeedCount, failCount } = req.body;
    const isFromLambda = await checkRequest(_id);
    if (!isFromLambda) {
        res.status(400).json({ data: "bad request" });
    }
    // update sent_suceed, sent_fail fields
    try {
        console.log(`update from lambda: id -> ${_id}, job_id -> ${job_id}`);
        const updated = await updateCounts(_id, job_id, Number(succeedCount), Number(failCount));
        console.log("updated doc:", updated);
        res.status(200).json({ data: "DB updated" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ data: "fail to update" });
    }
};

// get image in s3 to render page
const getS3Images = async (req, res) => {
    const s3Images = await selectS3Images();
    res.json({ data: s3Images });
};
export { getS3Url, postCampaigns, lambdaUpdateDb, getS3Images };
