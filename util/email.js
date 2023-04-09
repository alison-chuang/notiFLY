import dotenv from "dotenv";
dotenv.config();
const { REGION, SENDER } = process.env;

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
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
    } catch (error) {
        console.error("Failed to send email:", error);
    }
};

export { sendEmail };
