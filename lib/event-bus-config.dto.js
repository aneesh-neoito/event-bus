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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusConfigDto = exports.EventBusConfigQueueDto = exports.EventBusConfigApiDto = exports.EventBusConfigCredentialsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const config_1 = require("@nestjs-nodo/config");
class EventBusConfigCredentialsDto {
}
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigCredentialsDto.prototype, "accessKeyId", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigCredentialsDto.prototype, "secretAccessKey", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigCredentialsDto.prototype, "region", void 0);
exports.EventBusConfigCredentialsDto = EventBusConfigCredentialsDto;
class EventBusConfigApiDto {
}
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigApiDto.prototype, "timeout", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigApiDto.prototype, "version", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], EventBusConfigApiDto.prototype, "endpoint", void 0);
exports.EventBusConfigApiDto = EventBusConfigApiDto;
class EventBusConfigQueueDto {
}
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], EventBusConfigQueueDto.prototype, "queueNameIsolation", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigQueueDto.prototype, "queueNamePrefix", void 0);
__decorate([
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], EventBusConfigQueueDto.prototype, "maxMessagesPerBatch", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigQueueDto.prototype, "emptyQueueSleepTime", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], EventBusConfigQueueDto.prototype, "pollingWaitTime", void 0);
__decorate([
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], EventBusConfigQueueDto.prototype, "maxParallelPollingCalls", void 0);
exports.EventBusConfigQueueDto = EventBusConfigQueueDto;
let EventBusConfigDto = class EventBusConfigDto {
};
__decorate([
    class_transformer_1.Type(() => EventBusConfigCredentialsDto),
    class_validator_1.ValidateNested(),
    __metadata("design:type", EventBusConfigCredentialsDto)
], EventBusConfigDto.prototype, "credentials", void 0);
__decorate([
    class_transformer_1.Type(() => EventBusConfigApiDto),
    class_validator_1.ValidateNested(),
    __metadata("design:type", EventBusConfigApiDto)
], EventBusConfigDto.prototype, "sqs", void 0);
__decorate([
    class_transformer_1.Type(() => EventBusConfigApiDto),
    class_validator_1.ValidateNested(),
    __metadata("design:type", EventBusConfigApiDto)
], EventBusConfigDto.prototype, "sns", void 0);
__decorate([
    class_transformer_1.Type(() => EventBusConfigQueueDto),
    class_validator_1.ValidateNested(),
    __metadata("design:type", EventBusConfigQueueDto)
], EventBusConfigDto.prototype, "queue", void 0);
EventBusConfigDto = __decorate([
    config_1.Config({ name: 'event_bus' })
], EventBusConfigDto);
exports.EventBusConfigDto = EventBusConfigDto;
