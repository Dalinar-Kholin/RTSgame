import {gameServerURL} from "../consts.ts";
import WaitingRoom from "../components/gameWaitingRoom/waitingRoom.tsx";
import {useEffect, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import {Button} from "@mui/material";
import {DataMessageFrame, packageDataFrame} from "../communicationType/frames/dataMessageFrame.ts";
import {useNavigate} from "react-router-dom";


let playerId= uuidToUint32();

function uuidToUint32(): number {
    const uuid = uuidv4(); // Generowanie UUID
    const hexPart = uuid.replace(/-/g, '').slice(0, 8); // Pobierz pierwsze 8 znaków jako 32-bitowy fragment
    return parseInt(hexPart, 16); // Konwersja na liczbę w systemie dziesiętnym
}


export let gameSocket: WebSocket =  new WebSocket("ws://" + gameServerURL +"/commSocket?id="+playerId)
gameSocket.binaryType = 'arraybuffer';


interface IGamesToJoin{
    FirstPlayerId : number,
    GameId : number,
    SecondPlayerId: number
}

interface IResultFromJoinToGame{
    results: IGamesToJoin[]
}



interface newGame{
    gameId : number,
    playerId: number
}

export default function MainSite() {
    const [gameId, setGameId] = useState("")
    // Obsługa zdarzenia otwarcia połączenia
    const [gamesToJoin, setGamesToJoin] = useState<IGamesToJoin[]>([])

    const navigate = useNavigate()

    const refreshRoom = (setGames : (i: IGamesToJoin[])=> void )=> {fetch("http://" + gameServerURL + "/gamesToJoin",{
        method: "GET"
    }).then(
        r => {return r.json()}
    ).then(
        (r: IResultFromJoinToGame) => {
            r.results !== null ?  setGames(r.results) : setGames([])
        })
    }


    useEffect(() => {
        refreshRoom((d)=>{setGamesToJoin(d)})

    }, []);


    console.log(gamesToJoin)
    return (
        <>

            <p>gameID := {gameId}</p>
            <WaitingRoom />
            <Button onClick={ () => refreshRoom((d)=>{setGamesToJoin(d)})}>refresh Games</Button>
            <Button onClick={() => {
                fetch("http://" + gameServerURL + "/newGame?playerId=" + playerId).then(res => {
                    if (res.status!== 200){
                        throw new Error("bad make ne Game res")
                    }
                    return res.json()
                }).then(
                    (data: newGame) => {
                        console.log(""+data.gameId)
                        setGameId(""+data.gameId)
                        localStorage.setItem("gameId", ""+data.gameId)
                        navigate("/gameWaitingRoom")
                    }

                )
            }}>make new game</Button>
            { gamesToJoin ? gamesToJoin.map(g => {
                return (
                    <Button onClick={()=>{
                        fetch(`http://${gameServerURL}/joinGames?gameId=${g.GameId}&playerId=${playerId}`).then(
                            res => {
                                if (res.status!==200){
                                    throw new Error("chuj nie działa")
                                }else{
                                    gameSocket.send(packageDataFrame(new DataMessageFrame("player joins")))
                                    navigate("/gameWaitingRoom")
                                }
                            }
                        )
                    }}>
                        <p>
                            game := {g.GameId}
                            opponent := {g.SecondPlayerId}
                            ja := {g.FirstPlayerId}
                        </p>
                    </Button>
                )
            }) : <></> }
            essa
        </>
    )
}
