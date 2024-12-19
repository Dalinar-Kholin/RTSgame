export default class BuildDataFrame{
    type: number
    place: [number, number]

    constructor(type: number,position: [number, number] ) {
        this.type = type
        this.place = position
    }
}