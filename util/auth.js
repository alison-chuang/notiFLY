import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { checkPermissions } from "../model/user.js";

// jwt
const jwtSecret = process.env.jwtSecret;
const jwtAlg = process.env.jwtAlg;
const expiresTime = process.env.expiresTime;

function signJwt(payload) {
    const token = jwt.sign(payload, jwtSecret, {
        algorithm: jwtAlg,
        expiresIn: expiresTime,
    });
    return token;
}

function verifyJwt(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, jwtSecret, { algorithm: jwtAlg }, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded);
        });
    });
}

// authentication middleware
async function jwtauth(req, res, next) {
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
        req.payload = await verifyJwt(token);
    } catch (e) {
        console.error(e);
        return res.status(403).json({ data: `Wrong token or token expired.${e}` });
    }
    next();
}

// authorization middelware
async function isAuthorized(req, res, next) {
    // 1. 拿到client req endpoint(不含 query string)
    const resource = req.path.split("/")[1];
    const method = req.method;

    // 2. 用 client req 的 endpoint & method 去資料庫查有沒有存在
    const { id } = req.payload;
    console.log("req from user id:", id);
    const permission = await checkPermissions(id, resource, method);
    console.log("permission", permission);
    if (!permission) {
        return res.status(403).json({ data: "Unauthorized" });
    }
    next();
}

export { jwtauth, signJwt, isAuthorized };
