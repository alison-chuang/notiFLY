import mongoose from "mongoose";
const schema = mongoose.Schema;

const messageSchema = new schema({
    source: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: false,
    },
    html: {
        type: String,
        required: false,
    },
    copy: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    landing: {
        type: String,
        required: false,
    },
});

const recursiveSchema = schema({
    is_recursive: {
        type: Boolean,
        required: true,
    },
    is_weekly: {
        type: Boolean,
        required: false,
    },
    is_monthly: {
        type: Boolean,
        required: false,
    },
    day: {
        type: String, // 星期幾
        required: false,
    },
    date: {
        type: String, // 每月幾號
        required: false,
    },
    time: {
        type: String,
        required: false, // hh:mm
    },
});

const campaignSchema = new schema({
    name: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true,
        default: "saved", // saved, launched, processing( 先不要 sent, failed
    },
    createdDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    sendDate: {
        type: Date,
        required: true,
    },
    recursive: {
        type: [recursiveSchema],
    },
    segmentId: {
        type: schema.Types.ObjectId,
        required: true,
    },
    channel: {
        type: String, // edm, sms ...(for upload to correct queue)
        required: true,
    },
    message_variant: {
        type: [messageSchema],
    },
    total_count: {
        type: Number,
        required: true,
        default: 0,
    },
    suceed_count: {
        type: Number,
        required: true,
        default: 0,
    },
    fail_count: {
        type: Number,
        required: true,
        default: 0,
    },
});
const Campaign = mongoose.model("campaigns", campaignSchema);

const updateCounts = async (id, succeed, fail) => {
    const filter = { _id: id };
    const update = { $inc: { suceed_count: succeed, fail_count: fail } };
    const doc = await Campaign.findOneAndUpdate(filter, update, {
        new: true,
    });
    console.log("updated doc:", doc);
    return doc;
};

const checkRequest = async (id) => {
    const isInDb = await Campaign.findOne({ _id: id });
    if (!isInDb) {
        return false;
    } else {
        return true;
    }
};

export { Campaign, updateCounts, checkRequest };
