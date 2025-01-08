import field, {fieldType, fieldTypeEnum} from "./Field.ts";
import EventAggregatorClass, {EventTypeEnum} from "../EventAggregator/EventAggregatorClass.ts";
import {handleLeft, handleRight, handleSpawn} from "./eventHandlers.ts";

export const gameSize = [256, 256]
const visibilitySize = [100, 100] // rozmiar jednego pola widzenia
export const charCordEnum: {
    x: number,
    y: number
} = {
    x: 0,
    y: 0
}





let canvas: HTMLCanvasElement | null = null
let ctx :  CanvasRenderingContext2D | null;
let raf: any;


type FieldMap = {
    [key in fieldTypeEnum]: string;
};

let colorPalette: FieldMap ={
    [fieldType.ground]: "#000000",
    [fieldType.eMelee]: "#ff0000",
    [fieldType.mMelee]: "#00ff00",
    [fieldType.mRange]: "#0000ff",
    [fieldType.eRange]: "#ff00ff",
    [fieldType.mBase]: "#00ffff",
    [fieldType.eBase]: "#ffff00"
}


export let GameBoard: field[][] = []
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
            () => new field(fieldType.ground)
        )
    );

    private constructor() {


        this.animator = new animator({board: this.gameBoard})
        GameBoard = this.gameBoard
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.CanvasRightClick, handleRight)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.CanvasLeftClick, handleLeft)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.characterSpawned, handleSpawn)
    } // mamy plansze

    public destructor(){
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasRightClick, handleRight)
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasLeftClick, handleLeft)
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.characterSpawned, handleSpawn)
        this.gameBoard = Array.from(
            { length: gameSize[0] },
            () => Array.from(
                { length: gameSize[1] },
                () => new field(fieldType.ground)
            )
        );
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