import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../../EventAggregator/EventAggregatorClass.ts";
import field, {fieldType, fieldTypeEnum} from "../../Game/Field.ts";
import {useEffect, useState} from "react";
import {GameBoard, offsets} from "../../Game/Game.ts";
import LeftClickEventObject from "../../EventAggregator/NotificationType/clicks.ts";
import ERangerPict from "../../../src/assets/ERanger.jpg";
import MRangerPict from "../../../src/assets/MRanger.jpg";
import EWarriorPict from "../../../src/assets/EWarrior.jpg";
import MWarriorPict from "../../../src/assets/MWarrior.jpg";
import {Box} from "@mui/material";
import {EWarrior, MWarrior} from "../../Game/content/characters/mWarrior.ts";

class SelectedCharacter implements ISubscribe {
    registerCharacter: (character: field) => void

    Handle(notification: object): void {
        if (notification instanceof LeftClickEventObject) {
            let x = Math.floor(notification.x/10) + offsets.offsetX
            let y = Math.floor(notification.y/10) + offsets.offsetY
            this.registerCharacter(GameBoard[x][y])
        }
    }

    constructor(fn: (character: field) => void) {
        this.registerCharacter = fn
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.CanvasLeftClick, this)
    }

}

// type to image

type imageMap = {
    [key in fieldTypeEnum]: string;
};

let characterToImage: imageMap = { // moim zdaniem w tym typie powinien wystąpić błąd ponieważ nie ma obsługi dla ground
    [fieldType.mMelee]: MWarriorPict,
    [fieldType.eMelee]: EWarriorPict,
    [fieldType.mRange]: MRangerPict,
    [fieldType.eRange]: ERangerPict
}

export default function SelectedCharacterComp(){
    const [character, setCharacter] = useState<fieldTypeEnum>(fieldType.ground)
    const [fieldSelected, setFieldSelected] = useState<field>(new field(fieldType.ground))
    useEffect(() => {
        const characterHandlerClass: SelectedCharacter = new SelectedCharacter((character: field) => {
            setCharacter(character.type)
            setFieldSelected(character)
        })

        return () => {
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasLeftClick, characterHandlerClass)
        }
    }, []);

    if (character === fieldType.ground) {
        return (
            <>
            </>
        )
    }

    // skoro nie jest groundem to musi być jednnostką ze statystykami które chcemy wyświetlić graczowi

    const fieldContent = fieldSelected.content

    let comp = <></>

    switch (character) {
        case fieldType.mMelee:
            const mMelee = fieldContent as MWarrior
            comp = <Box>
                        health := {mMelee.health} &nbsp;
                        damage := {mMelee.attack}&nbsp;
                        range := {mMelee.range}
                    </Box>
            break
        case fieldType.eMelee:
            const eMelee = fieldContent as EWarrior
            comp = <Box sx={{display: "flex", flexDirection: "column"}}>
                <>health := {eMelee.health}</>
                <>damage := {eMelee.attack}</>
                <>range := {eMelee.range}</>
            </Box>
            break
        case fieldType.mRange:
            break
        case fieldType.eRange:
            break
    }

    return(
        <Box sx={{display: "flex", alignItems: "center", flexDirection: "column"}}>
            <Box component="img" src={characterToImage[character]} alt={character.toFixed()} width="40px" height="40px" style={{margin: "auto",borderRadius: "10px"}}/>
            {comp}
        </Box>
    )

}