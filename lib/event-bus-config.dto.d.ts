export declare class EventBusConfigCredentialsDto {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}
export declare class EventBusConfigApiDto {
    timeout: string;
    version: string;
    endpoint?: string;
}
export declare class EventBusConfigQueueDto {
    queueNameIsolation: boolean;
    queueNamePrefix: string;
    maxMessagesPerBatch: number;
    emptyQueueSleepTime: string;
    pollingWaitTime: string;
    maxParallelPollingCalls: number;
}
export declare class EventBusConfigDto {
    credentials: EventBusConfigCredentialsDto;
    sqs: EventBusConfigApiDto;
    sns: EventBusConfigApiDto;
    queue: EventBusConfigQueueDto;
}
