import { isKey } from "../model/key.js";

const checkKey = async (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    console.log(apiKey);
    if (!apiKey) {
        return res.status(401).json({ error: "API key not found" });
    }

    const keyInDb = await isKey(apiKey);

    if (!keyInDb) {
        return res.status(401).json({ error: "Invalid API key" });
    }

    if (keyInDb.expired_at < Date.now()) {
        return res.status(401).json({ error: "API key has expired" });
    }
    next();
};

export { checkKey };
