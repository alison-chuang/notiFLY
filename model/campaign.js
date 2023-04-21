import mongoose from "mongoose";
import { PROCESSED, RUNNING } from "../statusConstant.js";
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

// const recursiveSchema = schema({
//     is_recursive: {
//         type: Boolean,
//         required: true,
//     },
//     type: {
//         type: String, // m(monthly), w(weekly)
//         required: false,
//     },
//     day: {
//         type: String, // 星期幾 0~7 & 每月幾號 1~31
//         required: false,
//     },
//     time: {
//         type: String,
//         required: false, // hh:mm
//     },
// });

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
        // running, finished, stopped
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
        type: String, // one-time, daily, monthly, weekly, yearly
        required: true,
    },
    interval: {
        type: Number,
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
campaignSchema.pre("save", (next) => {
    this.updated_at = new Date();
    next();
});

const Campaign = mongoose.model("campaigns", campaignSchema);

const findLastestJobIndex = (jobs, filterKey, filterValue) => {
    const jobLen = jobs.length;
    // 從後面找
    for (let i = jobLen - 1; i >= 0; i--) {
        if (jobs[i][filterKey] == filterValue) {
            return i;
        }
    }
};

const updateCounts = async (id, job_id, succeed, fail) => {
    const filter = { _id: id, "jobs._id": job_id };
    const update = {
        $set: {
            status: RUNNING,
            "jobs.$.succeed_count": succeed,
            "jobs.$.fail_count": fail,
            "jobs.$.status": PROCESSED,
        },
    };
    const options = {
        new: true,
    };
    const doc = await Campaign.findOneAndUpdate(filter, update, options);
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
