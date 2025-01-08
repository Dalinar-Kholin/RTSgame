import {fieldTypeEnum} from "../../Field.ts";

export interface ICharactersUtils{
    health: number
    speed: number
    isMoving: boolean
    attack: number
    range: number
    type: fieldTypeEnum
    stopAction: boolean
}