import dotenv from "dotenv";
dotenv.config();
const { REGION, SQS_URL } = process.env;

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqs = new SQSClient({ region: REGION });

const sendMessage = async (msg, sqsURL) => {
    const record = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: sqsURL,
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
