import dotenv from "dotenv";
dotenv.config();
const { REGION, SQS_URL } = process.env;

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqs = new SQSClient({ region: REGION });
const sqsURL = SQS_URL;
const GROUP_COUNT = 3;

const sendMessage = async (msg) => {
    const record = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: sqsURL,
        // MessageGroupId: "group-1",
    };
    const command = new SendMessageCommand(record);
    const result = await sqs.send(command);
    result._id = msg._id;
    return result;
};

const sendMessages = async (list) => {
    const results = list.map((msg) => sendMessage(msg));
    return results;
};

export { sendMessage, sendMessages };
