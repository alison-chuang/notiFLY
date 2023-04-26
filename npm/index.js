import axios from "axios";
import * as https from "https";
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    // cert: fs.readFileSync(cert),
});

const pushMember = async (body) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            httpsAgent: httpsAgent,
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await axios.post(url, body, config);
        return { data: response.data._id };
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const updateMember = async (body) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await axios.put(url, body, config);
        return response.data;
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const deleteMember = async (body) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await axios.delete(url, body, config);
        return response.data;
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const pushOrder = async (body) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await axios.post(url, body, config);
        return { data: "order updated" };
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const deleteOrder = async (body) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await axios.put(url, body, config);
        return { data: "order deleted" };
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

export { pushMember, updateMember, deleteMember, pushOrder, deleteOrder };
