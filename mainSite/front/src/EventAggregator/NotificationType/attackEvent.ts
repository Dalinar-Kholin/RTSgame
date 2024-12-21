export default class AttackEventObject{
    attackerId:number
    victimId: number

    constructor(aId : number, vId: number) {
        this.attackerId = aId
        this.victimId = vId
    }
}