var aws = require("aws-sdk");
var ses = new aws.SES({ region: "ap-northeast-1" });

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    const body = JSON.parse(event.Records[0].body);
    console.log("Received Body:", body);
    const emails = body.info.emails;
    const messageVariant = body["message variant"];

    const params = {
        Destination: {
            // 不能直接拿 info.emails，要去 S3 拿
            ToAddresses: body.info.emails,
        },
        Message: {
            Body: {
                Text: { Data: messageVariant.copy },
            },

            Subject: { Data: messageVariant.subject },
        },
        Source: messageVariant.source,
    };

    return ses.sendEmail(params).promise();
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
