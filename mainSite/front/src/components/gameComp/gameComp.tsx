import {useEffect} from "react";
import Game, {charCordEnum, GameBoard, gameSize, offsets, visibilitySize} from "../../Game/Game.ts";
import EventAggregatorClass, {EventTypeEnum} from "../../EventAggregator/EventAggregatorClass.ts";
import {gameServerURL} from "../../consts.ts";
import {playerId} from "../../App.tsx";
import LeftClickEventObject, {RightClickEventObject} from "../../EventAggregator/NotificationType/clicks.ts";
import {Box} from "@mui/material";
import SelectedCharacterComp from "../gameWaitingRoom/selectedCharacterComp.tsx";
import field, {fieldType} from "../../Game/Field.ts";
import {MWarrior} from "../../Game/content/characters/mWarrior.ts";

export const clickEnum = { // wszystkie możliwe typy powiadomień
    left: 0,
    right: 1
}


type clickTypes = (typeof clickEnum)[keyof typeof clickEnum] // to musi być tylko enumerator

interface IClickInterpret{
    x: number,
    y: number,
    type: clickTypes
}
const clickInterpret = ({x, y, type}: IClickInterpret)=>{
    if (type === clickEnum.right){
        EventAggregatorClass.instance.notify(EventTypeEnum.CanvasRightClick, new RightClickEventObject(x, y))
    }else{
        EventAggregatorClass.instance.notify(EventTypeEnum.CanvasLeftClick, new LeftClickEventObject(x, y))
    }
}


interface IGameComp{
    gameId: number
}

export default function GameComp({gameId} : IGameComp){
    useEffect(() => {
        Game.instance.refreshCanvas()

        return ()=>{
            Game.instance.stopAnimating()
            Game.instance.destructor() // pod koniec gry chcemy ją wyczyścić
            fetch(`http://${gameServerURL}/leaveGame?gameId=${gameId}&playerId=${playerId}`).then(res => {
                if (res.status === 200) {
                    console.log("successfully unregister connection")
                } else {
                    console.log("error in unregister operation")
                }
            })
        }
    }, []);

    return(
        <>
            <Box>
                pasek zasobów
            </Box>
            <canvas tabIndex={0} style={{border: '2px solid #fff'}} id="gameCanvas" width="1000" height="1000" onClick={(c) => {
                clickInterpret({
                    x: c.clientX - charCordEnum.x,
                    y: c.clientY - charCordEnum.y,
                    type: clickEnum.left
                })
            }} onContextMenu={(c)=> {
                c.preventDefault()
                clickInterpret({
                    x: c.clientX - charCordEnum.x,
                    y: c.clientY - charCordEnum.y,
                    type: clickEnum.right
                })
            }} onKeyDown={
                (e) => {
                    e.preventDefault();
                    switch (e.key.toLowerCase()) {
                        case "d":
                            if (offsets.offsetX < gameSize[0]- visibilitySize[0]){
                                offsets.offsetX += 1
                            }
                            break
                        case "a":
                            if (offsets.offsetX > 0){
                                offsets.offsetX -= 1
                            }
                            break
                        case "s":
                            if (offsets.offsetY < gameSize[1] -  visibilitySize[1]){
                                offsets.offsetY += 1
                            }
                            break
                        case "w":
                            if (offsets.offsetY > 0){
                                offsets.offsetY -= 1
                            }
                            break
                        case "q":
                            const newField = new field(fieldType.mMelee)
                            newField.content = new MWarrior()
                            GameBoard[10][10] = newField
                            break
                    }
                }
            }
            >
            </canvas>
            <SelectedCharacterComp/>
        </>
    )
}


// implementacja obiektu gameDrawerEngine
// w którym będzie można rejstrować rysowanie obiektów ?