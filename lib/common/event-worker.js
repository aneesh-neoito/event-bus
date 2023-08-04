"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventWorker = void 0;
class EventWorker {
    constructor(eventBus, event) {
        this.onEvent = event.id;
        eventBus.register(this);
    }
    /**
     * Indicates if a dead letter queue should be created for this worker.
     * Defaults to `true`.
     */
    get deadLetterEnabled() {
        return true;
    }
    /**
     * Indicates the number of times workers can try to process the same message
     * before it gets sent to the dead letter queue; Defaults to `10`.
     *
     * Discussion: this property is never called if `deadLetterEnabled` returns
     * `false`.
     */
    get maxReceiveCount() {
        return 10;
    }
}
exports.EventWorker = EventWorker;
