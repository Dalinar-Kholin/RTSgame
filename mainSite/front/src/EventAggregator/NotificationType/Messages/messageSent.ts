import {IEventAggregatorSubscriber} from "../../EventAggregatorClass.ts";

export default class MessageSent implements IEventAggregatorSubscriber {
    message: string
    type: string = "MessageSent"
    constructor(message: string) {
        this.message = message
    }
}