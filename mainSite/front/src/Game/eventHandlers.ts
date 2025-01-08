import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../EventAggregator/EventAggregatorClass.ts";
import LeftClickEventObject, {RightClickEventObject} from "../EventAggregator/NotificationType/clicks.ts";
import field, {fieldType, fieldTypeEnum} from "./Field.ts";
import {MWarrior} from "./content/characters/mWarrior.ts";
import {GameBoard, offsets} from "./Game.ts";
import {mHeadBase} from "./content/buildings/headBase.ts";
import SpawnCharacterEventObject from "../EventAggregator/NotificationType/spawnCharacter.ts";
import {MRanger} from "./content/characters/mRanger.ts";
import {ICharactersUtils} from "./content/characters/utils.ts";

export let fieldSelected: field = new field(fieldType.ground)
export let character: fieldTypeEnum = fieldType.ground
export let fieldSelectedCord: number[] = [0,0]



export const handleLeft: ISubscribe =  {
    Handle: (notification: object):void =>{
        const notify =  notification as LeftClickEventObject
        const x= Math.floor(notify.x/10) + offsets.offsetX
        const y =Math.floor(notify.y/10) + offsets.offsetY
        fieldSelected = GameBoard[x][y]
        fieldSelectedCord = [x,y]
        character = fieldSelected.type
        EventAggregatorClass.instance.notify(EventTypeEnum.changeCharacter, fieldSelected)
        console.log(fieldSelectedCord)
    }
}

export const handleRight: ISubscribe =  {
    Handle: (notification: object):void =>{
        let notify = notification as RightClickEventObject
        const x= Math.floor(notify.x/10) + offsets.offsetX
        const y =Math.floor(notify.y/10) + offsets.offsetY

        if (character === fieldType.mMelee || character === fieldType.mRange){
            // dodajemy przesuwanie jednostki po mapie oczekujące na zdarzenie timer
            //TODO: tutaj zacząć
            // chcemy dodać subskrybenta który będzie przesówał jednostkę

            // chcemy móc sprawdzić czy obecnie wybrana jednostka to ta którą przesówamy, aby w razie czego
            // móc zmieniać dynamicznie fieldSelcetedCord
            const character = fieldSelected


            let takeTypedObject = (character: field): ICharactersUtils => {
                if (character.type === fieldType.mMelee){
                    return character.content as MWarrior
                }else{
                    return character.content as MRanger
                }
            }
            const char  = takeTypedObject(character)
            if (char.isMoving){
                char.stopAction = true
                return
            }
            char.isMoving = true
            let accX: number = fieldSelectedCord[0]
            let accY: number = fieldSelectedCord[1] // chcemy móc śledzić gdzie jest wybrana jednostka, wczasie może się to zminieać
            let timer = 0

            const mover: ISubscribe = {
                Handle(__notification: object): void {
                    // wywoływane tylko poprzez timer, który nie ma obiektu, liczy się sam event
                    if (timer < char.speed){ // im mniejsza wartość tym szybciej jednostka chodzi
                        timer++
                        return
                    }
                    timer = 0 // wykonanie ruchu

                    const oldX:number = accX
                    const oldY:number = accY
                    if (accX !== x){
                        if (accX < x){
                            accX++

                        }else{
                            accX--
                        }
                    }

                    if (accY !== y){
                        if (accY < y){
                            accY++
                        }else{
                            accY--
                        }
                    }
                    if (GameBoard[accX][accY].type !== fieldType.ground){
                        timer = char.speed// czekamy aż droga się zwolni, nie zabierając całego ruchu
                        return
                    }
                    console.log("move")
                    GameBoard[accX][accY] = GameBoard[oldX][oldY]// przesuwamy jednostkę
                    GameBoard[oldX][oldY] = new field(fieldType.ground) // to mnie zaboli i to wiem, jednostki nie mogą się przecinać

                    // skoro ruch się wykonał, mogę wysłać dane do serwera o zmianie planszy
                    EventAggregatorClass.instance.notify(EventTypeEnum.boardChanged, GameBoard[accX][accY])
                    // jak zarządzać stanem plaszy, nie chemy co plansze tworzyć nowych jednostek, chcemy je przesuwać
                    // po zmianie planszy wysyłamy gdzie znajdują się wszystkie MOJE jednostki
                    // przy odbieraniu planszy chcemy zaktualizować plansze, ale nie chcemy tworzyć nowych jednostek
                    // sprawdzamy jednostki po ich ID, tak by można było śledzić ruch jednostek


                    if (fieldSelected === character){
                        fieldSelectedCord = [accX, accY]
                    }

                    if ((accX === x && accY === y) || char.stopAction){
                        // zatrzymujemy subskrybenta
                        char.stopAction = false
                        char.isMoving = false
                        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.timerEvent, this)
                    }

                }
            }

            EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.timerEvent, mover)
        }
    }
}

export const handleSpawn: ISubscribe = {
    Handle(notification: object): void {
        const base =  fieldSelected.content as mHeadBase
        const notify = notification as SpawnCharacterEventObject
        const x= base.fieldToSpawnTroops[0]
        const y= base.fieldToSpawnTroops[1]
        const newField = new field(notify.characterType)
        if(notify.characterType === fieldType.mMelee){
            newField.content = new MWarrior(fieldType.mMelee)
        }else{
            newField.content = new MRanger(fieldType.mRange)
        }
        GameBoard[x][y] = newField
    }

}