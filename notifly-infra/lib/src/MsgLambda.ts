import * as path from "path";
import * as assert from "assert";

import { aws_lambda as lambda, aws_iam as iam, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Duration, RemovalPolicy } from "aws-cdk-lib/core";
import * as dotenv from "dotenv";

import { toCapCamel } from "../util";
dotenv.config({ path: path.join(__dirname, "../../..", ".env") });

export interface MsgLambdaProps {
    readonly code: lambda.Code;
    readonly handler: string;
    readonly functionName: string;
    readonly description?: string;
    environment?: {
        [key: string]: string;
    };
}

const REGION = process.env.REGION || "ap-northeast-1";
const { jwtSecret, lambdaUpdateDb } = process.env;
assert.ok(jwtSecret, "`jwtSecret` not defined.");
assert.ok(lambdaUpdateDb, "`lambdaUpdateDb` not defined.");

export class MsgLambda extends Construct {
    lambdaFn: lambda.Function;
    constructor(scope: Construct, id: string, props: MsgLambdaProps) {
        super(scope, id);
        const lambdaRole = iam.Role.fromRoleArn(
            this,
            "Role",
            "arn:aws:iam::331982771565:role/Lambda-enable-access-s3-function-role"
        );
        const deafultProps = {
            runtime: lambda.Runtime.NODEJS_18_X,
            currentVersionOptions: {
                removalPolicy: RemovalPolicy.DESTROY,
            },
            timeout: Duration.minutes(15),
            role: lambdaRole,
        };
        props.environment = {
            ...props.environment,
            REGION,
            jwtSecret: jwtSecret as string,
            lambdaUpdateDb: lambdaUpdateDb as string,
        };
        this.lambdaFn = new lambda.Function(this, toCapCamel(props.functionName), { ...props, ...deafultProps });
    }
}
