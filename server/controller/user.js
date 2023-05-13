import dotenv from "dotenv";
dotenv.config();
import * as path from "path";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getUser, createUser, delUser, selectAllUser, updateUser } from "../model/user.js";
import { createToken, deleteToken } from "../model/token.js";
import { signJwt, verifyJwt } from "../middleware/auth.js";
import { sendResetEmail } from "../../util/email.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// admin create new user
const postUser = async (req, res) => {
    const { email, password, name } = req.body;

    const userData = await getUser(email);
    if (userData) {
        return res.status(400).json({ data: "Email already exists." });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = await createUser(name, email, hash);

    const response = {
        id,
        name,
        email,
    };
    res.status(201).json({ data: response });
};

const signIn = async (req, res) => {
    const { email, password } = req.body;

    const isUser = await getUser(email);
    if (!isUser) {
        return res.status(403).json({ data: "Incorrect email or password." });
    }

    const rightPwd = isUser.password;
    if (!(await bcrypt.compare(password, rightPwd))) {
        return res.status(403).json({ data: "Incorrect email or password." });
    }

    const token = signJwt({ id: isUser.id, name: isUser.name, email: email });

    const response = {
        access_token: token,
        access_expired: process.env.expiresTime,
        user: {
            id: isUser.id,
            name: isUser.name,
            email,
        },
    };
    res.status(200).json({ data: response });
};

const resetPassword = async (req, res) => {
    const { id, email } = req.payload;
    const isUser = await getUser(email);
    if (!isUser) {
        return res.status(400).json({ data: "bad request, email not exist" });
    }

    const data = {
        userId: id,
        token: await uuidv4(),
    };
    const token = await createToken(data);

    const link = `${process.env.BASE_URL}/users/password/link/${id}/${token.token}`;

    const sentEmail = await sendResetEmail(email, link);
    if (!sentEmail.success) {
        return res.status(`${sentEmail.error}`).json({ data: `Error: ${sentEmail.error}` });
    }
    res.status(200).json({ data: "reset password email sent " });
};

const resetLink = async (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "..", "secure", "reset_password.html"));
};

const saveNewPassword = async (req, res) => {
    const id = req.id;
    const token = req.token;
    const newPassword = req.body.password;

    if (newPassword.length < 8) {
        return res.status(400).json({ data: "Password should be 8 characters long." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await updateUser(id, newHash);
    if (!updatedUser) {
        return res.status(400).json({ data: "no matched user with request id." });
    }

    await deleteToken(token);
    res.status(200).json({ data: "password reset" });
};

const deleteUser = async (req, res) => {
    const id = req.query.userId;
    const deleteResult = await delUser(id);
    if (!deleteResult) {
        return res.status(400).json({ data: "User not found." });
    }
    res.status(200).json({ data: "User deleted successfully." });
};

const pageJwtAuth = async (req, res) => {
    const authHeader = req.headers.authorization;
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
        return res.status(200).json({ data: payload });
    } catch (e) {
        console.error(e);
        return res.status(403).json({ data: `Wrong token or token expired. (${e})` });
    }
};

// render user_list page
const getAllUser = async (req, res) => {
    const allUsers = await selectAllUser();
    res.status(200).json({ data: allUsers });
};

export { postUser, signIn, resetPassword, resetLink, saveNewPassword, deleteUser, getAllUser, pageJwtAuth };
