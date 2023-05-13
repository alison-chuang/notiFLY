import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import {
    postMember,
    updateMemberDetail,
    updateOrderDetail,
    deleteOrder,
    uploadMemberCsv,
    uploadOrderCsv,
    deleteMember,
    getKey,
    getAllKey,
} from "../controller/member.js";
import { upload } from "../../util/util.js";
import { isAuthorized, jwtauth } from "../middleware/auth.js";
import { validateSchema, memberSchema, orderSchema } from "../middleware/validator.js";
import { checkKey } from "../middleware/key.js";

router.use(express.json());

router
    .route("/members")
    .post(checkKey, wrapAsync(validateSchema(memberSchema)), wrapAsync(postMember))
    .put(checkKey, wrapAsync(validateSchema(memberSchema)), wrapAsync(updateMemberDetail))
    .delete(checkKey, wrapAsync(deleteMember));

router
    .route("/members/order")
    .post(checkKey, wrapAsync(validateSchema(orderSchema)), wrapAsync(updateOrderDetail))
    .put(checkKey, wrapAsync(validateSchema(orderSchema)), wrapAsync(deleteOrder));

router.route("/members/csv").post(jwtauth, upload.single("memberCsv"), wrapAsync(uploadMemberCsv));
router.route("/members/order/csv").post(jwtauth, upload.single("orderCsv"), wrapAsync(uploadOrderCsv));

router.route("/keys").post(jwtauth, isAuthorized, wrapAsync(getKey)).get(wrapAsync(getAllKey));

export default router;
