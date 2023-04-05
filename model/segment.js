import mongoose from "mongoose";
const schema = mongoose.Schema;

const segmentSchema = new schema({
    segmentId: {
        type: Number,
    },
    name: {
        type: String,
    },
    company: {
        type: String,
    },
    query: {
        type: Object,
    },
});

const Segment = mongoose.model("segment", segmentSchema);

export { Segment };
