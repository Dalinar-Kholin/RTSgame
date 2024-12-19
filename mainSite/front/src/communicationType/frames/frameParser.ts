import {FrameType, FrameTypeEnumType} from "./frameTypeEnum.ts";
import EmptyDataFrame from "./emptyDataFrame.ts";

export default function ParseFrame(data: Uint8Array){
    let parser: {parse: (data: Uint8Array)=> FrameType} = {
        parse: (__arr )=> {
            return EmptyDataFrame
        }
    }
    Object.setPrototypeOf(parser, parseDataPrototype);

    parser.parse = function(this: typeof parseDataPrototype, arr: Uint8Array): FrameType {
        let parseFunction = this.getParserFunc(arr[0])
        return parseFunction(arr.subarray(1,arr.length))
    }

    return parser.parse(data)
}


interface ParseDataPrototype {
    parseFunctionsArray: ((arr: Uint8Array) => FrameType)[];
    getParserFunc(this: ParseDataPrototype, frameType: FrameTypeEnumType): (arr: Uint8Array) => FrameType;
    setParserFunc(this: ParseDataPrototype, fn: (arr: Uint8Array) => FrameType, type: FrameTypeEnumType): void;
}

export let parseDataPrototype: ParseDataPrototype = {
    parseFunctionsArray: [] as ((arr: Uint8Array) => FrameType)[],

    getParserFunc(this: typeof parseDataPrototype, frameType: FrameTypeEnumType): (arr: Uint8Array) => FrameType {
        return this.parseFunctionsArray[frameType];
    },
    setParserFunc(this: typeof parseDataPrototype, fn: (arr: Uint8Array) => FrameType, type: FrameTypeEnumType): void {
        this.parseFunctionsArray[type] = fn;
    }
};


