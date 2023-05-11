import mongoose from "mongoose";
import { LAUNCHED, PROCESSED, RUNNING } from "../cron_constant.js";
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
        type: String,
        default: LAUNCHED,
        required: true,
    },
});

const campaignSchema = new Schema(
    {
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
            default: RUNNING,
        },
        send_time: {
            type: Date,
        },
        next_send_time: {
            type: Date,
        },
        type: {
            type: String,
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
            type: String, // edm, sms ...
            required: true,
        },
        message_variant: {
            type: [messageSchema],
        },
    },
    {
        timestamps: true,
    }
);

const Campaign = mongoose.model("campaigns", campaignSchema);

const createCampaign = async (data) => {
    const campaign = new Campaign(data);
    await campaign.save();
    return;
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
    return await Campaign.findOneAndUpdate(filter, update, { new: true });
};

// for campaign list page
const selectAllCampaign = async () => {
    const campaigns = await Campaign.find({});
    return campaigns;
};

// for campaign detail page
const selectById = async (id) => {
    return await Campaign.findOne({ _id: id });
};

const updateCampaign = async (id, formUpdate) => {
    const filter = { _id: id };
    const update = { $set: formUpdate };
    return await Campaign.findOneAndUpdate(filter, update, { new: true });
};

// manually stop campaign
const changeStatus = async (id, status) => {
    const filter = { _id: id };
    const update = { $set: { status: status } };
    return await Campaign.findOneAndUpdate(filter, update, { new: true });
};

export { updateCounts, selectAllCampaign, selectById, updateCampaign, changeStatus, createCampaign };
