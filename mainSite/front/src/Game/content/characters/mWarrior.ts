import {fieldType, fieldTypeEnum} from "../../Field.ts";
import {ICharactersUtils} from "./utils.ts";

const warriorStats={
    attack: 1,
    health: 10,
    range:1
}

export class defaultWarrior implements ICharactersUtils{
    attack: number // atack domyślny
    health: number
    range: number
    isMoving: boolean = false
    stopAction: boolean = false
    speed: number = 100 // szybkość jednostki, ile tików timera zajmuje jej przejście do następnego pola
    type: fieldTypeEnum
    constructor(type : fieldTypeEnum) {
        this.attack = warriorStats.attack
        this.health = warriorStats.health
        this.range = warriorStats.range
        this.type= type
    }

    // true if still alive
    takeDamage(damage: number): boolean{
        this.health -= damage
        return this.health > 0;
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