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

const createToken = async (data) => {
    const token = new Token(data);
    return await token.save();
};

const checkToken = async (id, token) => {
    return await Token.findOne({ userId: id, token: token });
};

const deleteToken = async (token) => {
    return await Token.findOneAndDelete({ token: token });
};

export { createToken, checkToken, deleteToken };
