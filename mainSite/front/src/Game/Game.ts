import field, {fieldType, fieldTypeEnum} from "./Field.ts";
import EventAggregatorClass, {EventTypeEnum} from "../EventAggregator/EventAggregatorClass.ts";
import {handleLeft, handleNewBoardReceived, handleRight, handleSpawn} from "./eventHandlers.ts";
import {playerNumber} from "../components/mainSite.tsx";
import {EWarrior, MWarrior} from "./content/characters/mWarrior.ts";
import {ERanger, MRanger} from "./content/characters/mRanger.ts";
import {eHeadBase, HeadBase, mHeadBase} from "./content/buildings/headBase.ts";

export const gameSize = [256, 256]
export const visibilitySize = [100, 100] // rozmiar jednego pola widzenia
export const charCordEnum: {
    x: number,
    y: number
} = {
    x: 0,
    y: 0
}

/*ICOM:
*   komunikacja między serverem a frontendem, w razie zminay u gracza, gracz wysyła gdzie są wszytkie jego jednostki
*
*   na początku gracze widzią wszystko, potem się to może zmieni XD
* */

export type cord = [number,number]

export let unitMap = new Map<field, cord> // mapa naszych jednostek na planszy
export let enemyUnitMap = new Map<field, cord> // mapa jednostek przeciwnika na planszy


export const GroundObject = new field(fieldType.ground)
// nie ma po co tworzyć miliona obiektów typu ground, można stworzyć tylko jeden i go kopiować, dla reszty obiektów potrzebujemy unikatów



export let myBaseObject: {base: HeadBase, cord: cord} = {base: new mHeadBase(12,12), cord: [0,0]}

let canvas: HTMLCanvasElement | null = null
let ctx :  CanvasRenderingContext2D | null;
let raf: any;


type FieldMap = {
    [key in fieldTypeEnum]: string;
};




export let GameBoard: field[][] = []

export let myMelee = fieldType.mMelee
export let myRange = fieldType.mRange
export let myBase = fieldType.mBase
export let enemyMelee = fieldType.eMelee
export let enemyRange = fieldType.eRange
export let enemyBase = fieldType.eBase

export let typeToObject: (() => object)[] = []

let colorPalette: FieldMap ={

}

//let BoardToDraw: field[][] = [] // tablica przekazywana przez backend do narysowania
export let offsets= {
    offsetX: 0,
    offsetY: 0
}



const draw = () => {
    if (ctx === null){
        console.log("error")
        return
    }
    canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null
    if (canvas === null){
        throw new Error("cant take canvas")
    }
    const rect = canvas.getBoundingClientRect();
    charCordEnum.y = Math.round(rect.top + window.scrollY)
    charCordEnum.x = Math.round(rect.left + window.screenX)
    let context:  CanvasRenderingContext2D = ctx as CanvasRenderingContext2D
    for (let i = 0; i < visibilitySize[0]; i++) {
        for (let j = 0; j < visibilitySize[1]; j++) {
            context.fillStyle=colorPalette[GameBoard[i+offsets.offsetX][j+offsets.offsetY].type];
            context.fillRect(i*10, j*10, 10, 10);
        }
    }
    raf = window.requestAnimationFrame(draw);
}

let running = false;

class animator{
    board: field[][]
    constructor(board: { board : field[][] }) {
        canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null
        if (canvas === null){
            throw new Error("cant take canvas")
        }

        ctx = canvas.getContext("2d")
        if (ctx === null){
            throw new Error("cant take context")
        }
        this.board = board.board
    }

    cancelAnimating(){
        window.cancelAnimationFrame(raf)
        running = false
    }

}


export default class Game{
    static #instance: Game; // singleton bo inaczej może być przypał
    animator: animator
    gameBoard: field[][] = Array.from(
        { length: gameSize[0] },
        () => Array.from(
            { length: gameSize[1] },
            () => GroundObject
        )
    );

    private constructor() {
        if (playerNumber === 1){
            myMelee = fieldType.eMelee
            myRange = fieldType.eRange
            myBase = fieldType.eBase
            enemyMelee = fieldType.mMelee
            enemyRange = fieldType.mRange
            enemyBase = fieldType.mBase
            typeToObject[myMelee] = () => {return new EWarrior()}
            typeToObject[myRange] = () => {return new ERanger()}
            typeToObject[myBase] = () => {return new eHeadBase(32,32)}
            typeToObject[enemyMelee] = () => {return new MWarrior()}
            typeToObject[enemyRange] = () => {return new MRanger()}
            typeToObject[enemyBase] = () => {return new mHeadBase(12,12)}
        }else{
            typeToObject[myMelee] = () => {return new MWarrior()}
            typeToObject[myRange] = () => {return new MRanger()}
            typeToObject[myBase] = () => {return new mHeadBase(12,12)}
            typeToObject[enemyMelee] = () => {return new EWarrior()}
            typeToObject[enemyRange] = () => {return new ERanger()}
            typeToObject[enemyBase] = () => {return new eHeadBase(32,32)}
        }

        colorPalette = {
            [fieldType.ground]: "#000000",
            [enemyMelee]: "#ff0000",
            [myMelee]: "#00ff00",
            [myRange]: "#0000ff",
            [enemyRange]: "#ff00ff",
            [myBase]: "#00ffff",
            [enemyBase]: "#ffff00"
        }

        this.animator = new animator({board: this.gameBoard})
        GameBoard = this.gameBoard
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.CanvasRightClick, handleRight)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.CanvasLeftClick, handleLeft)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.characterSpawned, handleSpawn)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.boardReceived, handleNewBoardReceived)
    } // mamy plansze

    public destructor(){
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasRightClick, handleRight)
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasLeftClick, handleLeft)
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.characterSpawned, handleSpawn)
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.boardReceived, handleNewBoardReceived)
        this.gameBoard = Array.from(
            { length: gameSize[0] },
            () => Array.from(
                { length: gameSize[1] },
                () => GroundObject
            )
        );
        GameBoard = this.gameBoard
    }


    public static get instance(): Game {
        if (!Game.#instance) {
            Game.#instance = new Game();
        }
        return Game.#instance;
    }


    private animate(){
        if (running){
            return
        }
        running = true
        window.requestAnimationFrame(draw)
    }

    public refreshCanvas(){
        this.animator = new animator({board: this.gameBoard})
    }

    public stopAnimating(){
        this.animator.cancelAnimating()
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasRightClick, handleRight)
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasLeftClick, handleLeft)

    }
    public startAnimating(){
        this.animate()
    }

}
//