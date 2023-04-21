import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
const REGION = "ap-northeast-1";
const ses = new SESClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

export async function handler(event) {
    // get event from SQS
    console.log(JSON.stringify(event));
    const body = JSON.parse(event.Records[0].body);
    console.log("Parsed Body:", body);
    const messageVariant = body["message_variant"];

    // get emails from s3
    const emails = await getEmailList(body.bucket, body.emailKey);
    console.log({ emails });

    // send edm via SES
    console.time("sending edm respectively");
    let succeedCount = 0;
    let failCount = 0;
    for (let email of emails) {
        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Html: { Data: messageVariant.html },
                },

                Subject: { Data: messageVariant.subject },
            },
            Source: messageVariant.source,
        });

        try {
            let response = await ses.send(command);
            console.log(response);
            if (response.$metadata.httpStatusCode == "200") {
                succeedCount += 1;
            } else {
                failCount += 1;
            }
        } catch (error) {
            failCount += 1;
            console.error(error);
        }
    }
    console.timeEnd("sending edm respectively");
    const idWithoutSuffix = body["_id"].split("_")[0];
    const updated = await goUpdateDb(idWithoutSuffix, succeedCount, failCount);
    return;
}

async function goUpdateDb(id, succeedCount, failCount) {
    const body = {
        _id: id,
        succeedCount,
        failCount,
    };
    const config = { headers: { "Content-Type": "application/json" } };
    try {
        const res = await axios.post(process.env.lambdaUpdateDb, body, config);
        console.log("axios res", res);
        console.log("axios response", res.data);
    } catch (e) {
        console.error(e);
    }
}

async function getEmailList(bucket, emailKey) {
    const input = {
        Bucket: bucket, // required
        Key: emailKey, // required
    };
    const command = new GetObjectCommand(input);
    const response = await s3.send(command);
    const str = await response.Body.transformToString();
    return JSON.parse(str);
}
