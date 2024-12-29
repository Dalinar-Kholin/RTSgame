import {fieldTypeEnum} from "../../Field.ts";

const warriorStats={
    attack: 1,
    health: 10,
    range:1
}

export class defaultWarrior{
    attack: number
    health: number
    range: number
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
    constructor(type : fieldTypeEnum) {
        super(type);
    }
}

export class EWarrior extends defaultWarrior{
    constructor(type : fieldTypeEnum) {
        super(type);
    }
}