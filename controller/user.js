import * as path from "path";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import { User, getUser, insertUser, delUser, selecAlltUser } from "../model/user.js";
import { Token } from "../model/token.js";
import { signJwt, verifyJwt } from "../util/auth.js";
import { sendResetEmail } from "../util/email.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create new user (類sign-up)
const postUser = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ data: "Email, password and name are required." });
    }

    const emailRegex = /^[\w.+-]+@(?:[a-z\d-]+\.)+[a-z]{2,}$/g;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ data: "Invalid email address." });
    }

    try {
        const userData = await getUser(email);
        if (userData) {
            return res.status(400).json({ data: "Email already exists." });
        }

        const hash = await bcrypt.hash(password, 10);

        const id = await insertUser(name, email, hash);

        const response = {
            id,
            name,
            email,
        };
        return res.json({ data: response });
    } catch (e) {
        console.error(e);
    }
};

// sign-in
const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ data: "Email and password are required." });
    }

    const emailRegex = /^[\w.+-]+@(?:[a-z\d-]+\.)+[a-z]{2,}$/g;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ data: "Invalid email address." });
    }

    // if (password.length < 8) {
    //     return res.status(400).json({ data: "Invalid password" });
    // }

    const fetch = await getUser(email);
    if (!fetch) {
        return res.status(403).send("Sign In Failed");
    }

    const rightPwd = fetch.password;
    if (!(await bcrypt.compare(password, rightPwd))) {
        return res.status(403).send("Sign In Failed");
    }

    const token = signJwt({ id: fetch.id, name: fetch.name, email: email });

    const response = {
        access_token: token,
        access_expired: process.env.expiresTime,
        user: {
            id: fetch.id,
            name: fetch.name,
            email,
        },
    };
    return res.json({ data: response });
};

/* 
admin create user => (default user role) 
=> user 即有帳密可以登入
=> user 更改密碼
*/
// 重置密碼信裡的連結 "/users/password").get

// ("users/password").post
const resetPassword = async (req, res) => {
    const { id, name, email } = req.payload;
    const user = await getUser(email);

    // email 不存在
    if (!user) {
        return res.status(400).json({ data: "bad request, email not exist" });
    }

    // 如果 email 存在，產連結＆發信
    try {
        // 產 token 帶入連結
        let token = await new Token({
            userId: id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();

        // 發信
        const message = `${process.env.BASE_URL}/users/password/link/${id}/${token.token}`;
        await sendResetEmail(email, message);
        return res.status(200).json({ data: "reset password email sent " });
    } catch (e) {
        return res.status(500).json({ data: "reset password email failed" });
    }
};

// user 點連結後 .get("/users/password/link/:id/:token"
const verifyLink = async (req, res) => {
    const id = req.params.id;
    const token = req.params.token;
    // 驗證連結信箱
    const user = await User.findOne({ _id: id });
    if (!user) {
        return res.status(400).json({ data: "Invalid link" });
    }
    // 驗證連結 token
    const checkToken = await Token.findOne({
        userId: user._id,
        token: token,
    });
    if (!checkToken) {
        return res.status(400).json({ data: "Invalid link" });
    }
    return res.status(200).sendFile(path.join(__dirname, "..", "secure", "reset_password.html"));
};

//.post("/users/password/link/:id/:token"
// 輸入新密碼後 submit
const saveNewPassword = async (req, res) => {
    const id = req.params.id;
    const token = req.params.token;
    // 驗證連結信箱
    const user = await User.findOne({ _id: id });
    if (!user) {
        return res.status(400).json({ data: "Invalid link" });
    }
    // 驗證連結 token
    const checkToken = await Token.findOne({
        userId: user._id,
        token: token,
    });
    if (!checkToken) {
        return res.status(400).json({ data: "Invalid link" });
    }
    // 都驗證成功後，hash他輸入的密碼並更新資料庫
    try {
        const newPassword = req.body.password;
        const newhash = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ _id: user._id }, { password: newhash });
        await Token.findByIdAndRemove(token._id);
        return res.status(200).json({ data: "password reset" });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ data: "update new password failed" });
    }
};

// update user role (先不做)

// delete user (直接資料庫刪掉)
const deleteUser = async (req, res) => {
    try {
        const id = req.query.userId;
        const result = await delUser(id);
        return res.status(200).json({ data: result });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ data: e.message });
    }
};

// render profile name & every front page  should validate jwt
async function pageJwtAuth(req, res) {
    const authHeader = req.headers.authorization;
    // console.log("authHeader: ", authHeader);
    if (!authHeader) {
        return res.status(401).json({ data: "No authorization in header " });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ data: "No token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ data: "No token" });
    }

    try {
        const payload = await verifyJwt(token);
        console.log("payload:", payload);
        return res.status(200).json({ data: payload });
    } catch (e) {
        console.error(e);
        return res.status(403).json({ data: `Wrong token or token expired. (${e})` });
    }
}

// render all user for user_list page
const getAllUser = async (req, res) => {
    try {
        const allUsers = await selecAlltUser();
        return res.status(200).json({ data: allUsers });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ data: "get user failed" });
    }
};

export { postUser, signIn, resetPassword, verifyLink, saveNewPassword, deleteUser, getAllUser, pageJwtAuth };
