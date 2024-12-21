import {parseDataPrototype} from "./frameParser.ts";
import {FrameTypeEnum} from "./frameTypeEnum.ts";

export class DataMessageFrame {
    message: string

    constructor(name: string) {
        this.message = name
    }

    packageDataFrame() : ArrayBuffer{
        const typedArray1 = new Int8Array(this.message.length+1);
        typedArray1[0] = FrameTypeEnum.message; // typ ramki
        for (let i = 1; i <= this.message.length; i++) {
            typedArray1[i] = this.message.charCodeAt(i-1);
        }
        return typedArray1
    }
}

export const parseDataMessageFrame =  (arr : Uint8Array) => {
    return new DataMessageFrame(
        String.fromCharCode(...arr)
    )
}

parseDataPrototype.setParserFunc(parseDataMessageFrame, FrameTypeEnum.message)