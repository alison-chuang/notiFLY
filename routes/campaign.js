import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import {
    postCampaigns,
    getS3Url,
    lambdaUpdateDb,
    getS3Images,
    getAllCampaign,
    getCampaignById,
    genCopy,
} from "../controller/campaign.js";
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.route("/campaigns").post(wrapAsync(postCampaigns));
router.route("/campaigns").get(wrapAsync(getAllCampaign));
router.route("/campaigns/s3Url").get(wrapAsync(getS3Url));
router.route("/campaigns/images").get(wrapAsync(getS3Images));
router.route("/lambdaUpdateDb").post(wrapAsync(lambdaUpdateDb));
router.route("/campaigns/autocopy").post(wrapAsync(genCopy));
router.route("/campaigns/:id").get(wrapAsync(getCampaignById));

export default router;
