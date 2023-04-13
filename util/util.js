// for s3 file name
import crypto from "crypto";
import { promisify } from "util";
const randomBytes = promisify(crypto.randomBytes);

// for error handler
const wrapAsync = (fn) => {
    return function (req, res, next) {
        // Make sure to `.catch()` any errors and pass them along to the `next()`
        // middleware in the chain, in this case the error handler.
        fn(req, res, next).catch(next);
    };
};

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
            pattern: "^(19|20)\\d{2}$",
        },
        birthday_month: {
            type: "number",
            pattern: "^(0?[1-9]|1[0-2])$",
        },
        birthday_date: {
            type: "number",
            pattern: "^([1-9]|0[1-9]|[12][0-9]|3[01])$",
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

export { wrapAsync, randomBytes, newMemberSchema };
