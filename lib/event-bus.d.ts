import { EventWorker } from './common/event-worker';
import { Logger } from '@nestjs-nodo/log';
import { EventDispatcher } from './event-dispatcher';
import { EventBusConfigDto } from './event-bus-config.dto';
export declare class EventBus {
    private readonly config;
    private readonly logger;
    private readonly eventDispatcher;
    constructor(config: EventBusConfigDto, logger: Logger, eventDispatcher: EventDispatcher);
    initialize(): Promise<void>;
    private startProcessorRunner;
    private startProcessorRunners;
    register(processor: EventWorker): Promise<void>;
    emit<T, K>(eventType: new (eventData: K) => T, eventData: K): Promise<void>;
    private _emit;
}
