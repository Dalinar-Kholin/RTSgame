import ChatComp from "./chatComp.tsx";
import {Box, Button} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import GameComp from "../gameComp/gameComp.tsx";
import Game, {GameBoard, myBaseObject, unitMap} from "../../Game/Game.ts";
import {useEffect, useState} from "react";
import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../../EventAggregator/EventAggregatorClass.ts";
import {StartGameObject} from "../../EventAggregator/NotificationType/Messages/startGame.ts";
import ServerMessageReceivedObject from "../../EventAggregator/NotificationType/Messages/serverMessageReceived.ts";
import field, {fieldType} from "../../Game/Field.ts";
import {eHeadBase, HeadBase, mHeadBase} from "../../Game/content/buildings/headBase.ts";
import {playerNumber} from "../mainSite.tsx";
import boardChangedEventObject from "../../EventAggregator/NotificationType/boardChangeEventObject.ts";
import {EndGame} from "../../communicationType/frames/EndGame.ts";


interface IGameWaitingRoom{
    gameId : number
}



// po dołączeniu tutaj można wymieniać wiadomości i ustawiać połączenie socketowe pomiędzy useram
export default function GameWaitingRoom({gameId}:IGameWaitingRoom ){
    const location = useLocation();


    const state = location.state;

    const navigate = useNavigate()
    const [isEnemyReady, setIsEnemyReady] = useState(false)
    const [isPlayerReady, setIsPlayerReady] = useState(false)
    const [isAnotherPlayerInLobby, setIsAnotherPlayerInLobby] = useState(!state?.isMade)
    const [winner, setWinner] = useState<number | null>(null)

    useEffect(() => {
        // register message sender notify for sending message to backend

        let enemyReady: ISubscribe = {
            Handle: (__notification: object): void => {
                console.log("game Start Received")
                setIsEnemyReady(true)
            }
        }

        let PlayerInLobby: ISubscribe = {
            Handle: (notification: object): void => {
                const notify  = (notification as ServerMessageReceivedObject)
                if (notify.message === "player join to chat"){
                    setIsAnotherPlayerInLobby(true)
                }else if (notify.message === "player left rooom"){
                    setIsAnotherPlayerInLobby(false)
                }
            }
        }


        let gameEnd: ISubscribe = {
            Handle(notification: object): void {
                const notif = notification as EndGame
                setWinner(notif.winner)
            }
        }

        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.startGameReceived, enemyReady)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.ServerMessageReceived, PlayerInLobby)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.endGame, gameEnd)

        return ()=>{
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.startGameReceived, enemyReady)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.ServerMessageReceived, PlayerInLobby)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.endGame, gameEnd)
        }
    }, []);

    if (isEnemyReady && isPlayerReady){

        // spawnowanie sowjej bazy
        const newField = new field(playerNumber===0 ? fieldType.mBase : fieldType.eBase)
        const baseCords = playerNumber===0 ? 10 : 30

        newField.content = playerNumber===0? new mHeadBase(baseCords+2,baseCords+2) : new eHeadBase(baseCords+2,baseCords+2)
        GameBoard[baseCords][baseCords] = newField
        myBaseObject.base = newField.content as HeadBase
        myBaseObject.cord = [baseCords,baseCords]
        unitMap.set(newField, [baseCords,baseCords])
        EventAggregatorClass.instance.notify(EventTypeEnum.boardChanged, new boardChangedEventObject(Date.now()))
        Game.instance.startAnimating()
    }

    if (winner!== null){
        return <Box>
            {winner !== playerNumber ? "You won" : "You lost"}
            <Button onClick={()=>{navigate("/")}}>go to menu</Button>
        </Box>
    }

    return(
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                width: "100%"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    margin: "auto 0"
                }}
            >
                <ChatComp/>
                <Button onClick={()=>{navigate("/")}}>go to menu</Button>
                {isAnotherPlayerInLobby ? <Button onClick={() => {
                    setIsPlayerReady(true)
                    EventAggregatorClass.instance.notify(EventTypeEnum.startGameSent, new StartGameObject())
                }}>start Game</Button> : <></>} {/*wysłanie do servera pakietu game Ready jeżeli jest nowy user, jeżeli nie ma nie ma możliwości bycia gotowym*/}

                {/*{Game.instance.selectedCharacter!==null ? Game.instance.selectedCharacter instanceof MWarrior ? "wojownik" : "nie wojownik" : "no character set"}*/}
            </Box>
            <Box
                id="gameBox"
                sx={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <GameComp gameId={gameId}/>
            </Box>
        </Box>
    )
}