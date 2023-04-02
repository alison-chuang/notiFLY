import mongoose from "mongoose";
const schema = mongoose.Schema;

const campaignSchema = new schema({
    name: {
        type: String,
        required: flase,
    },
    status: {
        type: String,
        required: true,
        default: "saved", // saved, launched, processing, sent, failed
    },
    createdDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    launchDate: {
        type: Date,
        required: false,
    },
    taGroupId: {
        type: Array, // change to group ID when segment is set
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    copy: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    landing: {
        type: String,
        required: false,
    },
});
const model = mongoose.model("campaign", campaignSchema);

export default model;
