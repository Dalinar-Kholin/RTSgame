
export const fieldType=  {
    ground: 0,
    mMelee: 1,
    eMelee: 2,
    mRange: 3,
    eRange: 4,
    mBase: 5,
    eBase: 6,
}

export type fieldTypeEnum= (typeof fieldType)[keyof typeof fieldType]

interface ISetCharacter{
    type: fieldTypeEnum
}

export interface IHealthUtils{
    health: number
}

export default class field{
    type: fieldTypeEnum
    content: object | null = null
    constructor(fieldType: fieldTypeEnum) {
        this.type = fieldType
    }

    setCharacter(character: ISetCharacter){
        this.type = character.type
        this.content = character
    }
    setHealth(health: number){
        if (this.content !== null){
            const newObj = this.content as IHealthUtils
            newObj.health = health
            this.content= newObj
        }
    }
}