import {parseDataPrototype} from "./frameParser.ts";
import {FrameTypeEnum} from "./frameTypeEnum.ts";
import {DataMessageFrameSuper} from "./dataMessageFrame.ts";



// te klasy są w sumie takie same, jednak potrzebóje rozróżnienienia ich w jakiś sposób bez użycia dodatkowych parametrów typu id
export class ServerMessageFrame extends DataMessageFrameSuper{}

export const parseServerMessageFrame =  (arr : Uint8Array) => {
    return new ServerMessageFrame(
        String.fromCharCode(...arr)
    )
}

parseDataPrototype.setParserFunc(parseServerMessageFrame, FrameTypeEnum.serverMessage)