import { fieldTypeEnum} from "../../Game/Field.ts";



export default class SpawnCharacterEventObject{
    characterType: fieldTypeEnum
    constructor(type: fieldTypeEnum) {
        this.characterType = type
    }
}
