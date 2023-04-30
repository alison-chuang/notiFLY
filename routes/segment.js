import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import { jwtauth } from "../util/auth.js";
import {
    postSegment,
    getSegment,
    getCity,
    getAllSegment,
    getSegmentById,
    countMember,
    updateSegmentDetail,
} from "../controller/segment.js";
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.route("/segments").post(jwtauth, wrapAsync(postSegment));
router.route("/segments").put(jwtauth, wrapAsync(updateSegmentDetail));
router.route("/segments/names").get(wrapAsync(getSegment));
router.route("/segments/cities").get(wrapAsync(getCity));
router.route("/segments").get(wrapAsync(getAllSegment));
router.route("/segments/count").post(wrapAsync(countMember));
router.route("/segments/:id").get(wrapAsync(getSegmentById));

export default router;
