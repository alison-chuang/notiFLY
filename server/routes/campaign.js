import express from "express";
const router = express.Router();

import { wrapAsync } from "../../util/util.js";
import { jwtauth } from "../middleware/auth.js";
import { validateSchema, campaignSchema, idSchema } from "../middleware/validator.js";
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

router.use(
    express.json({
        type: [
            "application/json",
            "text/plain", // AWS sends this content-type for its messages
        ],
    })
);
router.use(express.urlencoded({ extended: true }));

router
    .route("/campaigns")
    .get(wrapAsync(getAllCampaign))
    .post(jwtauth, wrapAsync(validateSchema(campaignSchema)), wrapAsync(postCampaigns))
    .put(
        jwtauth,
        wrapAsync(validateSchema(campaignSchema)),
        wrapAsync(validateSchema(idSchema)),
        wrapAsync(updateCampaignDetail)
    );
router.route("/campaigns/status").put(jwtauth, wrapAsync(validateSchema(idSchema)), wrapAsync(updateStatus));
router.route("/campaigns/s3Url").get(wrapAsync(getS3Url));
router.route("/campaigns/images").get(wrapAsync(getS3Images));
router.route("/lambdaUpdateDb").post(jwtauth, wrapAsync(lambdaUpdateDb));
router.route("/campaigns/autocopy").post(wrapAsync(genCopy));
router.route("/campaigns/sns").post(wrapAsync(getSns));
router.route("/campaigns/:id").get(wrapAsync(getCampaignById));

export default router;
