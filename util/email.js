import dotenv from "dotenv";
dotenv.config();
const { REGION, SENDER } = process.env;

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
const sesClient = new SESClient({ region: REGION });

// eDM
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

// reset password
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

    const response = await sesClient.send(sendEmailCommand);
    if (response.$metadata.httpStatusCode !== 200) {
        console.error("Failed to send email:", response.$metadata.httpStatusCode);
        return { success: false, error: `${response.$metadata.httpStatusCode}` };
    }
    return { success: true };
};

export { sendEmail, sendResetEmail };
