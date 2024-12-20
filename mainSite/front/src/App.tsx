import './App.css'
import './index.css'
import MainSite from "./components/mainSite.tsx";
import {Route, Routes} from "react-router-dom";
import GameWaitingRoom from "./components/gameWaitingRoom/waitingRoom.tsx";
import {useEffect} from "react";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {gameServerURL} from "./consts.ts";
import {Parser} from "./communicationType/frames/frameParser.ts";
import {DataMessageFrame} from "./communicationType/frames/dataMessageFrame.ts";
import EventAggregatorClass from "./EventAggregator/EventAggregatorClass.ts";
import {v4 as uuidv4} from "uuid";
import MessageSent from "./EventAggregator/NotificationType/Messages/messageSent.ts";
import AttackDataFrame from "./communicationType/frames/attackDataFrame.ts";
import AttackEvent from "./EventAggregator/NotificationType/attackEvent.ts";



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


    gameSocket.onmessage = (e)=>{// zastąpić to observerem
        console.log(e)
        if (e.data instanceof ArrayBuffer){
            let frame = Parser.instance.parse(new Uint8Array(e.data))
            if (frame instanceof DataMessageFrame){
                EventAggregatorClass.instance.notify(new MessageSent(frame.message))
            }else if (frame instanceof AttackDataFrame){
                EventAggregatorClass.instance.notify(new AttackEvent(10, 11))
            }/*dla każdej akcji odpowiednie powiadomienie*/
        }else{
            console.log("pogger\n")
        }
    }

    useEffect(() => {
        return ()=> {
            console.log("web socket closed")
            gameSocket.close()
        }
    }, []);

    return <>
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
        <Routes>
            <Route path={"/*"} element={<MainSite/>}/>
            <Route path={"/mainSite"} element={<MainSite/>}/>
            <Route path={"/gameWaitingRoom"} element={<GameWaitingRoom/>}/>
        </Routes>
        </ThemeProvider>
    </>
}


