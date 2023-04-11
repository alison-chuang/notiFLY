import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import { postMember } from "../controller/campaign.js";
router.use(express.json());

router.route("/members").post(wrapAsync(postMember));
router.route("/members").post(wrapAsync(updateMember));
