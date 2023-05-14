import { v4 as uuidv4 } from "uuid";
import {
    createMember,
    delMember,
    delOrder,
    updateMember,
    updateOrder,
    insertManyMembers,
    getMembersByIds,
    bulkUpdateOrders,
} from "../model/member.js";
import { selectAllKey, updateOldKeys, createKey } from "../model/key.js";

// import with API
const postMember = async (req, res) => {
    const { body } = req;

    try {
        const newMember = await createMember(body);
        res.status(201).json({ data: newMember._id });
    } catch (err) {
        if (err.code == 11000) {
            return res.status(400).json({ data: "DuplicateKey in client_member_id or email." });
        }
        throw err;
    }
};

const updateMemberDetail = async (req, res) => {
    const { id } = req.body;
    const { body } = req;

    if (!id) {
        return res.status(400).json({ data: "Member id is required." });
    }

    try {
        const updatedMember = await updateMember(id, body);
        if (!updatedMember) {
            return res.status(400).json({ data: "No matched member with request id." });
        }
    } catch (err) {
        if (err.code == 11000) {
            return res.status(400).json({ data: "DuplicateKey in client_member_id or email." });
        }
        throw err;
    }
    res.status(200).json({ data: "updated" });
};

const deleteMember = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ data: "Member id is required." });
    }

    const deletedMember = await delMember(id);
    if (!deletedMember) {
        return res.status(400).json({ data: "No matched member with request id." });
    }
    res.status(200).json({ data: "deleted" });
};

const updateOrderDetail = async (req, res) => {
    const { id, order } = req.body;

    if (!id) {
        return res.status(400).json({ data: "Member id is required." });
    }

    try {
        const updatedOrder = await updateOrder(id, order);
        if (!updatedOrder) {
            return res.status(400).json({ data: "No matched member with request id." });
        }
    } catch (err) {
        if (err.code == 11000) {
            return res.status(400).json({ data: "DuplicateKey in order_id." });
        }
        throw err;
    }
    res.status(200).json({ data: "updated" });
};

const deleteOrder = async (req, res) => {
    const { id, order_id } = req.body;

    if (!id) {
        return res.status(400).json({ data: "Member id is required." });
    }

    const deletedOrder = await delOrder(id, order_id);
    if (!deletedOrder) {
        return res.status(400).json({ data: "No matched member / order." });
    }
    res.status(200).json({ data: "deleted" });
};

// import with CSV
const uploadMemberCsv = async (req, res) => {
    const { jsonObjs } = req.body;

    try {
        const insertedCount = await insertManyMembers(jsonObjs);
        return res.status(201).json({ data: insertedCount });
    } catch (err) {
        return res.status(400).json({ data: err });
    }
};

const uploadOrderCsv = async (req, res) => {
    const { jsonObjs } = req.body;
    // group by id
    const groupedData = jsonObjs.reduce((acc, cur) => {
        if (!acc[cur.client_member_id]) {
            acc[cur.client_member_id] = {
                orders: [],
                total_spending: 0,
                total_purchase_count: 0,
            };
        }
        acc[cur.client_member_id].orders.push({
            order_id: cur.order_id,
            date: cur.date,
            amount: cur.amount,
            products: cur.products,
        });
        acc[cur.client_member_id].total_spending += cur.amount;
        acc[cur.client_member_id].total_purchase_count += 1;
        return acc;
    }, {});
    console.log({ groupedData });

    // Find id that doesn't exist
    const memberIds = Object.keys(groupedData);
    const existingMembers = await getMembersByIds(memberIds);
    const existingMemberIds = existingMembers.map((member) => member.client_member_id);
    const nonExistingMemberIds = memberIds.filter((id) => !existingMemberIds.includes(id));

    // Check non-existing members
    if (nonExistingMemberIds.length > 0) {
        return res.status(400).json({
            data: `The following member id do not exist: ${nonExistingMemberIds.join(", ")}`,
            not_exist: nonExistingMemberIds,
        });
    }

    // bulkWrite to DB
    const writeOperations = Object.entries(groupedData).map(
        ([client_member_id, { orders, total_spending, total_purchase_count }]) => {
            return {
                updateOne: {
                    filter: { client_member_id },
                    update: {
                        $push: { orders: { $each: orders } },
                        $inc: { total_spending, total_purchase_count },
                    },
                    upsert: false,
                },
            };
        }
    );

    try {
        const modifiedCount = await bulkUpdateOrders(writeOperations);
        res.json({ data: modifiedCount });
    } catch (e) {
        res.status(400).json({ data: e.message });
    }
};

// generate api key
const getKey = async (req, res) => {
    const { id } = req.payload;
    const apiKey = uuidv4();
    const data = {
        user_id: id,
        key: apiKey,
    };

    // adjust old key expiration date
    await updateOldKeys();

    const newKey = await createKey(data);
    res.status(200).json({ data: newKey });
};

const getAllKey = async (req, res) => {
    const allKeys = await selectAllKey();
    return res.status(200).json({ data: allKeys });
};

export {
    postMember,
    updateMemberDetail,
    updateOrderDetail,
    deleteOrder,
    uploadMemberCsv,
    uploadOrderCsv,
    deleteMember,
    getKey,
    getAllKey,
};
