import {FrameType, FrameTypeEnumType} from "./frameTypeEnum.ts";

/*
* jest singletonem aby ta funkcja nie była cały czas tworzona i usuwana w kółko 60 razy na sekundę
* */

export class Parser{
    static #parser: Parser

    private constructor(){
    }

    public static get instance(): Parser {
        if (!Parser.#parser) {
            Parser.#parser = new Parser();
        }

        return Parser.#parser;
    }

    public parse(arr: Uint8Array): FrameType {
        const parseFunction = (this as any).getParserFunc(arr[0]);
        return parseFunction(arr.subarray(1));
    }

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

Object.setPrototypeOf(Parser.prototype, parseDataPrototype);



interface ParseDataPrototype {
    parseFunctionsArray: ((arr: Uint8Array) => FrameType)[];
    getParserFunc(this: ParseDataPrototype, frameType: FrameTypeEnumType): (arr: Uint8Array) => FrameType;
    setParserFunc(this: ParseDataPrototype, fn: (arr: Uint8Array) => FrameType, type: FrameTypeEnumType): void;
}




