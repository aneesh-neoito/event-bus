import { EventBusConfigDto } from './event-bus-config.dto';
interface IQueueDescriptor {
    arn: string;
    url: string;
}
export declare class EventDispatcher {
    private readonly config;
    private APP_NAME;
    private APP_ENV;
    private sns;
    private sqs;
    private topicArn;
    private machineId;
    constructor(config: EventBusConfigDto);
    private bindAws;
    private getMachineId;
    private getNamespacePrefix;
    start(): Promise<string>;
    private getTopicArn;
    private createOrGetTopic;
    publish(eventId: string, data: object): Promise<string>;
    createOrGetQueue(queueId: string, shouldCreateDeadLetter: boolean, maxReceiveCount: number): Promise<IQueueDescriptor>;
    private createQueue;
    createSubscription(queueArn: string, filterPolicy: {
        eventId: string[];
    }): Promise<void>;
    getEvents(queueUrl: string, maxEvents: number, waitTime: number): Promise<Array<{
        id: string;
        receipt: string;
        queueUrl: string;
        data: any;
    }>>;
    deleteEvent(queueUrl: string, receiptId: string): Promise<void>;
}
export {};
