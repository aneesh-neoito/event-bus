export declare abstract class Event<T> {
    id: string;
    data?: T;
    constructor(data?: T);
    static get id(): string;
}
