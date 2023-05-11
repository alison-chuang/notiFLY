import mongoose from "mongoose";
import { PROCESSED, RUNNING } from "../status_constant.js";
const Schema = mongoose.Schema;

const messageSchema = new Schema({
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
    title: {
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

const jobSchema = new Schema({
    send_time: {
        type: Date,
        required: true,
    },
    total_count: {
        type: Number,
        required: true,
        default: 0,
    },
    succeed_count: {
        type: Number,
        required: true,
        default: 0,
    },
    fail_count: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String, //launched, processing(送到SQS後), processed（lambda有做過）
        default: "launched",
        required: true,
    },
});

const campaignSchema = new Schema({
    name: {
        type: String,
        required: false,
    },
    owner_name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "running",
        // running, registered, finished, stopped
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    send_time: {
        type: Date,
    },
    next_send_time: {
        type: Date,
    },
    type: {
        type: String, // one-time, periodic
        required: true,
    },
    interval: {
        type: Number,
        default: 0,
    },
    end_time: {
        type: Date,
    },
    jobs: {
        type: [jobSchema],
        default: [],
    },
    segment_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    channel: {
        type: String, // edm, sms ...(for upload to correct queue)
        required: true,
    },
    message_variant: {
        type: [messageSchema],
    },
});

// middleware
campaignSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});

const Campaign = mongoose.model("campaigns", campaignSchema);

const createCampaign = async (data) => {
    const campaign = new Campaign(data);
    await campaign.save();
    return true;
};

const updateCounts = async (id, job_id, succeed, fail) => {
    const filter = { _id: id, "jobs._id": job_id };
    const update = {
        $set: {
            status: RUNNING,
            "jobs.$.status": PROCESSED,
        },
        $inc: {
            "jobs.$.succeed_count": succeed,
            "jobs.$.fail_count": fail,
        },
    };
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

// get campaign for render campaign list
const selectAllCampaign = async () => {
    const campaigns = await Campaign.find({});
    return campaigns;
};

// select campaign by id for campaign detail page
const selectById = async (id) => {
    try {
        return await Campaign.findOne({ _id: id });
    } catch (e) {
        return false;
    }
};

// update campaign
const updateCampaign = async (id, formUpdate) => {
    try {
        const filter = { _id: id };
        const update = { $set: formUpdate };
        const doc = await Campaign.findOneAndUpdate(filter, update, { new: true });
        console.log("**", doc); // null
        // id 不存在會回 null，id 格式錯誤報錯會掉到 catch
        return doc;
    } catch (e) {
        console.log("@@", e);
    }
};

// stop campaign
const changeStatus = async (id, status) => {
    try {
        const filter = { _id: id };
        const update = { $set: { status: status } };
        const doc = await Campaign.findOneAndUpdate(filter, update, { new: true });
        return doc;
    } catch (e) {
        return false;
    }
};

export {
    Campaign,
    updateCounts,
    checkRequest,
    selectAllCampaign,
    selectById,
    updateCampaign,
    changeStatus,
    createCampaign,
};
