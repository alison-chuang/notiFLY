import dotenv from "dotenv";
dotenv.config();
const { REGION, SEGMENT_BUCKET_NAME, IMAGE_BUCKET_NAME, IMAGE_OBJECT_KEY } = process.env;

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
const s3Client = new S3Client({ region: REGION });

import { randomBytes } from "./util.js";

// TODO Upload segment email data to S3
const rawBytes = await randomBytes(16);

// Read the JSON file containing the list of emails
// const emailList = ["mmiinnrruu13579@gmail.com", "alison.mjchuang@gmail.com"];
// const jsonContent = JSON.stringify(emailList);

const sendToS3 = async (jsonInfo, campaignName) => {
    const emailObjectKey = Date() + campaignName + rawBytes.toString("hex") + ".json";
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
        const s3Uri = `s3://${SEGMENT_BUCKET_NAME}/${emailObjectKey}`;
        return s3Uri;
    } catch (e) {
        console.error(e);
    }
};

// TODO:get presigned URL for client uploading image
async function generateImageURL() {
    try {
        const imageBucket = IMAGE_BUCKET_NAME;
        const rawBytes = await randomBytes(16);
        const imageName = rawBytes.toString("hex");

        const params = {
            Bucket: imageBucket,
            Key: imageName,
            Expires: 600,
        };

        const imageUrl = await s3.getSignedUrlPromise("putObject", params);
        console.log("got s3 url for image upload");
        return imageUrl;
    } catch (e) {
        console.log(e);
    }
}

export { sendToS3, generateImageURL };
