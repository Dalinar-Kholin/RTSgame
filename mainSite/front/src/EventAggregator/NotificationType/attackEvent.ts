import {cord} from "../../Game/Game.ts";

export default class AttackEventObject{
    damage: number
    cord : cord
    constructor(dmg : number, crd: cord) {
        this.damage = dmg
        this.cord = crd
    }
}