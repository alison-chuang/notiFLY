import mongoose from "mongoose";
const Schema = mongoose.Schema;

const segmentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: String,
        },
        query: {
            type: Object,
        },
        rules: {
            type: Object,
        },
    },
    {
        timestamps: true,
    }
);

const Segment = mongoose.model("segment", segmentSchema);

const createSegment = async (data) => {
    const newSegment = new Segment(data);
    return await newSegment.save();
};

// render create campaign page
const selectSegmentNames = async () => {
    return await Segment.find({}, { name: 1 });
};

const selectAllSegment = async () => {
    return await Segment.find({});
};

const updateSegment = async (id, query, name, rules) => {
    const filter = { _id: id };
    const update = { $set: { query: query, name: name, rules: rules } };
    return await Segment.findOneAndUpdate(filter, update, { new: true });
};

const selectById = async (id) => {
    return Segment.findOne({ _id: id }, { query: 0 });
};

export { createSegment, selectSegmentNames, updateSegment, selectAllSegment, selectById };
