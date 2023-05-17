import { Construct } from "constructs";
import { aws_lambda_event_sources as lambdaEventSources } from "aws-cdk-lib";
import { MsgLambda, MsgLambdaProps } from "./MsgLambda";
import { MsgSqs, MsgSqsProps } from "./MsgSqs";

interface MsgChainProps {
    lambdaProps: MsgLambdaProps;
    sqsProps: MsgSqsProps;
}

export class MsgChain extends Construct {
    constructor(scope: Construct, id: string, props: MsgChainProps) {
        super(scope, id);

        const msgLambda = new MsgLambda(this, "LambdaFn", props.lambdaProps);
        const msgSqs = new MsgSqs(this, "Queue", props.sqsProps);

        msgLambda.lambdaFn.addEventSource(
            new lambdaEventSources.SqsEventSource(msgSqs.mainQueue, { batchSize: 1, maxConcurrency: 2 })
        );
    }
}
