import dotenv from "dotenv";
dotenv.config();
import { ChatGPTAPI } from "chatgpt";
import { generateImageURL, selectS3Images } from "../util/upload.js";
import "../model/database.js";
import {
    Campaign,
    updateCounts,
    checkRequest,
    selectAllCampaign,
    selectById,
    updateCampaign,
    changeStatus,
} from "../model/campaign.js";
const sender = process.env.SENDER;

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
    const owner = req.payload.name;
    let {
        name,
        channel,
        segmentId,
        sendTime,
        type,
        interval,
        endTime,
        title,
        copy,
        subject,
        htmlContent,
        image,
        landing,
    } = req.body;

    /* 如果是 one-time delivery, set interval=0 & endTime=sendTime
    如果是 periodic delivery, 沒有 interval endTime 要報錯 */
    if (type === "one-time-delivery") {
        interval = Number(0);
        endTime = sendTime;
    }

    if (type === "periodic-delivery") {
        if (!interval || !endTime) {
            return res.status(400).json({ data: "interval & endtime is required for periodic-delivery " });
        }
    }

    const data = {
        name,
        owner_name: owner,
        send_time: sendTime,
        local_sendTime: sendTime.toLocaleString(),
        segment_id: segmentId,
        channel,
        type,
        interval,
        end_time: endTime,
        message_variant: {
            source: sender,
            subject: subject,
            html: htmlContent,
            title,
            copy,
            image,
            landing,
        },
        next_send_time: sendTime,
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

// get campaign list
const getAllCampaign = async (req, res) => {
    try {
        const allCampaigns = await selectAllCampaign();
        return res.status(200).json({ data: allCampaigns });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e });
    }
};

// get campaign detail page
const getCampaignById = async (req, res) => {
    // TODO error handling
    try {
        const { id } = req.params;
        console.log("a", id);
        if (!id) {
            return res.status(400).json({ data: "bad request" });
        }

        const detail = await selectById(id);
        // console.log("detail", detail);

        if (!detail) {
            return res.status(400).json({ data: "no matched segment with request id " });
        }
        return res.status(200).json({ data: detail });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e });
    }
};

// Open AI generate copy
const genCopy = async (req, res) => {
    const { tone, language, channel, product, keywords } = req.body;
    const prompt = `Using a ${tone} tone, write a ${language} ${channel} copy highlighting the ${keywords} of a ${product}.
    No more than 20 words in total.`;
    const api = new ChatGPTAPI({
        apiKey: process.env.OPEN_AI,
        completionParams: {
            model: "gpt-3.5-turbo",
            max_tokens: 50,
            temperature: 1,
            top_p: 0.5,
        },
    });

    try {
        const copy = await api.sendMessage(prompt);
        return res.status(200).json({ data: copy.text });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e });
    }
};

// update campaign (放在編輯頁的 save button)
const updateCampaignDetail = async (req, res) => {
    try {
        let {
            id,
            name,
            channel,
            segmentId,
            sendTime,
            type,
            interval,
            endTime,
            title,
            copy,
            subject,
            htmlContent,
            image,
            landing,
        } = req.body;

        const owner = req.payload.name;
        const formUpdate = {
            name,
            owner_name: owner,
            send_time: sendTime,
            segment_id: segmentId,
            channel,
            type,
            interval,
            end_time: endTime,
            message_variant: {
                source: sender,
                subject: subject,
                html: htmlContent,
                title,
                copy,
                image,
                landing,
            },
            next_send_time: sendTime,
        };
        console.log({ id });
        const updated = await updateCampaign(id, formUpdate);
        return res.status(200).json({ data: "updated" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        console.log(req.body);
        await changeStatus(id, status);
        return res.status(200).json({ data: "stopped" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: e });
    }
};

export {
    getS3Url,
    postCampaigns,
    lambdaUpdateDb,
    getS3Images,
    getAllCampaign,
    getCampaignById,
    genCopy,
    updateCampaignDetail,
    updateStatus,
};
