import * as path from "path";
import * as assert from "assert";

import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { MsgChain } from "./src/MsgChain";
import { toHyphenLower } from "./util";

import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../../..", ".env") });
const { WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY } = process.env;
assert.ok(WEB_PUSH_PUBLIC_KEY, "`WEB_PUSH_PUBLIC_KEY` not defined.");
assert.ok(WEB_PUSH_PRIVATE_KEY, "`WEB_PUSH_PRIVATE_KEY` not defined.");

export class NotiflyInfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const stackName = toHyphenLower(Stack.of(this).stackName);

        const edm = new MsgChain(this, "Edm", {
            lambdaProps: {
                code: lambda.Code.fromAsset("asset/edm"),
                handler: "edm-consumer.handler",
                functionName: `${stackName}-edm-consumer`,
            },
            sqsProps: {
                queueName: `${stackName}-edm-queue`,
            },
        });

        const webPush = new MsgChain(this, "WebPush", {
            lambdaProps: {
                code: lambda.Code.fromAsset("asset/web-push"),
                handler: "web-push-consumer.handler",
                functionName: `${stackName}-web-push-consumer`,
                environment: {
                    privateVapidKey: WEB_PUSH_PRIVATE_KEY as string,
                    publicVapidKey: WEB_PUSH_PUBLIC_KEY as string,
                },
            },
            sqsProps: {
                queueName: `${stackName}-web-push-queue`,
            },
        });
    }
}
