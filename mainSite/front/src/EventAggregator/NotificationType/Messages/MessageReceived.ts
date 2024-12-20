import {IEventAggregatorSubscriber} from "../../EventAggregatorClass.ts";


export default class MessageReceived implements IEventAggregatorSubscriber{
    message: string
    type: string = "MessageReceived"
    constructor(message: string) {
        this.message = message
    }
}