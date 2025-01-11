import {fieldType, fieldTypeEnum} from "../../Field.ts";
import {ICharactersUtils} from "../characters/utils.ts";

export class HeadBase implements ICharactersUtils{
    health: number;
    fieldToSpawnTroops: [number,number];
    availableTroops: fieldTypeEnum[];
    constructor(x: number, y: number){ // powinna zajmować tak z 6 pól
        this.health = 1;
        this.fieldToSpawnTroops = [x,y];
        this.availableTroops = [fieldType.mMelee, fieldType.mRange];
    }

    attackUnit(__x: number, __y: number, __callback?: () => void): void {
    }

    moveUnit(__x: number, __y: number, __callback?: () => void): void {
    }

    takeDamage(damage: number): boolean {
        this.health -= damage;
        return this.health >0 ;
    }

    takeRange(): number {
        return 0;
    }

    takeStatAttack(): number {
        return 0;
    }

    takeStatHealth(): number {
        return 0;
    }
}


export class mHeadBase extends HeadBase{

    constructor(x: number, y: number){
        super(x, y);
    }
}

export class eHeadBase extends HeadBase{
    constructor(x: number, y: number){
        super(x, y);
    }
}