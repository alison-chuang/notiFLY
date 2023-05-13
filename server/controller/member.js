import { v4 as uuidv4 } from "uuid";
import { createMember, checkMemberId, delMember, delOrder, Member, updateMember, newOrder } from "../model/member.js";
import { selectAllKey, updateOldKeys, createKey } from "../model/key.js";
import csv from "csvtojson";

// save member info to db
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
            return res.status(400).json({ data: "No matched member with request id" });
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
        return res.status(400).json({ data: "No matched member with request id" });
    }
    res.status(200).json({ data: "deleted" });
};

const updateOrder = async (req, res) => {
    const { id, order } = req.body;

    // check member in db
    const isMember = await checkMemberId(id);
    if (!isMember) {
        return res.status(400).json({ data: "bad request" });
    }

    // $push : new order
    try {
        const updated = await newOrder(id, order);
        return res.status(200).json({ data: "DB updated" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: "fail to update" });
    }
};

const deleteOrder = async (req, res) => {
    console.log("client update member data:", req.body);
    const { id, order } = req.body;

    if (!id || !order.order_id) {
        return res.status(400).json({ data: "bad request" });
    }

    // check member in db
    const isMember = await checkMemberId(id);
    if (!isMember) {
        return res.status(400).json({ data: "bad request" });
    }

    // $: delete order
    try {
        const updated = await delOrder(id, order);
        return res.status(200).json({ data: "DB updated" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: "fail to delete" });
    }
};

// multer 上傳 csv 檔案 => save to db
// member
const uploadMemberCsv = async (req, res) => {
    console.log("member CSV received.");
    if (!req.file) {
        return res.status(400).json({ error: "Please select CSV file to upload!" });
    }
    try {
        // convert csvfile to jsonArray
        const jsonObj = await csv().fromFile(req.file.path);
        console.log(jsonObj);

        const data = await Member.insertMany(jsonObj, {
            ordered: false,
            rawResult: false,
        });
        // console.log("insertMany result", data);
        return res.status(200).json({ data: data.length });
    } catch (err) {
        console.error("err", err);
        console.error("errObj", err.writeErrors);
        // const e = err.writeErrors.map((e) => e.err);

        return res.status(400).json({
            data: {
                total: Object.keys(err.result.insertedIds).length,
                inserted: err.result.insertedCount,
                errors: err.writeErrors, // array
            },
        });
    }
};

//order
const uploadOrderCsv = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Please select CSV file to upload!" });
    }

    const jsonObj = await csv().fromFile(req.file.path);
    // console.log(jsonObj);

    // group by client_member_id
    const groupedData = jsonObj.reduce((acc, cur) => {
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
            products: cur.products.split(","),
        });
        acc[cur.client_member_id].total_spending += cur.amount;
        acc[cur.client_member_id].total_purchase_count += 1;
        return acc;
    }, {});
    console.log({ groupedData });

    // Find client_member_id that don't exist
    const memberIds = Object.keys(groupedData);
    const existingMembers = await Member.find({
        client_member_id: { $in: memberIds },
    });
    const existingMemberIds = existingMembers.map((member) => member.client_member_id);
    const nonExistingMemberIds = memberIds.filter((id) => !existingMemberIds.includes(id));

    // Check if there are non-existing members
    if (nonExistingMemberIds.length > 0) {
        return res.status(400).json({
            error: `The following member ids do not exist: ${nonExistingMemberIds.join(", ")}`,
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
        const result = await Member.bulkWrite(writeOperations);
        console.log("result", result);
        res.json({ message: result });
    } catch (e) {
        console.error(e);
        console.log(e.responseJSON.error);
        res.status(500).json({ error: e.responseJSON.error });
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
    updateOrder,
    deleteOrder,
    uploadMemberCsv,
    uploadOrderCsv,
    deleteMember,
    getKey,
    getAllKey,
};
