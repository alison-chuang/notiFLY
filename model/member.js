import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    date: {
        type: Date,
    },
    amount: {
        type: Number,
    },
    products: {
        type: [String],
    },
});

const memberSchema = new Schema({
    client_member_id: {
        type: String,
        unique: true,
        // required: true,
    },
    name: {
        type: String,
        required: false,
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
        type: Number,
        required: false,
    },
    birthday_month: {
        type: Number,
        required: false,
    },
    birthday_date: {
        type: Number,
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
    orders: {
        type: [orderSchema],
        default: [],
    },
});

const Member = mongoose.model("members", memberSchema);

const newAttribute = async (id, attributes) => {
    console.log("check here attribute");
    try {
        const filter = { _id: id };
        const update = {
            $set: attributes,
        };
        const doc = await Member.findOneAndUpdate(filter, update, {
            new: true,
        });
        console.log("updated doc:", doc);
        return doc;
    } catch (e) {
        return e;
    }
};

const newOrder = async (id, order) => {
    try {
        const doc = await Member.findOneAndUpdate(
            { _id: id },
            {
                $push: { orders: order },
            },
            {
                new: true,
            }
        );
        console.log("newOrder", doc);
        return doc;
    } catch (e) {
        console.error(e);
        return e;
    }
};

const delOrder = async (id, order) => {
    try {
        const filter = { _id: id };
        const update = {
            $pull: { orders: order },
        };
        const doc = await Member.findOneAndUpdate(filter, update, {
            new: true,
        });
        console.log("updated doc:", doc);
        return doc;
    } catch (e) {
        return e;
    }
};

const checkMemberId = async (id) => {
    console.log("check here");
    const isInDb = await Member.findOne({ _id: id });
    if (!isInDb) {
        return false;
    } else {
        return true;
    }
};

export { Member, newAttribute, newOrder, delOrder, checkMemberId };
