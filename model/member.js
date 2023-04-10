import mongoose from "mongoose";
const schema = mongoose.Schema;

const orderSchema = new Schema({
    date: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    products: {
        type: Array,
        item: {
            type: String,
        },
    },
});

const memberSchema = new Schema({
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
            gender: {
                type: String, // f, m ,n
                required: false,
            },
            birthday_year: {
                type: String,
                required: false,
            },
            birthday_month: {
                type: String,
                required: false,
            },
            birthday_date: {
                type: String,
                required: false,
            },
            city: {
                type: String,
                required: false,
            },
            location: {
                type: Array,
                items: {
                    type: Number,
                },
            },
            created_at: {
                type: Date,
                required: true,
                default: Date.now,
            },
            order: {
                type: [orderSchema],
            },
        },
    ],
});

const Member = mongoose.model("member", memberSchema);

export { Member };
