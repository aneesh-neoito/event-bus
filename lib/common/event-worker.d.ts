import { EventBus } from '../event-bus';
export declare abstract class EventWorker {
    protected abstract eventBus: EventBus;
    onEvent: string;
    constructor(eventBus: EventBus, event: any);
    abstract handle(event: any): Promise<void>;
    /**
     * Indicates if a dead letter queue should be created for this worker.
     * Defaults to `true`.
     */
    get deadLetterEnabled(): boolean;
    /**
     * Indicates the number of times workers can try to process the same message
     * before it gets sent to the dead letter queue; Defaults to `10`.
     *
     * Discussion: this property is never called if `deadLetterEnabled` returns
     * `false`.
     */
    get maxReceiveCount(): number;
}
