import mongoose from "mongoose";
const schema = mongoose.Schema;

const memberSchema = new Schema({
    company: {
        type: String,
        required: true,
    },
    members: [
        {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
                unique: true,
            },
            cellphone: {
                type: String,
                required: false,
            },
            created_at: {
                type: Date,
                required: true,
            },
            // more filter
        },
    ],
});

const Member = mongoose.model("member", memberSchema);

export { Member };
