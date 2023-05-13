import mongoose from "mongoose";
const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        order_id: {
            type: String,
            unique: false,
            index: false,
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
    },
    { autoIndex: false }
);

const subscriptionSchema = new Schema({
    endpoint: {
        type: String,
        required: true,
    },
    expirationTime: {
        type: Date,
        default: null,
    },
    keys: {
        p256dh: {
            type: String,
            required: true,
        },
        auth: {
            type: String,
            required: true,
        },
    },
});

const memberSchema = new Schema(
    {
        client_member_id: {
            type: String,
            unique: true,
            required: true,
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
            type: String,
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
        subscription: {
            type: subscriptionSchema,
        },
    },
    {
        timestamps: true,
    }
);

// // middleware
// memberSchema.pre("save", function (next) {
//     this.total_purchase_count = this.orders.length;
//     this.total_spending = this.orders.reduce(
//         (total, order) => total + order.amount,
//         0
//     );
//     next();
// });

const Member = mongoose.model("members", memberSchema);

const createMember = async (data) => {
    const member = new Member(data);
    return await member.save();
};

const updateMember = async (id, attributes) => {
    const filter = { _id: id };
    const update = { $set: attributes };
    return await Member.findOneAndUpdate(filter, update, { new: true });
};

const delMember = async (id) => {
    const filter = { _id: id };
    return await Member.findOneAndDelete(filter);
};

const newOrder = async (id, order) => {
    try {
        const doc = await Member.findOneAndUpdate(
            { _id: id },
            {
                $push: {
                    orders: order,
                },
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

const selectCity = async () => {
    const cities = await Member.find({}, { city: 1, _id: 0 });
    return cities;
};

const matchMember = async (query) => {
    const counts = await Member.countDocuments(query);
    return counts;
};

export { Member, createMember, updateMember, newOrder, delOrder, checkMemberId, selectCity, matchMember, delMember };
