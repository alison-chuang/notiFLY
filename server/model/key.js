import mongoose from "mongoose";
const Schema = mongoose.Schema;

const apiKeySchema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        key: {
            type: String,
            unique: true,
            required: true,
        },
        expired_at: {
            type: Date,
            required: true,
            default: function () {
                const date = new Date();
                date.setDate(date.getDate() + 30);
                return date;
            },
        },
    },
    {
        timestamps: true,
    }
);

const Key = mongoose.model("Key", apiKeySchema);

const updateOldKeys = async () => {
    const now = new Date();
    const searchDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

    const filter = { expired_at: { $gte: searchDate } };
    const update = {
        $set: { expired_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) },
    };
    return await Key.updateMany(filter, update, { new: true });
};

const selectAllKey = async () => {
    return await Key.find({});
};

const isKey = async (apiKey) => {
    console.log({ apiKey });
    return await Key.findOne({ key: apiKey });
};

const createKey = async (data) => {
    const key = new Key(data);
    return await key.save();
};

export { Key, updateOldKeys, selectAllKey, isKey, createKey };
