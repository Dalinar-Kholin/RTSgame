import field, {fieldType, fieldTypeEnum} from "../../Game/Field.ts";
import {useEffect, useState} from "react";
import ERangerPict from "../../../src/assets/ERanger.jpg";
import MRangerPict from "../../../src/assets/MRanger.jpg";
import EWarriorPict from "../../../src/assets/EWarrior.jpg";
import MWarriorPict from "../../../src/assets/MWarrior.jpg";
import MBase from "../../../src/assets/mBase.jpg";
import EBase from "../../../src/assets/eBase.jpg";
import {Box, Button} from "@mui/material";
import {EWarrior, MWarrior} from "../../Game/content/characters/mWarrior.ts";
import EventAggregatorClass, {EventTypeEnum} from "../../EventAggregator/EventAggregatorClass.ts";
import SpawnCharacterEventObject from "../../EventAggregator/NotificationType/spawnCharacter.ts";


// type to image

type imageMap = {
    [key in fieldTypeEnum]: string;
};

let characterToImage: imageMap = { // moim zdaniem w tym typie powinien wystąpić błąd ponieważ nie ma obsługi dla ground
    [fieldType.mMelee]: MWarriorPict,
    [fieldType.eMelee]: EWarriorPict,
    [fieldType.mRange]: MRangerPict,
    [fieldType.eRange]: ERangerPict,
    [fieldType.mBase]: MBase,
    [fieldType.eBase]: EBase,
}

export default function SelectedCharacterComp(){
    const [myCharacter, setMyCharacter]= useState<fieldTypeEnum>(fieldType.ground)

    const [myFieldSelected, setMyFieldSelected] = useState<field>(new field(fieldType.ground))

    useEffect(() => {
        const changeChar = {
            Handle(notification: object): void {
                const notif = notification as field
                setMyCharacter(notif.type)
                setMyFieldSelected(notif)
            }
        }
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.changeCharacter, changeChar)

        return () => {
            EventAggregatorClass.instance.unSubscribe(EventTypeEnum.changeCharacter, changeChar)
        }
    }, []); // chcemy zasubskrybować event aggregatora na change character

    /*useEffect(() => {
        setMyCharacter(character)
        setMyFieldSelected(fieldSelected)
    }, [character, fieldSelected]) w ogólności nie działa XDDD*/
    // skoro nie jest groundem to musi być jednnostką ze statystykami które chcemy wyświetlić graczowi



    const fieldContent = myFieldSelected.content

    let comp = <></>

    switch (myCharacter) {
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
        case fieldType.mBase:
            comp= <Box>
                <Button onClick={() => { EventAggregatorClass.instance.notify(EventTypeEnum.characterSpawned,new SpawnCharacterEventObject(fieldType.mMelee))}}>warrior</Button>
                <Button onClick={() => { EventAggregatorClass.instance.notify(EventTypeEnum.characterSpawned,new SpawnCharacterEventObject(fieldType.mRange))}}>ranger</Button>
            </Box>


    }

    return(
        <Box sx={{display: "flex", alignItems: "center", flexDirection: "column", height: "100px"}}>
            { myCharacter !== fieldType.ground ? <Box component="img" src={characterToImage[myCharacter]} alt={myCharacter.toFixed()} width="40px"
                  height="40px" style={{margin: "auto", borderRadius: "10px"}}/> : <></>}
            {comp}
        </Box>
    )

}