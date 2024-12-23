// niejawna implementacja interfacu type: string



export const EventTypeEnum = { // wszystkie możliwe typy powiadomień
    MessageReceivedEvent: 0,
    MessageSentEvent: 1,
    AttackEvent: 2,
    ServerMessageReceived: 3
}


type EventTypes = (typeof EventTypeEnum)[keyof typeof EventTypeEnum] // to musi być tylko enumerator

export interface ISubscribe {
    Handle: (notification: object) => void
}


export default class EventAggregatorClass{
    static #instance: EventAggregatorClass;

    _subscribers : Map<EventTypes, ISubscribe[]>

    private constructor() {
        this._subscribers = new Map<EventTypes, ISubscribe[]>()
    }

    public static get instance(): EventAggregatorClass {
        if (!EventAggregatorClass.#instance) {
            EventAggregatorClass.#instance = new EventAggregatorClass();
        }
        return EventAggregatorClass.#instance;
    }

    public registerSubscriber(eventType: EventTypes,subscriber : ISubscribe){

        if (!this._subscribers.has(eventType)){
            this._subscribers.set(eventType, [])
        }
        let arr: ISubscribe[] | undefined = this._subscribers.get(eventType)
        if (arr===undefined){
            return
        }
        this._subscribers.set(eventType, [...arr, subscriber])

    }

    public unSubscribe(eventType: EventTypes,subscriber : ISubscribe){
        if (this._subscribers.has(eventType) && this._subscribers.get(eventType)?.length!==0 ){
            let arr: ISubscribe[] | undefined = this._subscribers.get(eventType)
            if (arr===undefined){
                return
            }
            this._subscribers.set(eventType,arr.filter((data) => {
                return data!==subscriber
            }))
        }
    }

    public notify(notify: EventTypes, obj: object){
        console.log(`notification sent ${typeof notify}`)
        const tab = this._subscribers.get(notify)
        if (tab===undefined){
            return
        }
        for (let i = 0; i< tab.length; i++){ // for jest teoretycznie szybszy od mapa
            tab[i].Handle(obj)
        }

    }
}