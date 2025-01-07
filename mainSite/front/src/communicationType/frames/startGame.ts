import {parseDataPrototype} from "./frameParser.ts";
import {FrameTypeEnum} from "./frameTypeEnum.ts";
export class StartGameFrame{

    constructor() {}

    packageDataFrame(): Uint8Array{
        const typedArray1 = new Uint8Array(1);
        typedArray1[0] = FrameTypeEnum.startGame; // typ ramki
        return typedArray1
    }
}

export const parseStartGameFrame =  (__arr : Uint8Array) => {return new StartGameFrame()}


parseDataPrototype.setParserFunc(parseStartGameFrame, FrameTypeEnum.startGame)