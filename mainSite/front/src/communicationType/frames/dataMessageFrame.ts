import {parseDataPrototype} from "./frameParser.ts";
import {FrameTypeEnum} from "./frameTypeEnum.ts";

export class DataMessageFrame {
    message: string

    constructor(name: string) {
        this.message = name
    }
}
export const parseDataMessageFrame =  (arr : Uint8Array) => {
    return new DataMessageFrame(
        String.fromCharCode(...arr)
    )
}

export function packageDataFrame(frame: DataMessageFrame) : ArrayBuffer{
    const typedArray1 = new Int8Array(frame.message.length+1);
    typedArray1[0] = FrameTypeEnum.message; // typ ramki
    for (let i = 1; i <= frame.message.length; i++) {
        typedArray1[i] = frame.message.charCodeAt(i-1);
    }
    return typedArray1
}

parseDataPrototype.setParserFunc(parseDataMessageFrame, FrameTypeEnum.message)