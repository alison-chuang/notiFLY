import Ajv from "ajv";
import { Member, newAttribute, newOrder, delOrder, checkMemberId } from "../model/member.js";
import { newMemberSchema } from "../util/util.js";

// save campaign info to db
const postMember = async (req, res) => {
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

export { postMember, updateMember, updateOrder, deleteOrder };
