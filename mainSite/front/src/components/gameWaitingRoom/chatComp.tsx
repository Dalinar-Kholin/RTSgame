import {useState} from "react";
import {TextField} from "@mui/material";
import EventAggregatorClass from "../../EventAggregator/EventAggregatorClass.ts";
import MessageSentEventObject from "../../EventAggregator/NotificationType/Messages/messageSent.ts";

export default function ChatComp(){
    const [message, setMessage] = useState("")

    const sendMessage = () => {
        EventAggregatorClass.instance.notify("MessageSentEvent", new MessageSentEventObject(message))
        setMessage("")
    }

    return <>
        <TextField id="standard-basic" label="Standard" variant="standard" value={message} onChange={(e) => {
            setMessage(e.target.value)
        }} onKeyDown={(e)=>{
            if (e.key == "Enter"){sendMessage()}}}
        />
    </>
}