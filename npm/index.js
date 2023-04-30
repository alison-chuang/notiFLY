import axios from "axios";
import * as https from "https";
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    // cert: fs.readFileSync(cert),
});

const pushMember = async (body, apiKey) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            httpsAgent: httpsAgent,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
        };
        const response = await axios.post(url, body, config);
        return { data: response.data._id };
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const updateMember = async (body, apiKey) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            httpsAgent: httpsAgent,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
        };
        const response = await axios.put(url, body, config);
        return response.data;
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const deleteMember = async (body, apiKey) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            httpsAgent: httpsAgent,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
        };
        const response = await axios.delete(url, body, config);
        return response.data;
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const pushOrder = async (body, apiKey) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            httpsAgent: httpsAgent,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
        };
        const response = await axios.post(url, body, config);
        return { data: "order updated" };
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

const deleteOrder = async (body, apiKey) => {
    try {
        const url = "https://gotolive.online/api/1.0/members/";
        const config = {
            httpsAgent: httpsAgent,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            },
        };
        const response = await axios.put(url, body, config);
        return { data: "order deleted" };
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};

export { pushMember, updateMember, deleteMember, pushOrder, deleteOrder, pushOrderTest };

// test package function here
const pushOrderTest = async (body) => {
    try {
        const url = "http://localhost:3000/api/1.0/members/order";
        const config = {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "16e9d4cc-cac0-471c-b3a9-d123dbcb70a9",
            },
        };

        const body = {
            id: "64442050043a5e04eb1c03d4",
            order: {
                order_id: 1234,
                date: "2022-05-01",
                amount: 50,
                products: ["T-shirt", "Jeans"],
            },
        };

        const response = await axios.post(url, body, config);
        return { data: "order updated" };
    } catch (e) {
        console.error(e.message);
        return e.message;
    }
};
