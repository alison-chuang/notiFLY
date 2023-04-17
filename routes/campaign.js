import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import { postCampaigns, getS3Url, lambdaUpdateDb, getS3Images } from "../controller/campaign.js";
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.route("/campaigns").post(wrapAsync(postCampaigns));

router.route("/campaigns/images").get(wrapAsync(getS3Images));

router.route("/campaigns/s3Url").get(wrapAsync(getS3Url));

router.route("/lambdaUpdateDb").post(wrapAsync(lambdaUpdateDb));

export default router;
