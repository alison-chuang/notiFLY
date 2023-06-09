import csv from "csvtojson";
import Ajv, { ValidationError } from "ajv";
const ajv = new Ajv();

// request boby
const validateSchema = (schema) => {
    return async (req, res, next) => {
        schema.$async = true;
        const validate = ajv.compile(schema);
        try {
            await validate(req.body);
            console.log("validator passed.");
            next();
        } catch (err) {
            if (err instanceof ValidationError) {
                console.error(err.message);
                return res.status(400).json({ data: err.errors });
            }
            throw err;
        }
    };
};

// request csv file
const validateFileSchema = (schema) => {
    return async (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ error: "Please select CSV file to upload!" });
        }

        const jsonObjs = await csv().fromFile(req.file.path);

        schema.$async = true;
        const validate = await ajv.compile(schema);
        try {
            const numberSet = new Set(["amount"]);
            for (let obj of jsonObjs) {
                for (let key of Object.keys(obj)) {
                    if (key.startsWith("birthday_") || numberSet.has(key)) {
                        obj[key] = Number(obj[key]);
                    }
                }

                if ("products" in obj) {
                    obj.products = obj.products.split(",");
                }
                await validate(obj);
            }
            console.log("validator passed.");
            req.body.jsonObjs = jsonObjs;
            next();
        } catch (err) {
            console.log("err", err);
            if (err instanceof ValidationError) {
                console.error(err.message);
                return res.status(400).json({ data: err.errors });
            }
            throw err;
        }
    };
};

const campaignSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        channel: { type: "string" },
        segmentId: { type: "string" },
        sendTime: { type: "string" },
        type: { type: "string" },
        interval: { oneOf: [{ type: "integer" }, { type: "string" }] },
        endTime: { type: "string" },
        title: { type: "string" },
        copy: { type: "string" },
        subject: { type: "string" },
        htmlContent: { type: "string" },
        image: { type: "string" },
        landing: { type: "string" },
    },
    required: ["name", "channel", "segmentId", "sendTime", "type"],
};

const idSchema = {
    type: "object",
    properties: {
        id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    },
    required: ["id"],
};

const userSchema = {
    type: "object",
    properties: {
        email: {
            type: "string",
            pattern: "^[\\w.+-]+@(?:[a-z\\d-]+\\.)+[a-z]{2,}$",
        },
        password: {
            type: "string",
            minLength: 8,
        },
        name: { type: "string" },
    },
    required: ["email", "password"],
};

const memberSchema = {
    type: "object",
    properties: {
        client_member_id: { type: "string" },
        name: { type: "string" },
        email: {
            type: "string",
            pattern: "^[\\w.+-]+@(?:[a-z\\d-]+\\.)+[a-z]{2,}$",
        },
        gender: {
            type: "string",
            enum: ["f", "m", "n"],
        },
        birthday_year: {
            type: "number",
            minimum: 1900,
            maximum: 2099,
        },
        birthday_month: {
            type: "number",
            minimum: 1,
            maximum: 12,
        },
        birthday_date: {
            type: "number",
            minimum: 1,
            maximum: 31,
        },
        city: { type: "string" },
    },
};

const orderSchema = {
    type: "object",
    properties: {
        order_id: { type: "string" },
        date: { type: "string" },
        amount: { type: "number" },
        products: { type: "array", items: { type: "string" } },
    },
};

export { validateSchema, validateFileSchema, campaignSchema, idSchema, userSchema, memberSchema, orderSchema };
