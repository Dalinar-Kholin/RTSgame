import MessageReceivedEvent from "./NotificationType/Messages/MessageReceived.ts";
import MessageSentEvent from "./NotificationType/Messages/messageSent.ts";
import AttackEvent from "./NotificationType/attackEvent.ts";

export interface ISubscribe {
    Handle: (notification: EventTypes) => void
}

export type EventTypes = MessageReceivedEvent | MessageSentEvent | AttackEvent


export default class EventAggregatorClass{
    static #instance: EventAggregatorClass;

    _subscribers : Map<string, ISubscribe[]>

    private constructor() {
        this._subscribers = new Map<string, ISubscribe[]>()
    }

    public static get instance(): EventAggregatorClass {
        if (!EventAggregatorClass.#instance) {
            EventAggregatorClass.#instance = new EventAggregatorClass();
        }
        return EventAggregatorClass.#instance;
    }

    public registerSubscriber(eventType: EventTypes,subscriber : ISubscribe){

        if (!this._subscribers.has(eventType.type)){
            this._subscribers.set(eventType.type, [])
        }
        let arr: ISubscribe[] | undefined = this._subscribers.get(eventType.type)
        if (arr===undefined){
            return
        }
        this._subscribers.set(eventType.type, [...arr, subscriber])

    }

    public unSubscribe(eventType: EventTypes,subscriber : ISubscribe){
        if (this._subscribers.has(eventType.type) && this._subscribers.get(eventType.type)?.length!==0 ){
            let arr: ISubscribe[] | undefined = this._subscribers.get(eventType.type)
            if (arr===undefined){
                return
            }
            this._subscribers.set(eventType.type,arr.filter((data) => {
                return data!==subscriber
            }))
        }
    }

    public notify(notify: EventTypes/*powiadominie typu buildingAttacked*/){
        console.log(`notification sent ${typeof notify}` )
        if(this._subscribers.has(notify.type)){
            this._subscribers.get(notify.type)?.map((fn) => {
                fn.Handle(notify)
            })
        }
    }
}