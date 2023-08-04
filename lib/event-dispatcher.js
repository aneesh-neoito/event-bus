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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs-nodo/config");
const node_machine_id_1 = require("node-machine-id");
const ms = require("ms");
const AWS = require("aws-sdk");
const consts_1 = require("./consts");
const event_bus_config_dto_1 = require("./event-bus-config.dto");
let EventDispatcher = class EventDispatcher {
    constructor(config) {
        this.config = config;
        this.bindAws();
    }
    bindAws() {
        this.sns = new AWS.SNS(Object.assign(Object.assign({}, this.config.credentials), { httpOptions: {
                timeout: ms(this.config.sns.timeout)
            }, apiVersion: this.config.sns.version, endpoint: this.config.sns.endpoint }));
        this.sqs = new AWS.SQS(Object.assign(Object.assign({}, this.config.credentials), { httpOptions: {
                timeout: ms(this.config.sqs.timeout)
            }, apiVersion: this.config.sqs.version, endpoint: this.config.sqs.endpoint }));
    }
    getMachineId() {
        if (this.machineId) {
            return this.machineId;
        }
        if (this.config.queue.queueNameIsolation) {
            this.machineId = node_machine_id_1.machineIdSync().substring(0, 6);
        }
        else {
            this.machineId = '';
        }
        return this.machineId;
    }
    getNamespacePrefix() {
        if (!this.config.queue.queueNameIsolation) {
            return this.config.queue.queueNamePrefix.toLocaleLowerCase();
        }
        return [this.APP_NAME, this.APP_ENV, this.getMachineId()]
            .filter((e) => e)
            .join('-')
            .toLocaleLowerCase();
    }
    async start() {
        const topicName = this.getNamespacePrefix().concat(`-${this.constructor.name}`);
        this.topicArn = await this.createOrGetTopic(topicName);
        return this.topicArn;
    }
    async getTopicArn() {
        if (!this.topicArn) {
            return this.start();
        }
        return this.topicArn;
    }
    async createOrGetTopic(topicName) {
        const data = await this.sns.createTopic({ Name: topicName }).promise();
        if (!data) {
            throw new Error(`EventBus was unable to create the topic "${topicName}"`);
        }
        return data.TopicArn || '';
    }
    async publish(eventId, data) {
        const topicName = await this.getTopicArn();
        const published = await this.sns
            .publish({
            TopicArn: topicName,
            Message: JSON.stringify(data),
            MessageAttributes: {
                eventId: {
                    DataType: 'String',
                    StringValue: eventId.toLowerCase().trim(),
                },
            },
        })
            .promise();
        return published.MessageId || '';
    }
    async createOrGetQueue(queueId, shouldCreateDeadLetter, maxReceiveCount) {
        const queueName = `${this.getNamespacePrefix()}-${queueId}`;
        const queueData = await this.createQueue(queueName);
        const topicArn = await this.getTopicArn();
        const customPolicy = {
            Version: '2012-10-17',
            Id: 'EventBus_Policy',
            Statement: {
                Sid: `${queueName}-accept-sns-EventBus`,
                Effect: 'Allow',
                Principal: '*',
                Action: 'SQS:SendMessage',
                Resource: `${queueData.arn}`,
                Condition: {
                    ArnEquals: {
                        'aws:SourceArn': `${topicArn}`,
                    },
                },
            },
        };
        await this.sqs
            .setQueueAttributes({
            QueueUrl: queueData.url,
            Attributes: { Policy: JSON.stringify(customPolicy) },
        })
            .promise();
        if (shouldCreateDeadLetter) {
            const deadLetterQueue = await this.createQueue(`${queueName}-DL`);
            const redrivePolicy = {
                deadLetterTargetArn: deadLetterQueue.arn,
                maxReceiveCount,
            };
            await this.sqs
                .setQueueAttributes({
                QueueUrl: queueData.url,
                Attributes: { RedrivePolicy: JSON.stringify(redrivePolicy) },
            })
                .promise();
        }
        return queueData;
    }
    async createQueue(queueName) {
        const { QueueUrl } = await this.sqs
            .createQueue({ QueueName: queueName })
            .promise();
        if (!QueueUrl) {
            throw new Error(`EventBus was unable to create queue "${queueName}"`);
        }
        const { Attributes } = await this.sqs
            .getQueueAttributes({ QueueUrl, AttributeNames: ['QueueArn'] })
            .promise();
        if (!Attributes || !Attributes.QueueArn) {
            throw new Error(`EventBus was unable to get queue ARN "${queueName}"`);
        }
        return { url: QueueUrl, arn: Attributes.QueueArn };
    }
    async createSubscription(queueArn, filterPolicy) {
        const topicArn = await this.getTopicArn();
        const { SubscriptionArn } = await this.sns
            .subscribe({
            Protocol: 'sqs',
            TopicArn: topicArn,
            Endpoint: queueArn,
        })
            .promise();
        if (!SubscriptionArn) {
            throw new Error(`EventBus was unable to subscribe "${queueArn}" to "${topicArn}"`);
        }
        const subscriptionAttributes = await this.sns
            .setSubscriptionAttributes({
            SubscriptionArn,
            AttributeName: 'FilterPolicy',
            AttributeValue: JSON.stringify(filterPolicy),
        })
            .promise();
        if (!subscriptionAttributes) {
            throw new Error(`EventBus was unable to set FilterPolicy on "${SubscriptionArn}"`);
        }
    }
    async getEvents(queueUrl, maxEvents, waitTime) {
        const { Messages } = await this.sqs
            .receiveMessage({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxEvents,
            WaitTimeSeconds: waitTime,
        })
            .promise();
        if (!Messages || !Messages.length) {
            return [];
        }
        const events = Messages.map((m) => {
            let messageBody;
            try {
                const data = m.Body ? JSON.parse(m.Body) : {};
                messageBody = JSON.parse(data.Message);
            }
            catch (e) {
                messageBody = m.Body;
            }
            return {
                id: m.MessageId || '',
                receipt: m.ReceiptHandle || '',
                queueUrl,
                data: messageBody,
            };
        });
        return events;
    }
    async deleteEvent(queueUrl, receiptId) {
        await this.sqs
            .deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptId,
        })
            .promise();
    }
};
__decorate([
    config_1.Env(),
    __metadata("design:type", String)
], EventDispatcher.prototype, "APP_NAME", void 0);
__decorate([
    config_1.Env(),
    __metadata("design:type", String)
], EventDispatcher.prototype, "APP_ENV", void 0);
EventDispatcher = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(consts_1.EVENT_BUS_CONFIG)),
    __metadata("design:paramtypes", [event_bus_config_dto_1.EventBusConfigDto])
], EventDispatcher);
exports.EventDispatcher = EventDispatcher;
