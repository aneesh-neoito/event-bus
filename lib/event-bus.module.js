"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventBusModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusModule = void 0;
const common_1 = require("@nestjs/common");
const log_1 = require("@nestjs-nodo/log");
const event_bus_1 = require("./event-bus");
const event_dispatcher_1 = require("./event-dispatcher");
const event_bus_core_module_1 = require("./event-bus-core.module");
let EventBusModule = EventBusModule_1 = class EventBusModule {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async onModuleInit() {
        await this.eventBus.initialize();
    }
    static forRoot() {
        return {
            global: true,
            module: EventBusModule_1,
            imports: [
                event_bus_core_module_1.EventBusCoreModule.forRoot(),
                log_1.LogModule.forFeature(event_bus_1.EventBus),
            ],
            providers: [event_bus_1.EventBus, event_dispatcher_1.EventDispatcher],
            exports: [event_bus_1.EventBus],
        };
    }
};
EventBusModule = EventBusModule_1 = __decorate([
    common_1.Module({}),
    __metadata("design:paramtypes", [event_bus_1.EventBus])
], EventBusModule);
exports.EventBusModule = EventBusModule;
