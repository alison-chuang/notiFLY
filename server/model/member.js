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
orderSchema.index({ order_id: 1 }, { unique: true });

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
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        cellphone: {
            type: String,
        },
        gender: {
            type: String,
        },
        birthday_year: {
            type: Number,
        },
        birthday_month: {
            type: Number,
        },
        birthday_date: {
            type: Number,
        },
        city: {
            type: String,
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

const updateOrder = async (id, order) => {
    const filter = { _id: id };
    const update = {
        $push: {
            orders: order,
        },
        $inc: { total_spending: order.amount, total_purchase_count: 1 },
    };
    return await Member.findOneAndUpdate(filter, update, { new: true });
};

const delOrder = async (id, orderId) => {
    const filter = { _id: id };
    const member = await Member.findOne({
        ...filter,
        "orders.order_id": orderId,
    });
    if (member) {
        const order = member.orders.filter((order) => order.order_id == orderId)[0];
        const update = {
            $pull: { orders: { order_id: orderId } },
            $inc: { total_spending: -order.amount, total_purchase_count: -1 },
        };
        return await Member.findOneAndUpdate(filter, update, { new: true });
    } else {
        return null;
    }
};

const insertManyMembers = async (jsonObjs) => {
    try {
        const insertedMember = await Member.insertMany(jsonObjs, {
            ordered: false,
            rawResult: false,
        });
        return insertedMember.length;
    } catch (err) {
        console.error("errObj", err.writeErrors);
        const errorObj = {
            total: Object.keys(err.result.insertedIds).length,
            inserted: err.result.insertedCount,
            errors: err.writeErrors,
        };
        throw errorObj;
    }
};

const getMembersByIds = async function (memberIds) {
    const existingMembers = await Member.find({
        client_member_id: { $in: memberIds },
    });
    return existingMembers;
};

const bulkUpdateOrders = async (writeOperations) => {
    try {
        const result = await Member.bulkWrite(writeOperations);
        return result.modifiedCount;
    } catch (err) {
        throw new Error(err.responseJSON.error);
    }
};

const selectCity = async () => {
    return await Member.find({}, { city: 1, _id: 0 });
};

const matchMember = async (query) => {
    return await Member.countDocuments(query);
};

export {
    Member,
    createMember,
    updateMember,
    updateOrder,
    delOrder,
    selectCity,
    matchMember,
    delMember,
    insertManyMembers,
    getMembersByIds,
    bulkUpdateOrders,
};
