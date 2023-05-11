import dotenv from "dotenv";
dotenv.config();
import { ChatGPTAPI } from "chatgpt";
import { generateImageURL, selectS3Images } from "../util/upload.js";
import "../model/database.js";

import {
    updateCounts,
    selectAllCampaign,
    selectById,
    updateCampaign,
    changeStatus,
    createCampaign,
} from "../model/campaign.js";

const sender = process.env.SENDER;

// presigned URL
const getS3Url = async (req, res) => {
    const url = await generateImageURL();
    console.log({ url });
    res.send({ url });
};

const postCampaigns = async (req, res) => {
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

    if (type === "one-time-delivery") {
        interval = Number(0);
        endTime = sendTime;
    }

    if (type === "periodic-delivery") {
        if (!interval || !endTime) {
            return res.status(400).json({ data: "Interval & End Time are required for periodic-delivery." });
        }

        if (endTime < sendTime) {
            return res.status(400).json({ data: "End Time should be later than Send Time" });
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

    await createCampaign(data);
    res.status(201).json({ data: "Campaign created successfully.'" });
};

// for lambda, update DB after campaign sent successfully
const lambdaUpdateDb = async (req, res) => {
    const { _id, job_id, succeedCount, failCount } = req.body;

    console.log(`update from lambda: id -> ${_id}, job_id -> ${job_id}`);
    const updatedCounts = await updateCounts(_id, job_id, Number(succeedCount), Number(failCount));
    if (!updatedCounts) {
        return res.status(400).json({ data: "no matched campaign with request id " });
    }
    res.status(200).json({ data: "success & fail counts updated" });
};

const getS3Images = async (req, res) => {
    const s3Images = await selectS3Images();
    res.status(200).json({ data: s3Images });
};

const getAllCampaign = async (req, res) => {
    const allCampaigns = await selectAllCampaign();
    res.status(200).json({ data: allCampaigns });
};

const getCampaignById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ data: "bad request" });
    }

    const detail = await selectById(id);
    if (!detail) {
        return res.status(400).json({ data: "no matched campaign with request id " });
    }
    res.status(200).json({ data: detail });
};

const genCopy = async (req, res) => {
    const { tone, language, channel, product, keywords } = req.body;

    const inputLength = 100;
    if (product.length > inputLength || keywords.length > inputLength) {
        return res.status(400).json({ data: "Product or keywords cannot exceed 100 characters." });
    }

    const prompt = `
    Using a ${tone} tone, write a ${language} ${channel} copy highlighting the ${keywords} of a ${product}.
    No incomplete sentences is permitted.
    No need to provide translation. 
    No simplified Chinese is permitted. Only zh-TW for Chinese Copy.
    Should complete the sentence before it reaches max_tokens.
    No more than 30 words.
    Not to provide incomplete sentences in your responses. Every sentense should completed.
    `;

    const api = new ChatGPTAPI({
        apiKey: process.env.OPEN_AI,
        completionParams: {
            model: "gpt-3.5-turbo",
            max_tokens: 60,
            temperature: 1,
            top_p: 0.5,
        },
    });

    const copy = await api.sendMessage(prompt);
    res.status(200).json({ data: copy.text });
};

const updateCampaignDetail = async (req, res) => {
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
    const updatedCampaign = await updateCampaign(id, formUpdate);
    if (!updatedCampaign) {
        return res.status(400).json({ data: "no matched campaign with request id." });
    }
    res.status(200).json({ data: "updated" });
};

// client click stop btn
const updateStatus = async (req, res) => {
    const { id, status } = req.body;
    const updatedStatus = await changeStatus(id, status);
    if (!updatedStatus) {
        return res.status(400).json({ data: "no matched campaign with request id." });
    }
    res.status(200).json({ data: "stopped" });
};

const getSns = (req, res) => {
    console.log("sns", req.body);
    res.status(200).json({ data: req.body });
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
    getSns,
};
