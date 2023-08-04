"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const _ = require("lodash");
class Event {
    constructor(data) {
        this.data = data;
        this.id = _.kebabCase(this.constructor.name);
    }
    static get id() {
        return _.kebabCase(this.name);
    }
}
exports.Event = Event;
