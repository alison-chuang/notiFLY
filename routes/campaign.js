import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import { postCampaigns, getS3Url, lambdaUpdateDb, getSegmentNames, getS3Images } from "../controller/campaign.js";
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.route("/campaigns").post(wrapAsync(postCampaigns));

router.route("/segments").get(wrapAsync(getSegmentNames));

router.route("/images").get(wrapAsync(getS3Images));

router.route("/s3Url").get(wrapAsync(getS3Url));

router.route("/lambdaUpdateDb").post(wrapAsync(lambdaUpdateDb));

export default router;
