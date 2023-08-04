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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventBus_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const common_1 = require("@nestjs/common");
const log_1 = require("@nestjs-nodo/log");
const event_dispatcher_1 = require("./event-dispatcher");
const event_bus_failed_process_event_1 = require("./events/event-bus-failed-process-event");
const utils_1 = require("@nestjs-nodo/utils");
const consts_1 = require("./consts");
const event_bus_config_dto_1 = require("./event-bus-config.dto");
const ms = require("ms");
let EventBus = EventBus_1 = class EventBus {
    constructor(config, logger, eventDispatcher) {
        this.config = config;
        this.logger = logger;
        this.eventDispatcher = eventDispatcher;
    }
    async initialize() {
        let initialized = false;
        let retries = 0;
        while (!initialized) {
            try {
                const dispatcherId = await this.eventDispatcher.start();
                this.logger.info(`EventBus initialized and linked to "${dispatcherId}"`);
                initialized = true;
            }
            catch (err) {
                this.logger.error('EventBus failed to initialize', err);
                retries = retries + 1;
                await utils_1.AsyncUtils.sleep(1000);
            }
        }
    }
    async startProcessorRunner(runner, processor, queueUrl) {
        while (true) {
            // No problem to use while true because getEvents is awaiting for long polling timeout
            const events = await this.eventDispatcher.getEvents(queueUrl, this.config.queue.maxMessagesPerBatch, Math.floor(ms(this.config.queue.pollingWaitTime) / 1000));
            if (!events) {
                await utils_1.AsyncUtils.sleep(ms(this.config.queue.emptyQueueSleepTime));
                continue;
            }
            for (const event of events) {
                this.logger.info(`"${processor.constructor.name}" runner #${runner} got event "${event.id}" to process`);
                try {
                    await processor.handle({ data: event.data });
                    await this.eventDispatcher.deleteEvent(event.queueUrl, event.receipt);
                }
                catch (err) {
                    // dead letter might avoid this?
                    const summary = {
                        id: event.id,
                        processor: processor.constructor.name,
                        runner,
                        queueUrl,
                        err,
                    };
                    this.logger.error('Event processor has failed', err, { summary });
                    await this.emit(event_bus_failed_process_event_1.EventBusFailedProcessEvent, summary);
                }
            }
        }
    }
    async startProcessorRunners(maxRunners, queueUrl, processor) {
        const runners = Array(maxRunners)
            .fill(0)
            .map(async (_, idx) => {
            return this.startProcessorRunner(idx, processor, queueUrl);
        });
        await Promise.all(runners);
    }
    async register(processor) {
        const processorId = processor.constructor.name;
        let registered = false;
        let retries = 0;
        let queue;
        while (!registered) {
            try {
                queue = await this.eventDispatcher.createOrGetQueue(processorId, processor.deadLetterEnabled, processor.maxReceiveCount);
                await this.eventDispatcher.createSubscription(queue.arn, {
                    eventId: [processor.onEvent.toLowerCase()],
                });
                await this.startProcessorRunners(this.config.queue.maxParallelPollingCalls, queue.url, processor);
                this.logger.info(`EventBus registered "${processorId}" processor for "${processor.onEvent.toLowerCase()}" events on "${queue.url}"`, this);
                registered = true;
            }
            catch (err) {
                this.logger.error('EventBus failed to register processor', err, {
                    processorId,
                    retries,
                    config: this.config,
                });
                retries = retries + 1;
                await utils_1.AsyncUtils.sleep(1000);
            }
        }
    }
    async emit(eventType, eventData) {
        const event = new eventType(eventData);
        return this._emit(event.id, eventData);
    }
    async _emit(eventId, data) {
        let emmited = false;
        let retries = 0;
        while (!emmited) {
            try {
                await this.eventDispatcher.publish(eventId, data);
                emmited = true;
            }
            catch (err) {
                this.logger.error('EventBus failed to emit', err, {
                    eventId,
                    retries,
                    data,
                });
                retries = retries + 1;
                await utils_1.AsyncUtils.sleep(1000);
            }
        }
    }
};
EventBus = EventBus_1 = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(consts_1.EVENT_BUS_CONFIG)),
    __param(1, log_1.InjectLogger(EventBus_1)),
    __metadata("design:paramtypes", [event_bus_config_dto_1.EventBusConfigDto,
        log_1.Logger,
        event_dispatcher_1.EventDispatcher])
], EventBus);
exports.EventBus = EventBus;
