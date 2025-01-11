import {FrameTypeEnum} from "./frameTypeEnum.ts";
import {parseDataPrototype} from "./frameParser.ts";

export class EndGame{
    winner: number
    constructor(winner: number) {
        this.winner = winner
    }
    packageDataFrame(){
        const typedArray1 = new Uint8Array(2);
        typedArray1[0] = FrameTypeEnum.endGame;
        typedArray1[1] = this.winner
        return typedArray1;
    }
}



const parseEndGame =  (arr : Uint8Array) => {
    return new EndGame(arr[0])
}

parseDataPrototype.setParserFunc(parseEndGame, FrameTypeEnum.endGame)