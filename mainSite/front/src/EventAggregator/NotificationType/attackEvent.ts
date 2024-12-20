export default class AttackEvent{
    type: string = "AttackEvent"
    attackerId:number
    victimId: number


    constructor(aId : number, vId: number) {
        this.attackerId = aId
        this.victimId = vId
    }
}