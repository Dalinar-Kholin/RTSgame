import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../EventAggregator/EventAggregatorClass.ts";
import LeftClickEventObject, {RightClickEventObject} from "../EventAggregator/NotificationType/clicks.ts";
import field, {fieldType, fieldTypeEnum, IHealthUtils} from "./Field.ts";
import {
    cord,
    enemyBase,
    enemyMelee, enemyRange, enemyUnitMap,
    GameBoard,
    GroundObject, myBase, myBaseObject,
    myMelee,
    myRange,
    offsets,
    typeToObject,
    unitMap
} from "./Game.ts";
import {mHeadBase} from "./content/buildings/headBase.ts";
import SpawnCharacterEventObject from "../EventAggregator/NotificationType/spawnCharacter.ts";
import {ICharactersUtils} from "./content/characters/utils.ts";
import newBoardMessageObject from "../EventAggregator/NotificationType/newBoardMessageObject.ts";
import boardChangedEventObject from "../EventAggregator/NotificationType/boardChangeEventObject.ts";
import AttackEventObject from "../EventAggregator/NotificationType/attackEvent.ts";
import {EndGame} from "../communicationType/frames/EndGame.ts";
import {playerNumber} from "../components/mainSite.tsx";

export let fieldSelected: field = new field(fieldType.ground)
export let character: fieldTypeEnum = fieldType.ground

export function serFieldSelectedCord(x: number, y:number): void {
    fieldSelectedCord = [x,y]
}
export let fieldSelectedCord: cord = [0,0]



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



const moveCharacter = (x: number, y: number): void => {
    // dodajemy przesuwanie jednostki po mapie oczekujące na zdarzenie timer
    //TODO: tutaj zacząć
    // chcemy dodać subskrybenta który będzie przesówał jednostkę

    // chcemy móc sprawdzić czy obecnie wybrana jednostka to ta którą przesówamy, aby w razie czego
    // móc zmieniać dynamicznie fieldSelcetedCord

    const mover = fieldSelected.content as ICharactersUtils
    mover.moveUnit(x, y, () => console.log("koniec ruchu"))
}




// TODO: dodać ID jednostek i po ataku móc śledzić ich ruch
// na razie mamy jednak Polskie gówno
// po ataku przechodzimy na pole umożliwiające atak a następnie zabieramy hp
// jeżeli umarła, następuje kasacja
const attackCharacter = (x: number, y: number): void => {
    const attacker = fieldSelected.content as ICharactersUtils
    const range = attacker.takeRange()
    const unitCords = fieldSelectedCord
    let newX = unitCords[0]
    let newY = unitCords[1]
    if (Math.abs(x- unitCords[0]) > range){
        newX = x > unitCords[0] ? x - range : x + range
    }
    if (Math.abs(y- unitCords[1]) > range){
        newY = y > unitCords[1] ? y - range : y + range
    }
    console.log(newX, newY, x, y)
    attacker.moveUnit(newX, newY, () => attacker.attackUnit(x, y))

    // jednostka z pola selectedField atakuje jednostkę na polu x,y
}

export const handleRight: ISubscribe =  {
    Handle: (notification: object):void =>{
        let notify = notification as RightClickEventObject
        const x= Math.floor(notify.x/10) + offsets.offsetX
        const y =Math.floor(notify.y/10) + offsets.offsetY


        switch (character){
            case myRange:
            case myMelee:
                const type = GameBoard[x][y].type
                if (type === enemyRange || type === enemyMelee || type === enemyBase){
                    console.log("?")
                    attackCharacter(x, y)
                }else{
                    moveCharacter(x, y)
                }
                break
            case myBase:
                myBaseObject.base.fieldToSpawnTroops = [x,y]
                break
            case enemyRange:
            case enemyBase:
            case enemyMelee:

                break

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
        newField.content = typeToObject[notify.characterType]()
        GameBoard[x][y] = newField
        unitMap.set(newField, [x,y]) // dodanie jednostki do Mapa
        // wypadało by poinformować serwer o zmianie planszy
        EventAggregatorClass.instance.notify(EventTypeEnum.boardChanged, new boardChangedEventObject(Date.now()))
    }
}


export const handleAttackData : ISubscribe = {
    Handle(notification: object): void {
        const notify = notification as AttackEventObject
        const x = notify.cord[0]
        const y = notify.cord[1]
        const unit = GameBoard[x][y].content as ICharactersUtils
        console.log(`unit := ${unit}`)
        if (!unit.takeDamage(notify.damage)){ // czy jednostka umarła

            unitMap.delete(GameBoard[x][y]) // usuwamy jednostkę z mapy
            if (GameBoard[x][y].type === myBase){
                // koniec gry
                EventAggregatorClass.instance.notify(EventTypeEnum.gameLost, new EndGame(playerNumber))
                return
            }
            GameBoard[x][y] = GroundObject // jeżeli jednostka umarła, zastępujemy ją piaskiem
        }
        EventAggregatorClass.instance.notify(EventTypeEnum.boardChanged, new boardChangedEventObject(Date.now(), true))
        // tutaj chcemy zaktualizować planszę
        // na razie niech to będzie p
    }

}



export const handleNewBoardReceived: ISubscribe = {
    Handle(notification: object): void {
        const notify = notification as newBoardMessageObject
        const board = notify.newBoardMessageObject.newBoard

        // czyszczenie boardu z jednostek przeciwnika w celu zaktualizowania ich stanu

        for (const enemy of enemyUnitMap.keys()) {
            const cords: cord = enemyUnitMap.get(enemy) as cord
            GameBoard[cords[0]][cords[1]] = GroundObject
        }

        // jednostki przeciwnika wyczyszczone
        enemyUnitMap.clear()


        for (let i = 0; i < board.length; i++){
            if (board[i].type === enemyBase || board[i].type === enemyMelee || board[i].type === enemyRange){
                const x = board[i].cord[0]
                const y = board[i].cord[1]
                const newField = new field(board[i].type)
                newField.content = typeToObject[board[i].type]() as IHealthUtils
                newField.setHealth((board[i].content as IHealthUtils).health)
                GameBoard[x][y] = newField
                enemyUnitMap.set(newField, [x,y])
            }
        }

    }
}


