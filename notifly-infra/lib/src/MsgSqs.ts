import { aws_sqs as sqs } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib/core";
import { toCapCamel } from "../util";

export interface MsgSqsProps extends sqs.QueueProps {
    readonly queueName: string;
}

export class MsgSqs extends Construct {
    mainQueue: sqs.Queue;
    constructor(scope: Construct, id: string, props: MsgSqsProps) {
        super(scope, id);
        const dlq = new sqs.Queue(this, `${toCapCamel(props.queueName)}DLQ`, {
            queueName: `${props.queueName}-dlq`,
        });

        const deafultProps = {
            receiveMessageWaitTime: Duration.seconds(20),
            deadLetterQueue: {
                maxReceiveCount: 2,
                queue: dlq,
            },
            visibilityTimeout: Duration.minutes(15),
        };
        this.mainQueue = new sqs.Queue(this, toCapCamel(props.queueName), { ...props, ...deafultProps });
    }
}
