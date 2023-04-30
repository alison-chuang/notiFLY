import dotenv from "dotenv";
dotenv.config();
const { REGION, SENDER } = process.env;

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
const sesClient = new SESClient({ region: REGION });

const sendEmail = async (content, subject, segmentList) => {
    const emailParams = {
        Destination: {
            ToAddresses: [segmentList],
        },
        Message: {
            Body: {
                Text: {
                    Data: content,
                },
            },
            Subject: {
                Data: subject,
            },
        },
        Source: SENDER,
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    try {
        const response = await sesClient.send(sendEmailCommand);
        console.log("Email sent:", response.MessageId);
    } catch (e) {
        console.error("Failed to send email:", e);
    }
};

// 重置密碼連結信
const sendResetEmail = async (email, content) => {
    const emailParams = {
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Text: {
                    Data: `Please reset your password via this link ${content} within one day, thanks!`,
                },
            },
            Subject: {
                Data: "Reset Password of notiFLY",
            },
        },
        Source: SENDER,
    };

    const sendEmailCommand = new SendEmailCommand(emailParams);

    try {
        const response = await sesClient.send(sendEmailCommand);
        console.log("Email sent:", response.MessageId);
    } catch (e) {
        console.error("Failed to send email:", e);
    }
};

export { sendEmail, sendResetEmail };
