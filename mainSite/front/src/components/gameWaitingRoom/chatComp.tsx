import {useState} from "react";
import {Button, TextField} from "@mui/material";
import {gameSocket} from "../mainSite.tsx";
import {DataMessageFrame, packageDataFrame} from "../../communicationType/frames/dataMessageFrame.ts";

export default function ChatComp(){
    const [message, setMessage] = useState("")


    return <>
        <TextField value={message} onChange={(e) => {
            setMessage(e.target.value)
        }}></TextField>
        <Button onClick={(e) => {
            e.preventDefault()
            gameSocket.send(packageDataFrame(new DataMessageFrame(message)))
            setMessage("")
        }}>send Message</Button>

    </>
}