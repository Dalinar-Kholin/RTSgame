import {FrameTypeEnum} from "./frameTypeEnum.ts";
import field, {fieldType, fieldTypeEnum} from "../../Game/Field.ts";
import {cord, unitMap} from "../../Game/Game.ts";
import {parseDataPrototype} from "./frameParser.ts";
import {ICharactersUtils} from "../../Game/content/characters/utils.ts";


interface INewBoardReceivedFrame{
    type: fieldTypeEnum
    cord: cord
    content: object // najważniejsze informacje o jednostce
    // dla nas ważne jest typ, zdrowie w sumie to na razie to tylko zdrowie
}

let emptyBoardField: INewBoardReceivedFrame = {
    type: fieldType.ground,
    cord: [0, 0],
    content: {}
}

export class newBoardReceivedFrame{
    newBoard:INewBoardReceivedFrame[]

    constructor(board: INewBoardReceivedFrame[]) {
        this.newBoard = board
    }

    // ma początku jaki to jest pakiet
    packageDataFrame(): Uint8Array{ // tablica zawierająca wszystkie dane o naszych obiektach na tablicy
        // ilość pakietów *
        const typedArray1 = new Uint8Array(this.newBoard.length * 5/*typ, koordynaty X, Y, zdrowie - 2 Bajty*/+1 /*typ pakietu*/);
        typedArray1[0] = FrameTypeEnum.boardFrame; // typ ramki
        const dataTab = this.newBoard
        const len = dataTab.length

        let boardIndex = 0;

        for (let i = 0; i < len; i++){
            typedArray1[(i*5)+1] = dataTab[boardIndex].type
            typedArray1[(i*5)+2] = dataTab[boardIndex].cord[0]
            typedArray1[(i*5)+3] = dataTab[boardIndex].cord[1]
            const health = (dataTab[boardIndex].content as ICharactersUtils).health
            typedArray1[(i*5)+4] = health>>8
            typedArray1[(i*5)+5] = health%256
            boardIndex++
        }
        return typedArray1
    }
}

const mapIntoFrame = (key: field, cord: cord): INewBoardReceivedFrame=>{
    return {
        content: key.content as object/*wiemy że w field będzie kontent*/, cord: [cord[0], cord[1]], type: key.type
    }
}

export function PackageGameBoard(): INewBoardReceivedFrame[] {
    let res: INewBoardReceivedFrame[] = Array.from(
        { length: unitMap.size },
        () => emptyBoardField
    )
    let iter = 0
    for (const unitMapKey of unitMap.keys()) {
        res[iter] = mapIntoFrame(unitMapKey, unitMap.get(unitMapKey) as cord/*wiemy że zawsze ten obiekt występuje*/)
        iter++
    }
    return res
}

const parse = (arr: Uint8Array) : newBoardReceivedFrame => {
    const len =  Math.round(arr.length / 5)
    let board: INewBoardReceivedFrame[] = Array.from(
        { length: len }, // boje się .0000012 po dzieleniu przez 5 stąd round
        () => emptyBoardField
    )
    for (let i = 0; i < len; i++) {
        board[i] = {
            type: arr[i*5],
            cord: [arr[i*5+1], arr[i*5+2]],
            content: {
                health: arr[i * 5 + 3] << 8 | arr[i * 5 + 4]
            }
        }
    }
    return new newBoardReceivedFrame(board)
}

parseDataPrototype.setParserFunc(parse, FrameTypeEnum.boardFrame)