import {gameServerURL} from "../consts.ts";
import {useEffect, useState} from "react";
import {Box, Button} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {playerId} from "../App.tsx";

interface IGamesToJoin {
    FirstPlayerId: number,
    GameId: number,
    SecondPlayerId: number
}

interface IResultFromJoinToGame {
    results: IGamesToJoin[]
}


interface newGame {
    gameId: number,
    playerId: number
}

interface IMainSite{
    setGameId : (n : number) => void
}

export default function MainSite({setGameId}: IMainSite) {
    // Obsługa zdarzenia otwarcia połączenia
    const [gamesToJoin, setGamesToJoin] = useState<IGamesToJoin[]>([])

    const navigate = useNavigate()

    const refreshRoom = (setGames: (i: IGamesToJoin[]) => void) => {
        fetch("http://" + gameServerURL + "/gamesToJoin", {
            method: "GET"
        }).then(
            r => {
                return r.json()
            }
        ).then(
            (r: IResultFromJoinToGame) => {
                r.results?.length !== 0 ? setGames(r.results) : setGames([])
            })
    }


    useEffect(() => {
        refreshRoom((d) => {
            setGamesToJoin(d)
        })

    }, []);


    console.log(gamesToJoin)
    return (
        <Box sx={{
            justifyContent: "center"
        }}>
            <p></p>
            <Button onClick={() => refreshRoom((d) => {
                setGamesToJoin(d)
            })}>refresh Games</Button>
            <Button onClick={() => {
                fetch("http://" + gameServerURL + "/newGame?playerId=" + playerId).then(res => {
                    if (res.status !== 200) {
                        throw new Error("bad make ne Game res")
                    }
                    return res.json()
                }).then(
                    (data: newGame) => {
                        console.log("" + data.gameId)
                        setGameId(data.gameId)
                        navigate("/gameWaitingRoom")
                    }
                )
            }}>make new game</Button>
            <br/>
            {gamesToJoin ? gamesToJoin.map(g => {
                return (
                    <>
                        <Button onClick={() => {
                            fetch(`http://${gameServerURL}/joinGames?gameId=${g.GameId}&playerId=${playerId}`).then(
                                res => {
                                    if (res.status !== 200) {
                                        throw new Error("chuj nie działa")
                                    } else {
                                        setGameId(g.GameId)
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
                        <br/>
                    </>
                )
            }) : <></>}
        </Box>
    )
}
