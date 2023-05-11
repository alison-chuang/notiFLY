import mongoose from "mongoose";
const Schema = mongoose.Schema;

const tokenSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: "1d" }, // expire in one day
        },
    },
    {
        timestamps: true,
    }
);

const Token = mongoose.model("token", tokenSchema);

export { Token };
