import mongoose from "mongoose";
const schema = mongoose.Schema;

const campaignSchema = new schema({
    name: {
        type: String,
        required: false,
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
    sendDate: {
        type: Date,
        required: false,
    },
    companyId: {
        type: Number,
        required: true,
    },
    segmentId: {
        type: String, // change to group ID when segment is set
        required: true,
    },
    membersId: {
        type: String, // change to group ID when segment is set
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
const Campaign = mongoose.model("campaigns", campaignSchema);

const updateCampaign = async (campaign) => {
    try {
        Campaign.findOneAndUpdate({ _id: campaign }, { $set: { status: "processing" } }, { new: true });
    } catch (e) {
        console.log(e);
    }
};

export { Campaign };
