import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import { isAuthorized, jwtauth } from "../middleware/auth.js";
import { validateSchema, userSchema } from "../middleware/validator.js";
import { verifySource } from "../middleware/reset_password.js";
import {
    postUser,
    signIn,
    resetPassword,
    saveNewPassword,
    deleteUser,
    getAllUser,
    pageJwtAuth,
} from "../controller/user.js";
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router
    .route("/users")
    .post(
        jwtauth,
        isAuthorized,
        wrapAsync(validateSchema(userSchema)),
        wrapAsync(postUser)
    )
    .get(wrapAsync(getAllUser))
    .delete(jwtauth, isAuthorized, wrapAsync(deleteUser));
router
    .route("/users/signin")
    .post(wrapAsync(validateSchema(userSchema)), wrapAsync(signIn));
router.route("/users/password").post(jwtauth, wrapAsync(resetPassword));
router
    .route("/users/password/link/:id/:token")
    .post(wrapAsync(verifySource), wrapAsync(saveNewPassword));
router.route("/users/pageview").get(wrapAsync(pageJwtAuth));

export default router;
