import express from "express";
import bodyParser from "body-parser";
const router = express.Router();

import { wrapAsync } from "../util/util.js";
import { jwtauth } from "../util/auth.js";
import { validateSchema, campaignSchema  } from "../util/validator.js";
import {
    postCampaigns,
    getS3Url,
    lambdaUpdateDb,
    getS3Images,
    getAllCampaign,
    getCampaignById,
    genCopy,
    updateCampaignDetail,
    updateStatus,
    getSns,
} from "../controller/campaign.js";

router.use(bodyParser.json());
router.use(
    express.json({
        type: [
            "application/json",
            "text/plain", // AWS sends this content-type for its messages/notifications
        ],
    })
);
router.use(express.urlencoded({ extended: true }));

router.route("/campaigns").post(jwtauth,  validateSchema(campaignSchema) , wrapAsync(postCampaigns));
router.route("/campaigns").put(jwtauth, wrapAsync(updateCampaignDetail));
router.route("/campaigns/status").put(jwtauth, wrapAsync(updateStatus));
router.route("/campaigns").get(wrapAsync(getAllCampaign));
router.route("/campaigns/s3Url").get(wrapAsync(getS3Url));
router.route("/campaigns/images").get(wrapAsync(getS3Images));
router.route("/lambdaUpdateDb").post(wrapAsync(lambdaUpdateDb));
router.route("/campaigns/autocopy").post(wrapAsync(genCopy));
router.route("/campaigns/sns").post(wrapAsync(getSns));
router.route("/campaigns/:id").get(wrapAsync(getCampaignById));

export default router;
