// niejawna implementacja interfacu type: string



export const EventTypeEnum = { // wszystkie możliwe typy powiadomień
    MessageReceivedEvent: 0,
    MessageSentEvent: 1,
    ServerMessageReceived: 3,
    CanvasRightClick: 4,
    CanvasLeftClick: 5,
    startGameReceived: 6,
    startGameSent: 7,
    timerEvent: 8,
    changeCharacter: 9,
    boardChanged: 10,
    boardReceived: 11,
    characterSpawned: 12,
    AttackEventSend: 2,
    AttackEventReceived: 13,
    endGame: 14,
    gameLost: 15
}


type EventTypes = (typeof EventTypeEnum)[keyof typeof EventTypeEnum] // to musi być tylko enumerator

export interface ISubscribe {
    Handle: (notification: object) => void
}


export default class EventAggregatorClass{
    static #instance: EventAggregatorClass;

    private _subscribers : Map<EventTypes, ISubscribe[]>

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
        const tab = this._subscribers.get(notify)
        if (tab===undefined){
            return
        }
        for (let i = 0; i< tab.length; i++){ // for jest teoretycznie szybszy od mapa
            tab[i].Handle(obj)
        }

    }
}