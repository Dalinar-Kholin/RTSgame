import {fieldType, fieldTypeEnum} from "../../Field.ts";
import {ICharactersUtils} from "./utils.ts";
import {fieldSelected, fieldSelectedCord, serFieldSelectedCord} from "../../eventHandlers.ts";
import EventAggregatorClass, {EventTypeEnum, ISubscribe} from "../../../EventAggregator/EventAggregatorClass.ts";
import {GameBoard, GroundObject, unitMap} from "../../Game.ts";
import boardChangedEventObject from "../../../EventAggregator/NotificationType/boardChangeEventObject.ts";
import AttackEventObject from "../../../EventAggregator/NotificationType/attackEvent.ts";

const warriorStats={
    attack: 5,
    attackSpeed: 300,
    health: 10,
    range:1,
    speed: 50
}

export class defaultWarrior implements ICharactersUtils{
    health: number
    range: number
    isMoving: boolean = false
    stopAction: boolean = false
    type: fieldTypeEnum
    constructor(type : fieldTypeEnum) {
        this.health = warriorStats.health
        this.range = warriorStats.range
        this.type= type
    }

    // true if still alive
    takeDamage(damage: number): boolean{
        console.log(`take damage${damage}`)
        this.health -= damage
        return this.health > 0;
    }

    moveUnit(x: number, y: number, callback?: ()=> void): void {
        let accX: number = fieldSelectedCord[0]
        let accY: number = fieldSelectedCord[1] // chcemy móc śledzić gdzie jest wybrana jednostka, wczasie może się to zminieać
        let timer = 0
        if (accY === y && accX === x){
            console.log("no move moved")
            callback?.()
            return;
        }
        const character = fieldSelected
        const warrior = this
        const mover: ISubscribe = {
            Handle(__notification: object): void {
                // wywoływane tylko poprzez timer, który nie ma obiektu, liczy się sam event
                if ((accX === x && accY === y) || warrior.stopAction){
                    // zatrzymujemy subskrybenta
                    // moveEnded = true
                    warrior.stopAction = false
                    warrior.isMoving = false
                    EventAggregatorClass.instance.unSubscribe(EventTypeEnum.timerEvent, this)
                    callback?.()
                    return;
                }

                if (timer < warriorStats.speed){ // im mniejsza wartość tym szybciej jednostka chodzi
                    timer++
                    return
                }
                timer = 0 // wykonanie ruchu
                // dodać kontrolera poruszania się, ponieważ na razie jednostki mogą wyparowywać oraz
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
                    timer = warriorStats.speed// czekamy aż droga się zwolni, nie zabierając całego ruchu
                    return
                }

                GameBoard[accX][accY] = GameBoard[oldX][oldY] // przesuwamy jednostkę
                GameBoard[oldX][oldY]= GroundObject // to mnie zaboli i to wiem, jednostki nie mogą się przecinać



                if (fieldSelected === character){
                    serFieldSelectedCord(accX, accY)
                }
                unitMap.set(character, [accX, accY]) // stare jest przykrywane nowym

                // skoro ruch się wykonał, mogę wysłać dane do serwera o zmianie planszy
                EventAggregatorClass.instance.notify(EventTypeEnum.boardChanged, new boardChangedEventObject(Date.now()))
                // jak zarządzać stanem plaszy, nie chemy co plansze tworzyć nowych jednostek, chcemy je przesuwać
                // po zmianie planszy wysyłamy gdzie znajdują się wszystkie MOJE jednostki
                // przy odbieraniu planszy chcemy zaktualizować plansze, ale nie chcemy tworzyć nowych jednostek
                // sprawdzamy jednostki po ich ID, tak by można było śledzić ruch jednostek



            }
        }
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.timerEvent, mover)


    }

    attackUnit(x: number, y: number, callback?: () => void) {
        const unit = this
        let counter =0
        const attacker: ISubscribe = {
            Handle(__notification: object): void {
                if (unit.stopAction || GameBoard[x][y].type === fieldType.ground){
                    EventAggregatorClass.instance.unSubscribe(EventTypeEnum.timerEvent, this)
                    callback?.()
                    return
                }else{
                    if ((++counter) > warriorStats.attackSpeed){
                        EventAggregatorClass.instance.notify(EventTypeEnum.AttackEventSend, new AttackEventObject(warriorStats.attack, [x,y]))
                        counter = 0
                    }
                }
                return;
            }
        }
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.timerEvent, attacker)
    }

    takeRange(): number {
        return warriorStats.range;
    }

    takeStatAttack(): number {
        return warriorStats.attack;
    }
    takeStatHealth(): number {
        return this.health;
    }


}


export class MWarrior extends defaultWarrior{
    constructor() {
        super(fieldType.mMelee);
    }
}

export class EWarrior extends defaultWarrior{
    constructor() {
        super(fieldType.mMelee);
    }
}