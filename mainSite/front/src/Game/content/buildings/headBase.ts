import {fieldType, fieldTypeEnum} from "../../Field.ts";

export class HeadBase {
    health: number;
    fieldToSpawnTroops: [number,number];
    availableTroops: fieldTypeEnum[];
    constructor(x: number, y: number){ // powinna zajmować tak z 6 pól
        this.health = 100;
        this.fieldToSpawnTroops = [x,y];
        this.availableTroops = [fieldType.mMelee, fieldType.mRange];
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