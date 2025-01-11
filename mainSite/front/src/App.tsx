import './App.css'
import './index.css'
import MainSite, {playerNumber} from "./components/mainSite.tsx";
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
import MessageReceivedEventObject from "./EventAggregator/NotificationType/Messages/MessageReceived.ts";
import MessageSentEventObject from "./EventAggregator/NotificationType/Messages/messageSent.ts";
import {ServerMessageFrame} from "./communicationType/frames/serverMessageFrame.ts";
import ServerMessageReceivedObject from "./EventAggregator/NotificationType/Messages/serverMessageReceived.ts";
import {StartGameFrame} from "./communicationType/frames/startGame.ts";
import {StartGameObject} from "./EventAggregator/NotificationType/Messages/startGame.ts";
import {newBoardReceivedFrame, PackageGameBoard} from "./communicationType/frames/newBoardReceived.ts";
import newBoardMessageObject from "./EventAggregator/NotificationType/newBoardMessageObject.ts";
import AttackEventObject from "./EventAggregator/NotificationType/attackEvent.ts";
import {EndGame} from "./communicationType/frames/EndGame.ts";
import {EndGameEventObject} from "./EventAggregator/NotificationType/endGame.ts";


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
        const messageSender: ISubscribe = {
            Handle: (notification: object): void => {
                const notif  = (notification as MessageSentEventObject)
                gameSocket.send(new DataMessageFrame(notif.message).packageDataFrame())
            }
        }

        const gameStart: ISubscribe = {
            Handle: (__notification: object): void => {
                gameSocket.send(new StartGameFrame().packageDataFrame())
            }
        }

        // mamy timer generujący przerwanie co 10 ms
        const intervalId = setInterval(() => {
            EventAggregatorClass.instance.notify(EventTypeEnum.timerEvent, {})
        }, 10);


        //let __timer = Date.now()

        const sendGameBoard: ISubscribe ={
            Handle: (__notification: object): void =>{
                //const __notif = notification as boardChangedEventObject
                gameSocket.send(new newBoardReceivedFrame(PackageGameBoard()).packageDataFrame())
                /*if (notif.isImportante || (notif.time - timer > 100)  ){ // ograniczenie ruchu po sieci, jedne pakiet na 100 ms

                    timer = notif.time
                }*/
            }
        }
        const attack: ISubscribe ={
            Handle: (notification: object): void =>{
                console.log("atak wysłany")
                const notif = notification as AttackEventObject
                gameSocket.send(new AttackDataFrame(notif.damage, notif.cord).packageDataFrame())
            }
        }

        const GameEnded: ISubscribe = {
            Handle: (__notification: object): void => {
                gameSocket.send(new EndGame(playerNumber).packageDataFrame())
            }
        }

        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.MessageSentEvent, messageSender)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.startGameSent, gameStart)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.boardChanged, sendGameBoard)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.AttackEventSend, attack)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.gameLost, GameEnded)
        return ()=>{
            clearInterval(intervalId);
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.MessageSentEvent, messageSender)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.startGameSent, gameStart)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.boardChanged, sendGameBoard)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.AttackEventSend, attack)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.gameLost, GameEnded)
        }

    }, []);

    useEffect(() => {
        gameSocket.onmessage = (e)=>{
            if (e.data instanceof ArrayBuffer){
                let frame = Parser.instance.parse(new Uint8Array(e.data))

                if (frame instanceof newBoardReceivedFrame){
                    EventAggregatorClass.instance.notify(EventTypeEnum.boardReceived, new newBoardMessageObject(frame)) // dostaliśmy nową planszę od servera
                }else if (frame instanceof DataMessageFrame){
                    EventAggregatorClass.instance.notify(EventTypeEnum.MessageReceivedEvent, new MessageReceivedEventObject(frame.message))
                }else if (frame instanceof AttackDataFrame){
                    EventAggregatorClass.instance.notify(EventTypeEnum.AttackEventReceived, new AttackEventObject(frame.damage, frame.cord))
                }else if (frame instanceof ServerMessageFrame){
                    EventAggregatorClass.instance.notify(EventTypeEnum.ServerMessageReceived, new ServerMessageReceivedObject(frame.message))
                }else if (frame instanceof StartGameFrame){
                    EventAggregatorClass.instance.notify(EventTypeEnum.startGameReceived, new StartGameObject())
                } else if(frame instanceof EndGame){
                    EventAggregatorClass.instance.notify(EventTypeEnum.endGame,new EndGameEventObject(frame.winner))
                }
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


