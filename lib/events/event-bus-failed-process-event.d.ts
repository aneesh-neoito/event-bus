import { Event } from '../common/event';
interface IFailedEventSummary {
    id: string;
    processor: string;
    runner: number;
    queueUrl: string;
    err: any;
}
export declare class EventBusFailedProcessEvent extends Event<IFailedEventSummary> {
}
export {};
