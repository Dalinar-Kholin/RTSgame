export default class boardChangedEventObject{
    time: number
    isImportante: boolean = false
    constructor(time:number, isImportante?: boolean) {
        this.time = time
        this.isImportante = isImportante || false
    }
}