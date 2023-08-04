import { TConfigMap } from '@nestjs-nodo/config';
import { EventBusConfigDto } from './event-bus-config.dto';
import { DynamicModule } from '@nestjs/common';
export declare class EventBusCoreModule {
    static forRoot(config?: TConfigMap<EventBusConfigDto>): DynamicModule;
}
