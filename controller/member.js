import Ajv from "ajv";
import { v4 as uuidv4 } from "uuid";
import { Member, newAttribute, delMember, newOrder, delOrder, checkMemberId } from "../model/member.js";
import { ApiKey, updateOldKeys, selecAllKey } from "../model/apiKey.js";
import { newMemberSchema } from "../util/util.js";
import csv from "csvtojson";

// save member info to db
const postMember = async (req, res) => {
    console.log(req.originalUrl, req.method);
    console.log("client push new members:", req.body);
    const { body } = req;
    const { email, cellphone } = req.body;

    // validate body format
    const ajv = new Ajv();
    const validate = ajv.compile(newMemberSchema);
    const isValid = validate(req.body);
    if (!isValid) {
        return res.status(400).json({ data: validate.errors });
    }

    // required fields
    if (!email || !cellphone) {
        return res.status(400).json({ data: "email and cellphone is required" });
    }
    // validate email, cellphone
    const tester = (regex, field) => {
        if (!regex.test(field)) {
            return res.status(400).send(`Invalid ${field}`);
        }
    };
    const emailRegex = /^[\w.+-]+@(?:[a-z\d-]+\.)+[a-z]{2,}$/g;
    const cellphoneRegex = /^([0-9]{4})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{3})$/;
    tester(emailRegex, email);
    tester(cellphoneRegex, cellphone);

    // save to DB
    try {
        const member = new Member(body);
        const newmember = await member.save();
        console.log("saved member to database");
        return res.status(201).json(newmember);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ data: e.message });
    }
};

// upadate
const updateMember = async (req, res) => {
    console.log("client update member data:", req.body);

    const { id } = req.body;
    const { body } = req;

    // check member in db
    const isMember = await checkMemberId(id);
    if (!isMember) {
        return es.status(400).json({ data: "bad request" });
    }

    // $set: object
    try {
        const updated = await newAttribute(id, body);
        console.log("updated newAttribute:", updated);
        return res.status(200).json({ data: "DB updated" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: "fail to update" });
    }
};
const deleteMember = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ data: "bad request" });
    }

    // check member in db
    const isMember = await checkMemberId(id);
    if (!isMember) {
        return res.status(400).json({ data: "bad request" });
    }

    // $: delete order
    try {
        await delMember(id);
        return res.status(200).json({ data: "DB updated" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ data: "fail to delete" });
    }
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
    if (!req.file) {
        return res.status(400).json({ error: "Please select CSV file to upload!" });
    }
    try {
        // convert csvfile to jsonArray
        const jsonObj = await csv().fromFile(req.file.path);
        console.log(jsonObj);

        const data = await Member.insertMany(jsonObj, { ordered: false, rawResult: false });
        // console.log("insertMany result", data);
        return res.status(200).json({ data: data.length });
    } catch (err) {
        console.error("err", err);
        // console.error("errObj", err.writeErrors);
        // const e = err.writeErrors.map((e) => e.err);

        return res.status(500).json({
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
            acc[cur.client_member_id] = { orders: [], total_spending: 0, total_purchase_count: 0 };
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
    const existingMembers = await Member.find({ client_member_id: { $in: memberIds } });
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

// generate key
const getKey = async (req, res) => {
    // generate key
    const { id } = req.payload;
    const apiKey = await uuidv4();
    const data = {
        user_id: id,
        key: apiKey,
    };

    try {
        // adjust old key expiration date first
        await updateOldKeys();

        const key = new ApiKey(data);
        const newKey = await key.save();
        res.status(200).json({ data: newKey });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "fail to generate key" });
    }
};

const checkKey = async (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
        return res.status(401).json({ error: "API key not found" });
    }

    try {
        const keyInDb = await ApiKey.findOne({ key: apiKey });

        if (!keyInDb) {
            return res.status(401).json({ error: "Invalid API key" });
        }

        if (keyInDb.expired_at < Date.now()) {
            return res.status(401).json({ error: "API key has expired" });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
    next();
};

// render all user for user_list page
const getAllKey = async (req, res) => {
    try {
        const allKeys = await selecAllKey();
        console.log(allKeys);
        return res.status(200).json({ data: allKeys });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ data: "get user failed" });
    }
};

export {
    postMember,
    updateMember,
    updateOrder,
    deleteOrder,
    uploadMemberCsv,
    uploadOrderCsv,
    deleteMember,
    getKey,
    checkKey,
    getAllKey,
};
