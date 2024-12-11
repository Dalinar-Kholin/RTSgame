export class DataFrame{
    len: number
    id: number
    name: string

    constructor(len : number, id: number, name: string) {
        this.id = id
        this.len = len
        this.name = name
    }
}
export const parseDataFrame =  (arr : Uint8Array) => {
    const dataView = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    return new DataFrame(
        dataView.getInt32(0),
        dataView.getInt32(4),
        String.fromCharCode(...arr).substring(8)
    )
}


export function packageDataFrame(frame: DataFrame) : ArrayBuffer{
    const typedArray1 = new Int8Array(frame.len + 2);
    typedArray1[0] = frame.id; // typ ramki
    for (let i = 1; i <= frame.len; i++) {
        typedArray1[i] = frame.name.charCodeAt(i-1);
    }
    return typedArray1
}