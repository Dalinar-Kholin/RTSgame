import {gameServerURL} from "../consts.ts";
import WaitingRoom from "../components/gameWaitingRoom/waitingRoom.tsx";
import {useEffect, useState} from "react";
import {Button} from "@mui/material";
import {DataMessageFrame, packageDataFrame} from "../communicationType/frames/dataMessageFrame.ts";
import {useNavigate} from "react-router-dom";
import {gameSocket, playerId} from "../App.tsx";







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
            r.results?.length !== 0 ?  setGames(r.results) : setGames([])
        })
    }


    useEffect(() => {
        refreshRoom((d)=>{setGamesToJoin(d)})

    }, []);


    console.log(gamesToJoin)
    return (
        <>

            <p>gameID := {gameId}</p>
            <p></p>
            <WaitingRoom />
            <p></p>
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
