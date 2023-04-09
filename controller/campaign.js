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

    const campaign = new Campaign(req.body);
    // TODO 後端要做資料驗證
    try {
        const newCampaign = await campaign.save();
        console.log("saved campaign to database");
        res.status(201).json(newCampaign);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
};

// for lambda, update DB after campaign sent successfully
const lambdaUpdateDb = async (req, res) => {
    // 驗證請求來自 lambda
    const { _id, succeedCount, failCount } = req.body;
    const isFromLambda = await checkRequest(_id);
    if (!isFromLambda) {
        res.status(400).json("bad request");
    }
    // update sent_suceed, sent_fail fields
    try {
        const updated = await updateCounts(_id, succeedCount, failCount);
        console.log("updated doc:", updated);
        res.status(200).json("DB updated");
    } catch (e) {
        console.error(e);
        res.status(500).json("fail to update");
    }
};

// get segments in DB to render page
const getSegmentNames = async (req, res) => {
    const segments = await selectSegmentNames();
    res.json({ data: segments });
};

// get image in s3 to render page
const getS3Images = async (req, res) => {
    const s3Images = await selectS3Images();
    res.json({ data: s3Images });
};
export { getS3Url, postCampaigns, lambdaUpdateDb, getSegmentNames, getS3Images };
