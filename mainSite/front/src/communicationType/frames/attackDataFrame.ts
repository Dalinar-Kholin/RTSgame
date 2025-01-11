import {cord} from "../../Game/Game.ts";
import {parseDataPrototype} from "./frameParser.ts";
import {FrameTypeEnum} from "./frameTypeEnum.ts";

export default class AttackDataFrame{
    damage: number
    cord: cord

    constructor(dmg: number, crd: cord) {
        this.damage = dmg
        this.cord = crd
    }


    packageDataFrame(): Uint8Array{
        const typedArray1 = new Uint8Array(4);
        typedArray1[0] = FrameTypeEnum.attack; // typ ramki
        typedArray1[1] = this.damage
        typedArray1[2] = this.cord[0]
        typedArray1[3] = this.cord[1]
        return typedArray1
    }

}

export const parseAttackDataFrame =  (arr : Uint8Array) => {
    return new AttackDataFrame(
        arr[0],
        [arr[1], arr[2]]
    )
}

parseDataPrototype.setParserFunc(parseAttackDataFrame, FrameTypeEnum.attack)