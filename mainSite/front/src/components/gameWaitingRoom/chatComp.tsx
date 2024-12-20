import {useState} from "react";
import {Button, TextField} from "@mui/material";
import {DataMessageFrame, packageDataFrame} from "../../communicationType/frames/dataMessageFrame.ts";
import {gameSocket} from "../../App.tsx";

export default function ChatComp(){
    const [message, setMessage] = useState("")

    const sendMessage = () => {
        gameSocket.send(packageDataFrame(new DataMessageFrame(message)))
        setMessage("")
    }

    return <>
        <TextField id="standard-basic" label="Standard" variant="standard" value={message} onChange={(e) => {
            setMessage(e.target.value)
        }} onKeyDown={(e)=>{
            if (e.key == "Enter"){sendMessage()}}}
        />
        <Button onClick={sendMessage}>send Message</Button>
    </>
}