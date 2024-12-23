import './App.css'
import './index.css'
import MainSite from "./components/mainSite.tsx";
import {Route, Routes} from "react-router-dom";
import GameWaitingRoom from "./components/gameWaitingRoom/waitingRoom.tsx";
import {useEffect, useState} from "react";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {gameServerURL} from "./consts.ts";
import {Parser} from "./communicationType/frames/frameParser.ts";
import {DataMessageFrame} from "./communicationType/frames/dataMessageFrame.ts";
import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "./EventAggregator/EventAggregatorClass.ts";
import {v4 as uuidv4} from "uuid";
import AttackDataFrame from "./communicationType/frames/attackDataFrame.ts";
import AttackEvent from "./EventAggregator/NotificationType/attackEvent.ts";
import MessageReceivedEventObject from "./EventAggregator/NotificationType/Messages/MessageReceived.ts";
import MessageSentEventObject from "./EventAggregator/NotificationType/Messages/messageSent.ts";
import {ServerMessageFrame} from "./communicationType/frames/serverMessageFrame.ts";
import ServerMessageReceivedObject from "./EventAggregator/NotificationType/Messages/serverMessageReceived.ts";


export let playerId= uuidToUint32();

function uuidToUint32(): number {
    const uuid = uuidv4(); // Generowanie UUID
    const hexPart = uuid.replace(/-/g, '').slice(0, 8); // Pobierz pierwsze 8 znaków jako 32-bitowy fragment
    return parseInt(hexPart, 16); // Konwersja na liczbę w systemie dziesiętnym
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


export let gameSocket: WebSocket =  new WebSocket("ws://" + gameServerURL +"/commSocket?id="+playerId)
gameSocket.binaryType = 'arraybuffer';

export default function App() {

    const [gameId, setGameId] = useState<number>(0)

    useEffect(() => {
        // register message sender notify for sending message to backend
        let messageSender: ISubscribe = {
            Handle: (notification: object): void => {
                const notif  = (notification as MessageSentEventObject)
                console.log("ogg?")
                gameSocket.send(new DataMessageFrame(notif.message).packageDataFrame())
            }
        }

        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.MessageSentEvent, messageSender)

        return ()=>{
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.MessageSentEvent, messageSender )
        }

    }, []);

    useEffect(() => {
        gameSocket.onmessage = (e)=>{// zastąpić to observerem
            if (e.data instanceof ArrayBuffer){
                let frame = Parser.instance.parse(new Uint8Array(e.data))
                if (frame instanceof DataMessageFrame){
                    console.log("enemy message")
                    EventAggregatorClass.instance.notify(EventTypeEnum.MessageReceivedEvent, new MessageReceivedEventObject(frame.message))
                }else if (frame instanceof AttackDataFrame){
                    EventAggregatorClass.instance.notify(EventTypeEnum.AttackEvent, new AttackEvent(10,11))
                }else if (frame instanceof ServerMessageFrame){
                    console.log("server message")
                    EventAggregatorClass.instance.notify(EventTypeEnum.ServerMessageReceived, new ServerMessageReceivedObject(frame.message))
                }/*dla każdej akcji odpowiednie powiadomienie*/
            }else{
                console.log("pogger\n")
            }
        }
        return ()=> {
            console.log("web socket closed")
            gameSocket.close()
        }
    }, []);

    const setGameIdLambda = (id : number) => {setGameId(id)}

    return <>
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
        <Routes>
            <Route path={"/*"} element={<MainSite setGameId={setGameIdLambda}/>}/>
            <Route path={"/mainSite"} element={<MainSite setGameId={setGameIdLambda}/>}/>
            <Route path={"/gameWaitingRoom"} element={<GameWaitingRoom gameId={gameId}/>}/>
        </Routes>
        </ThemeProvider>
    </>
}


