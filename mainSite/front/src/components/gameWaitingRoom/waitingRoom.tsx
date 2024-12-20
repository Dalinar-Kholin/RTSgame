import {useEffect, useState} from "react";
import ChatComp from "./chatComp.tsx";
import EventAggregatorClass from "../../EventAggregator/EventAggregatorClass.ts";
import MessageReceived from "../../EventAggregator/NotificationType/Messages/MessageReceived.ts";
import MessageSent from "../../EventAggregator/NotificationType/Messages/messageSent.ts";

class gameWaitingRoom{
    registerMessage : (message: string) => void

    Handle(notification: MessageReceived | MessageSent): void {
        if (notification instanceof MessageSent) {
            console.log(`message sent := ${notification.message}`)
            this.registerMessage("you: " + notification.message)
        } else if (MessageReceived instanceof MessageReceived){
                console.log(`message received := ${notification.message}`)
                this.registerMessage("opponent: " + notification.message)
        }
    }

    constructor(fn : (message: string) => void) {
        this.registerMessage = fn
        EventAggregatorClass.instance.registerSubscriber(new MessageSent(""), this)
        EventAggregatorClass.instance.registerSubscriber(new MessageReceived(""), this)
    }

}


// po dołączeniu tutaj można wymieniać wiadomości i ustawiać połączenie socketowe pomiędzy useram
export default function GameWaitingRoom(){
    const [chatHistory, setChatHistory] = useState<string[]>([])

    useEffect(() => {
        const historyHandlerClass: gameWaitingRoom = new gameWaitingRoom( (message: string) => {
            setChatHistory(prevHistory => [...prevHistory, message])
        })
        return ()=>{
            EventAggregatorClass.instance.unSubscribe(new MessageReceived(""),historyHandlerClass)
            EventAggregatorClass.instance.unSubscribe(new MessageSent(""),historyHandlerClass)
        }
    }, []);

    /* czekamy na powiadominie od event aggregatora*/

    return(
        <>
            {chatHistory.map(message => {
                return <p>{message}</p>
            })}
            <ChatComp/>
        </>
    )
}