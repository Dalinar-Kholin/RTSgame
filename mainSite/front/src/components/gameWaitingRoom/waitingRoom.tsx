import ChatComp from "./chatComp.tsx";
import {Box, Button} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import GameComp from "../gameComp/gameComp.tsx";
import Game, {GameBoard, unitMap} from "../../Game/Game.ts";
import {useEffect, useState} from "react";
import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../../EventAggregator/EventAggregatorClass.ts";
import {StartGameObject} from "../../EventAggregator/NotificationType/Messages/startGame.ts";
import ServerMessageReceivedObject from "../../EventAggregator/NotificationType/Messages/serverMessageReceived.ts";
import field, {fieldType} from "../../Game/Field.ts";
import {eHeadBase, mHeadBase} from "../../Game/content/buildings/headBase.ts";
import {playerNumber} from "../mainSite.tsx";


interface IGameWaitingRoom{
    gameId : number
}



// po dołączeniu tutaj można wymieniać wiadomości i ustawiać połączenie socketowe pomiędzy useram
export default function GameWaitingRoom({gameId}:IGameWaitingRoom ){
    const location = useLocation();


    const state = location.state;
    console.log(`state := ${state.isMade}`)

    const navigate = useNavigate()
    const [isEnemyReady, setIsEnemyReady] = useState(false)
    const [isPlayerReady, setIsPlayerReady] = useState(false)
    const [isAnotherPlayerInLobby, setIsAnotherPlayerInLobby] = useState(!state?.isMade)

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

        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.startGameReceived, enemyReady)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.ServerMessageReceived, PlayerInLobby)

        return ()=>{
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.startGameReceived, enemyReady)
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.ServerMessageReceived, PlayerInLobby)
        }
    }, []);

    if (isEnemyReady && isPlayerReady){

        // spawnowanie sowjej bazy
        const newField = new field(playerNumber===0 ? fieldType.mBase : fieldType.eBase)
        const baseCords = playerNumber===0 ? 10 : 30

        newField.content = playerNumber===0? new mHeadBase(baseCords+2,baseCords+2) : new eHeadBase(baseCords+2,baseCords+2)
        GameBoard[baseCords][baseCords] = newField
        unitMap.set(newField, [baseCords,baseCords])
        /*GameBoard[baseCords + 1][baseCords] = newField
        GameBoard[baseCords +2][baseCords] = newField
        GameBoard[baseCords][baseCords +1] = newField
        GameBoard[baseCords + 1][baseCords +1] = newField
        GameBoard[baseCords + 2 ][baseCords +1] = newField*/
        EventAggregatorClass.instance.notify(EventTypeEnum.boardChanged, {})
        Game.instance.startAnimating()
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