import mongoose from "mongoose";
const schema = mongoose.Schema;

const segmentSchema = new schema({
    name: {
        type: String,
    },
    query: {
        type: Object,
    },
});

const Segment = mongoose.model("segment", segmentSchema);

// get segments in DB to render frontend page
const selectSegmentNames = async () => {
    const segments = await Segment.find({}, { name: 1 });
    return segments;
};

export { Segment, selectSegmentNames };
