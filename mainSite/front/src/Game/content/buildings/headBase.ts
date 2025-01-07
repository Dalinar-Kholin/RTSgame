import {fieldType, fieldTypeEnum} from "../../Field.ts";

class HeadBase {
    headBase: number;

    constructor(){ // powinna zajmować tak z 6 pól
        this.headBase = 100;
    }
}


export class mHeadBase extends HeadBase{
    fieldToSpawnTroops: [number,number];
    availableTroops: fieldTypeEnum[];
    constructor(x: number, y: number){
        super();
        this.fieldToSpawnTroops = [x,y];
        this.availableTroops = [fieldType.mMelee, fieldType.mRange];
    }
}

export class eHeadBase extends HeadBase{
    constructor(){
        super();
    }
}