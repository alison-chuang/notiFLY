import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import {
    postMember,
    updateMember,
    updateOrder,
    deleteOrder,
    uploadMemberCsv,
    uploadOrderCsv,
    deleteMember,
    getKey,
    checkKey,
    getAllKey,
} from "../controller/member.js";
import { upload } from "../../util/util.js";
import { isAuthorized, jwtauth } from "../middleware/auth.js";
router.use(express.json());

router.route("/members").post(checkKey, wrapAsync(postMember));
router.route("/members/csv").post(jwtauth, upload.single("memberCsv"), wrapAsync(uploadMemberCsv));
router.route("/members").put(checkKey, wrapAsync(updateMember));
router.route("/members").delete(checkKey, wrapAsync(deleteMember));
router.route("/members/order").post(checkKey, wrapAsync(updateOrder));
router.route("/members/order/csv").post(jwtauth, upload.single("orderCsv"), wrapAsync(uploadOrderCsv));
router.route("/members/order").put(checkKey, wrapAsync(deleteOrder));
router.route("/keys").post(jwtauth, isAuthorized, wrapAsync(getKey));
router.route("/keys").get(wrapAsync(getAllKey));
router.route("/keys/page").get(jwtauth, isAuthorized);

export default router;
