import mongoose from "mongoose";
const Schema = mongoose.Schema;

const apiKeySchema = new Schema({
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
    created_at: {
        type: Date,
        default: Date.now,
        required: true,
    },
    expired_at: {
        type: Date,
        required: true,
        default: function () {
            const date = new Date();
            // Add 30 days to the current date
            date.setDate(date.getDate() + 30);
            return date;
        },
    },
});

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

const updateOldKeys = async () => {
    const now = new Date();
    const searchDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

    const filter = { expired_at: { $gte: searchDate } };
    const update = { $set: { expired_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) } };
    await ApiKey.updateMany(filter, update);
};

const selecAllKey = async () => {
    try {
        const keys = await ApiKey.find({});
        return keys;
    } catch (e) {
        console.error(`Error retrieving key: ${e.message}`);
        return null;
    }
};

export { ApiKey, updateOldKeys, selecAllKey };
