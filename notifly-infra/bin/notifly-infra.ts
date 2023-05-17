#!/usr/bin/env node
import { exec } from "child_process";
import * as path from "path";

import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { NotiflyInfraStack } from "../lib/notifly-infra-stack";

const app = new cdk.App();

function prepareLambdaDependency() {
    exec("npm i", { cwd: `${path.join(__dirname, "..")}/asset/edm` });
    exec("npm i", { cwd: `${path.join(__dirname, "..")}/asset/web-push` });
}

prepareLambdaDependency();
new NotiflyInfraStack(app, "NotiflyInfraStack", {
    /* If you don't specify 'env', this stack will be environment-agnostic.
     * Account/Region-dependent features and context lookups will not work,
     * but a single synthesized template can be deployed anywhere. */

    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "ap-northeast-1" },

    /* Uncomment the next line if you know exactly what Account and Region you
     * want to deploy the stack to. */
    // env: { account: '123456789012', region: 'us-east-1' },

    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
