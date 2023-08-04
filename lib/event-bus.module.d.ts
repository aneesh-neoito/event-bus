import { OnModuleInit, DynamicModule } from '@nestjs/common';
import { EventBus } from './event-bus';
export declare class EventBusModule implements OnModuleInit {
    private readonly eventBus;
    constructor(eventBus: EventBus);
    onModuleInit(): Promise<void>;
    static forRoot(): DynamicModule;
}
