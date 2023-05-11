import Ajv from "ajv";
const ajv = new Ajv();


const validateSchema = (schema) => {
    return async (req, res, next) => {
        const validate = ajv.compile(schema);
        const isValid = await validate(req.body);
        if (!isValid) {
            console.log("validator failed");
            return res.status(400).json({error: validate.errors});
        } else {
            console.log("validator passed");
            next();
        }
    };
};


const campaignSchema ={
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


export { validateSchema, campaignSchema };