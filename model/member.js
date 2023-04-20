import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    order_id: {
        type: String,
        unique: true,
    },
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
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    orders: {
        type: [orderSchema],
        default: [],
    },
    total_purchase_count: {
        type: Number,
        default: 0,
    },
    total_spending: {
        type: Number,
        default: 0,
    },
    products: {
        type: [String],
        default: [],
    },
});

// mongoose middleware
memberSchema.pre("save", function (next) {
    this.total_purchase_count = this.orders.length;
    this.total_spending = this.orders.reduce((total, order) => total + order.amount, 0);
    next();
});

memberSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
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
                // $addToSet: { products: { $each: order.products } },
                $inc: { total_spending: order.amount, total_purchase_count: 1 },
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
            $pull: { orders: { order_id: order.order_id } },
            $inc: { total_spending: -order.amount, total_purchase_count: -1 },
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

// get city in DB
const selectCity = async () => {
    const cities = await Member.find({}, { city: 1, _id: 0 });
    return cities;
};

// TODO:get member count based on segment filter
const matchMember = async (query) => {
    const counts = await Member.countDocuments(query);
    return counts;
};
/*
query: {
    '$and': [ {  birthday_month: 12 } ]
  }
*/

export { Member, newAttribute, newOrder, delOrder, checkMemberId, selectCity, matchMember };
