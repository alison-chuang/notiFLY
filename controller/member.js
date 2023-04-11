import Ajv from "ajv";
import { Member } from "../model/member.js";
import { newMemberSchema } from "../util/util.js";

// save campaign info to db
const postMember = async (req, res) => {
    console.log("client push new members:", req.body);

    // validate body format
    const ajv = new Ajv();
    const validate = ajv.compile(newMemberSchema);
    const isValid = validate(req.body);
    if (!isValid) {
        return res.status(400).json({ data: validate.errors });
    }

    // required fields
    if (!email || !cellphone) {
        return res.status(400).json({ data: "email is required" });
    }
    // validate email, cellphone
    const tester = (regex, field) => {
        if (!regex.test(field)) {
            return res.status(400).send(`Invalid ${field}`);
        }
    };
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]+$/g;
    const cellphoneRegex = /^([0-9]{4})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{3})$/;
    tester(email, emailRegex);
    tester(cellphone, cellphoneRegex);

    // save to DB
    try {
        const member = new Member(data);
        const newmember = await member.save();
        console.log("saved member to database");
        res.status(201).json(newmember);
    } catch (e) {
        console.log(e);
        res.status(500).json({ data: e.message });
    }
};

// upadate
const updateMember = async (req, res) => {
    console.log("client update member data:", req.body);
};

export { postMember, updateMember };
