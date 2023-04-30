import { pushOrderTest } from "./index.js";

async function testPushOrder() {
    const body = {
        id: "64442050043a5e04eb1c03d4",
        order: {
            order_id: 12345,
            date: "2022-05-01",
            amount: 50,
            products: ["T-shirt", "Jeans"],
        },
    };

    const result = await pushOrderTest(body);

    console.log(result);
}

testPushOrder();
