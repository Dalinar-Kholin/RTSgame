import {useEffect, useState} from "react";
import {List, ListItem, ListItemText, TextField} from "@mui/material";
import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../../EventAggregator/EventAggregatorClass.ts";
import MessageSentEventObject from "../../EventAggregator/NotificationType/Messages/messageSent.ts";
import MessageReceivedEventObject from "../../EventAggregator/NotificationType/Messages/MessageReceived.ts";
import ServerMessageReceivedObject from "../../EventAggregator/NotificationType/Messages/serverMessageReceived.ts";


class gameWaitingRoom implements ISubscribe {
    registerMessage: (message: string) => void

    Handle(notification: object): void {
        if (notification instanceof MessageSentEventObject) {
            this.registerMessage("me: " + notification.message)
        } else if (notification instanceof MessageReceivedEventObject) {
            this.registerMessage("enemy: " + notification.message)
        } else if (notification instanceof ServerMessageReceivedObject) {
            this.registerMessage("server: " + notification.message)
        }

    }

    constructor(fn: (message: string) => void) {
        this.registerMessage = fn
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.MessageSentEvent, this)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.MessageReceivedEvent, this)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.ServerMessageReceived, this)
    }

}



export default function ChatComp() {
    const [message, setMessage] = useState("")


    const [chatHistory, setChatHistory] = useState<string[]>([])

    useEffect(() => {
        const historyHandlerClass: gameWaitingRoom = new gameWaitingRoom((message: string) => {
            setChatHistory(prevHistory => [...prevHistory, message])
        })
        return () => {
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.MessageReceivedEvent, historyHandlerClass)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.MessageSentEvent, historyHandlerClass)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.ServerMessageReceived, historyHandlerClass)
        }
    }, []);

    const sendMessage = () => {
        EventAggregatorClass.instance.notify(EventTypeEnum.MessageSentEvent, new MessageSentEventObject(message))
        setMessage("")
    }

    return (
        <>
            <List

                sx={{
                    overflow: "scroll",
                    maxHeight: "400px",
                    overflowX: "hidden",
                    borderRadius: "10px",
                    scrollbarWidth: "none"
                }}
                dense={true}>{
                chatHistory.map(mess => {
                    return <ListItem

                    >
                        <ListItemText
                            primary={mess}
                        />
                    </ListItem>
                })}
            </List>

            <TextField autoComplete={"off"} id="standard-basic" label="type message" variant="standard" value={message}
                       onChange={(e) => {
                           setMessage(e.target.value)
                       }} onKeyDown={(e) => {
                if (e.key == "Enter") {
                    sendMessage()
                }
            }}
            />
        </>
    )
}