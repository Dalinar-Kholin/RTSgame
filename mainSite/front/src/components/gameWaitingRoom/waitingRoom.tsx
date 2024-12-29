import ChatComp from "./chatComp.tsx";
import {Box, Button} from "@mui/material";
import {useNavigate} from "react-router-dom";
import GameComp from "../gameComp/gameComp.tsx";
import Game from "../../Game/Game.ts";


interface IGameWaitingRoom{
    gameId : number
}
// po dołączeniu tutaj można wymieniać wiadomości i ustawiać połączenie socketowe pomiędzy useram
export default function GameWaitingRoom({gameId}:IGameWaitingRoom ){
    const navigate = useNavigate()
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
                <Button onClick={()=>{Game.instance.startAnimating()}}>start drawing</Button>
                {/*{Game.instance.selectedCharacter!==null ? Game.instance.selectedCharacter instanceof MWarrior ? "wojownik" : "nie wojownik" : "no character set"}*/}
            </Box>
            <Box
                id="gameBox"
                sx={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex"
                }}
            >
                <GameComp gameId={gameId}/>
            </Box>
        </Box>
    )
}