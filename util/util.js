// for s3 file name
import crypto from "crypto";
import { promisify } from "util";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const randomBytes = promisify(crypto.randomBytes);

// for error handler
const wrapAsync = (fn) => {
    return function (req, res, next) {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
};

// multer for uplaod csv member file
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let assetsPath = path.join(__dirname, "../member_csv/");
            cb(null, assetsPath);
        },
        filename: (req, file, cb) => {
            const customFileName = crypto.randomBytes(18).toString("hex").substr(0, 8);
            const fileExtension = file.mimetype.split("/")[1]; // get file extension from original file name
            cb(null, customFileName + "." + fileExtension);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes("csv")) {
            cb(null, true);
        } else {
            cb("Please upload only csv file.", false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit
    },
});

// schema rule for client to push member data
const newMemberSchema = {
    type: "object",
    properties: {
        client_member_id: {
            type: "string",
        },
        name: {
            type: "string",
        },
        email: {
            type: "string",
            // format: "email",
        },
        cellphone: {
            type: "string",
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
        city: {
            type: "string",
        },
        location: {
            type: "array",
            items: {
                type: "number",
            },
            minItems: 2,
            maxItems: 2,
        },
        orders: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    date: {
                        type: "string",
                        // format: "date-time",
                    },
                    amount: {
                        type: "number",
                        minimum: 0,
                    },
                    products: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        minItems: 1,
                    },
                },
                required: ["date", "amount", "products"],
            },
        },
    },
    required: ["email", "client_member_id"],
    additionalProperties: false,
};

const campaignSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        channel: { type: "string" },
        segmentId: { type: "string" },
        sendTime: { type: "string" },
        type: { type: "string" },
        interval: { type: "integer" },
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

export { wrapAsync, randomBytes, newMemberSchema,campaignSchema, upload };
