import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import { jwtauth } from "../middleware/auth.js";
import {
    postSegment,
    getSegmentName,
    getCity,
    getAllSegment,
    getSegmentById,
    countMember,
    updateSegmentDetail,
} from "../controller/segment.js";
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router
    .route("/segments")
    .get(wrapAsync(getAllSegment))
    .post(jwtauth, wrapAsync(postSegment))
    .put(jwtauth, wrapAsync(updateSegmentDetail));
router.route("/segments/names").get(wrapAsync(getSegmentName));
router.route("/segments/cities").get(wrapAsync(getCity));
router.route("/segments/count").post(wrapAsync(countMember));
router.route("/segments/:id").get(wrapAsync(getSegmentById));

export default router;
