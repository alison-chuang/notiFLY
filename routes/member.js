import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import { postMember, updateMember, updateOrder, deleteOrder } from "../controller/member.js";
router.use(express.json());

router.route("/members").post(wrapAsync(postMember));
router.route("/members").put(wrapAsync(updateMember));
router.route("/members/order").post(wrapAsync(updateOrder));
router.route("/members/order").put(wrapAsync(deleteOrder));

export default router;
