// lambda send web-push & update db
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import axios from "axios";
import webpush from "web-push";
const s3 = new S3Client({ region: process.env.REGION });

export async function handler(event) {
    // get event（message variant) from SQS
    console.log(JSON.stringify(event));
    const body = JSON.parse(event.Records[0].body);
    console.log("Parsed Body:", body);

    // get member subscriptions from s3
    const receivers = await getSubList(body.bucket, body.s3fileName);
    console.log({ receivers });

    // Create payload
    const messageVariant = body["message_variant"];
    const payload = JSON.stringify({
        title: messageVariant.title,
        body: messageVariant.copy,
        icon: messageVariant.image,
        url: "https:/www.google.com",
    });

    const publicVapidKey = process.env.publicVapidKey;
    const privateVapidKey = process.env.privateVapidKey;
    webpush.setVapidDetails("mailto:test@test.com", publicVapidKey, privateVapidKey);

    // Pass object into sendNotification => send
    let succeedCount = 0;
    let failCount = 0;
    for (let receiver of receivers) {
        try {
            let response = await webpush.sendNotification(receiver, payload);
            console.log("sent", response.statusCode); //201
            if (response.statusCode == "201") {
                succeedCount += 1;
            } else {
                failCount += 1;
            }
        } catch (e) {
            failCount += 1;
            console.error(e);
        }
    }

    console.log(succeedCount, failCount);

    // go update DB
    const idWithoutSuffix = body._id.split("_")[0];
    await goUpdateDb(idWithoutSuffix, body.job_id, succeedCount, failCount);
    return;
}

async function goUpdateDb(id, job_id, succeedCount, failCount) {
    const body = {
        _id: id,
        job_id: job_id,
        succeedCount,
        failCount,
    };
    const config = { headers: { "Content-Type": "application/json" }, strictSSL: false };
    try {
        const res = await axios.post(process.env.lambdaUpdateDb, body, config);
        console.log("axios res", res);
        console.log("axios response", res.data);
    } catch (e) {
        console.error(e);
    }
}

async function getSubList(bucket, s3fileName) {
    const input = {
        Bucket: bucket, // required
        Key: s3fileName, // required
    };
    const command = new GetObjectCommand(input);
    const response = await s3.send(command);
    const str = await response.Body.transformToString();
    return JSON.parse(str);
}
