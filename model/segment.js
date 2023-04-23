import mongoose from "mongoose";
const Schema = mongoose.Schema;

const segmentSchema = new Schema({
    name: {
        type: String,
        // required: true,
    },
    owner_name: {
        type: String,
        // required: true,
    },
    query: {
        type: Object,
    },
    rules: {
        type: Object,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

segmentSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});

const Segment = mongoose.model("segment", segmentSchema);

// get segments in DB to render create campaign page
const selectSegmentNames = async () => {
    const segments = await Segment.find({}, { name: 1 });
    return segments;
};

// get segment for render segment list
const selectAllSegment = async () => {
    const segments = await Segment.find({});
    return segments;
};

// TODO update segment (放在編輯頁的 save button)
const updateSegment = async (id, query, name, rules) => {
    const filter = { _id: id };
    const update = { $set: { query: query, name: name, rules: rules } };
    const doc = await Segment.findOneAndUpdate(filter, update, {
        new: true,
    });
    console.log("updated doc:", doc);
    return doc;
};

// TODO select segment by id
const selectById = async (id) => {
    try {
        const doc = await Segment.findOne({ _id: id }, { query: 0 });
        return doc;
    } catch (e) {
        return false;
    }
};

export { Segment, selectSegmentNames, updateSegment, selectAllSegment, selectById };
