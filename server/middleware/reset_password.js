import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { checkToken } from "../model/token.js";

const verifySource = async (req, res, next) => {
    const id = req.params.id;
    const token = req.params.token;

    const check = await checkToken(id, token);
    if (!check) {
        return res.status(404).sendFile(path.join(__dirname, "..", "public", "404.html"));
    }

    req.id = id;
    req.token = token;
    console.log("id & token passed.");
    next();
};

export { verifySource };
