import {gameSocket} from "../mainSite.tsx";
import {useState} from "react";
import ParseFrame from "../../communicationType/frames/frameParser.ts";
import {DataMessageFrame} from "../../communicationType/frames/dataMessageFrame.ts";
import ChatComp from "./chatComp.tsx";



// po dołączeniu tutaj można wymieniać wiadomości i ustawiać połączenie socketowe pomiędzy useram
export default function GameWaitingRoom(){
    const [chatHistory, setChatHistory] = useState<string[]>([])

    gameSocket.onmessage = (e)=>{// zastąpić to observerem
        console.log(e)
        if (e.data instanceof ArrayBuffer){
            let frame = ParseFrame(new Uint8Array(e.data))
            if (frame instanceof DataMessageFrame){
                console.log(`parsed data ${frame.message} `)
                setChatHistory([...chatHistory, frame.message])
            }
        }else{
            console.log("pogger\n")
        }
    }


    return(
        <>
            {chatHistory.map(message => {
                return <p>{message}</p>
            })}
            <ChatComp/>
        </>
    )
}