"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusCoreModule = void 0;
const config_1 = require("@nestjs-nodo/config");
const event_bus_config_dto_1 = require("./event-bus-config.dto");
const consts_1 = require("./consts");
class EventBusCoreModule {
    static forRoot(config = event_bus_config_dto_1.EventBusConfigDto) {
        return {
            global: true,
            module: EventBusCoreModule,
            imports: [
                config_1.ConfigModule.forFeature(config),
            ],
            providers: [
                {
                    provide: consts_1.EVENT_BUS_CONFIG,
                    inject: [config_1.getConfigToken(config)],
                    useFactory: (value) => value,
                }
            ],
            exports: [consts_1.EVENT_BUS_CONFIG],
        };
    }
}
exports.EventBusCoreModule = EventBusCoreModule;
