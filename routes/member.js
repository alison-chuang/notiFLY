import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import {
    postMember,
    updateMember,
    updateOrder,
    deleteOrder,
    uploadMemberCsv,
    uploadOrderCsv,
} from "../controller/member.js";
import { upload } from "../util/util.js";
router.use(express.json());

router.route("/members").post(wrapAsync(postMember));
router.route("/members/csv").post(upload.single("memberCsv"), wrapAsync(uploadMemberCsv));
router.route("/members").put(wrapAsync(updateMember));
router.route("/members/order").post(wrapAsync(updateOrder));
router.route("/members/order/csv").post(upload.single("orderCsv"), wrapAsync(uploadOrderCsv));
router.route("/members/order").put(wrapAsync(deleteOrder));

export default router;
