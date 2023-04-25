import express from "express";
const router = express.Router();
import { wrapAsync } from "../util/util.js";
import { isAuthorized, jwtauth } from "../util/auth.js";
import {
    postUser,
    signIn,
    resetPassword,
    verifyLink,
    saveNewPassword,
    deleteUser,
    getAllUser,
    pageJwtAuth,
} from "../controller/user.js";
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// TODO 開發方便，create user 先不限制權限中間件
router.route("/users").post(/*jwtauth, isAuthorized*/ wrapAsync(postUser));
router.route("/users").get(/*jwtauth, isAuthorized*/ wrapAsync(getAllUser));
router.route("/users/pageview").get(wrapAsync(pageJwtAuth));
router.route("/users/signin").post(wrapAsync(signIn));
router.route("/users/password").post(jwtauth, wrapAsync(resetPassword));
router.route("/users/password/link/:id/:token").post(wrapAsync(saveNewPassword));
router.route("/users").delete(/*jwtauth, isAuthorized*/ wrapAsync(deleteUser));

export default router;
