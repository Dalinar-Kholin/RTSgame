import './App.css'

const socketOne = new WebSocket("ws://127.0.0.1/socketOne")
const socketTwo = new WebSocket("ws://127.0.0.1/socketTwo")
socketTwo.binaryType = 'arraybuffer'; // ustawnienie socketa na czytanie binarnych danych

socketOne.addEventListener('open', () => {
    console.log('Połączenie WebSocket zostało otwarte.');
});
// Obsługa zdarzenia otwarcia połączenia
socketTwo.addEventListener('open', () => {
    console.log('Połączenie WebSocket zostało otwarte.');
});

socketOne.onopen= () => {
    console.log("połączono")
}
socketOne.onmessage= (e)=>{
    if (e.data%10 == 0){
        console.log(e.data)
    }
}


const parseData =  (arr : Uint8Array) => {
    const dataView = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    return new DataFrame(
        dataView.getInt32(0),
        dataView.getInt32(4),
        String.fromCharCode(...arr).substring(8)
    )
}

class DataFrame{
    len: number
    id: number
    name: string

    constructor(len : number, id: number, name: string) {
        this.id = id
        this.len = len
        this.name = name
    }
}



socketTwo.onmessage = (e) => {
    console.log(e)
    if (e.data instanceof ArrayBuffer){
        console.log("essa\n")
        let frame = parseData(new Uint8Array(e.data))
        console.log(`parsed data ${frame.id} ${frame.len} ${frame.name} `)
    }else{
        console.log("pogger\n")
    }
}


function App() {

    // Obsługa zdarzenia otwarcia połączenia

    return (
        <>
            essa

        </>
  )
}

export default App
