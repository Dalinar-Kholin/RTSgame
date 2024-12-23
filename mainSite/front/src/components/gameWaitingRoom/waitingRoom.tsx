import {useEffect, useState} from "react";
import ChatComp from "./chatComp.tsx";
import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../../EventAggregator/EventAggregatorClass.ts";
import MessageSentEventObject from "../../EventAggregator/NotificationType/Messages/messageSent.ts";
import MessageReceivedEventObject from "../../EventAggregator/NotificationType/Messages/MessageReceived.ts";
import ServerMessageReceivedObject from "../../EventAggregator/NotificationType/Messages/serverMessageReceived.ts";
import {gameServerURL} from "../../consts.ts";
import {playerId} from "../../App.tsx";
import {Button} from "@mui/material";
import {useNavigate} from "react-router-dom";

class gameWaitingRoom implements ISubscribe{
    registerMessage : (message: string) => void

    Handle(notification: object): void {
        if (notification instanceof MessageSentEventObject){
            this.registerMessage("me: " + notification.message)
        }else if (notification instanceof MessageReceivedEventObject){
            this.registerMessage("enemy: " + notification.message)
        }else if (notification instanceof ServerMessageReceivedObject){
            this.registerMessage("server: " + notification.message)
        }

    }

    constructor(fn : (message: string) => void) {
        this.registerMessage = fn
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.MessageSentEvent, this)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.MessageReceivedEvent, this)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.ServerMessageReceived, this)
    }

}

interface IGameWaitingRoom{
    gameId : number
}

// po dołączeniu tutaj można wymieniać wiadomości i ustawiać połączenie socketowe pomiędzy useram
export default function GameWaitingRoom({gameId}:IGameWaitingRoom ){
    const [chatHistory, setChatHistory] = useState<string[]>([])
    const navigate = useNavigate()
    useEffect(() => {
        const historyHandlerClass: gameWaitingRoom = new gameWaitingRoom( (message: string) => {
            setChatHistory(prevHistory => [...prevHistory, message])
        })
        return ()=>{
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.MessageReceivedEvent,historyHandlerClass)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.MessageSentEvent,historyHandlerClass)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.ServerMessageReceived,historyHandlerClass)
            fetch(`http://${gameServerURL}/leaveGame?gameId=${gameId}&playerId=${playerId}`).then(res => {
                if (res.status === 200){
                    console.log("successfully unregister connection")
                }else{
                    console.log("error in unregister operation")
                }
            })
        }
    }, []);

    /* czekamy na powiadominie od event aggregatora*/

    return(
        <>
            {chatHistory.map(message => {
                return <p>{message}</p>
            })}
            <ChatComp/>

            <Button onClick={()=>{navigate("/")}}>go to menu</Button>
        </>
    )
}