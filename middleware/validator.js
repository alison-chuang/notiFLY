import Ajv, { ValidationError } from "ajv";
const ajv = new Ajv();

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
                return res.status(400).json({ error: err.errors });
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

export { validateSchema, campaignSchema, idSchema };
