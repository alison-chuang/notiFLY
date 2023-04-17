import dotenv from "dotenv";
dotenv.config();
const { REGION, SEGMENT_BUCKET_NAME, IMAGE_BUCKET_NAME, IMAGE_OBJECT_KEY } = process.env;

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3Client = new S3Client({ region: REGION });

import { randomBytes } from "./util.js";

// Upload segment email data to S3
const rawBytes = await randomBytes(4);

const sendToS3 = async (jsonInfo, campaignName, extraSuffix = null) => {
    const emailObjectKey = `${campaignName}_${new Date().toISOString()}_${rawBytes.toString("hex")}${
        extraSuffix !== null ? "_" + extraSuffix : ""
    }.json`;
    const uploadParams = {
        Bucket: SEGMENT_BUCKET_NAME,
        Key: emailObjectKey,
        Body: jsonInfo,
        ContentType: "application/json",
    };

    try {
        const uploadCommand = new PutObjectCommand(uploadParams);
        await s3Client.send(uploadCommand);
        console.log("segment member info uploaded done");
        // const url = `https://${SEGMENT_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${emailObjectKey}`;
        // const s3Uri = `s3://${SEGMENT_BUCKET_NAME}/${emailObjectKey}`;
        return [SEGMENT_BUCKET_NAME, emailObjectKey];
    } catch (e) {
        console.error(e);
    }
};

// get presigned URL for client uploading image
async function generateImageURL() {
    try {
        const imageBucket = IMAGE_BUCKET_NAME;
        const rawBytes = await randomBytes(8);
        const imageName = rawBytes.toString("hex");
        const expirationTime = 3600;

        const params = {
            Bucket: imageBucket,
            Key: imageName,
        };

        const command = new PutObjectCommand(params);
        const imageUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationTime });
        console.log("got s3 presigned url for client upload img");
        return imageUrl;
    } catch (e) {
        console.log(e);
    }
}

// get 12 s3 images links to render frontend gallery
async function selectS3Images() {
    const imageBucket = IMAGE_BUCKET_NAME;
    const command = new ListObjectsV2Command({ Bucket: imageBucket, MaxKeys: 12 });
    const response = await s3Client.send(command);
    const host = `https://${imageBucket}.s3.${REGION}.amazonaws.com/`;

    let urls = [];
    for (let content of response.Contents) {
        let url = `${host}${content.Key}`;
        urls.push(url);
    }
    return urls;
}

export { sendToS3, generateImageURL, selectS3Images };
