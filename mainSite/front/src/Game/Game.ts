import field, {fieldType, fieldTypeEnum} from "./Field.ts";
import EventAggregatorClass, {EventTypeEnum} from "../EventAggregator/EventAggregatorClass.ts";
import LeftClickEventObject, {RightClickEventObject} from "../EventAggregator/NotificationType/clicks.ts";
import {MWarrior} from "./content/characters/mWarrior.ts";

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
    [fieldType.mMelee]: "#ff0000",
    [fieldType.eMelee]: "#00ff00",
    [fieldType.mRange]: "#0000ff",
    [fieldType.eRange]: "#ff00ff"
}


let boardToDraw: field[][] = []
export let offsets= {
    offsetX: 0,
    offsetY: 0
}


const draw = () => {
    if (ctx === null){
        return
    }
    let context:  CanvasRenderingContext2D = ctx as CanvasRenderingContext2D
    for (let i = 0; i < visibilitySize[0]; i++) {
        for (let j = 0; j < visibilitySize[1]; j++) {
            context.fillStyle=colorPalette[boardToDraw[i+offsets.offsetX][j+offsets.offsetY].type];
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
        const rect = canvas.getBoundingClientRect();
        charCordEnum.y = Math.round(rect.top + window.scrollY)
        charCordEnum.x = Math.round(rect.left + window.screenX)

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

class eventInterpreter{
    gameBoard: field[][]
    selectedCharacter: object | null = null
    Handle(notification: object): void { // niejawnie używane w eventAggregatorze
        if (notification instanceof RightClickEventObject) {
            console.log(`right event ${notification.x} ${notification.y}`)
            this.gameBoard[Math.round(notification.x/10) + offsets.offsetX][Math.round(notification.y/10) + offsets.offsetY].setCharacter(new MWarrior(fieldType.mMelee))
        }else if (notification instanceof LeftClickEventObject) {
            this.selectedCharacter = this.gameBoard[Math.round(notification.x/10) + offsets.offsetX][Math.round(notification.y/10) + offsets.offsetY].content
            console.log(`left event  ${Math.round(notification.x/10)} ${Math.round(notification.y/10)}`)
        }
        boardToDraw = this.gameBoard
    }


    constructor(board: field[][], selectedCharacter: object | null = null) {
        this.gameBoard = board
        this.selectedCharacter = selectedCharacter
    }
}


export default class Game{
    static #instance: Game; // singleton bo inaczej może być przypał
    animator: animator
    interpreter: eventInterpreter
    gameBoard: field[][] = Array.from(
        { length: gameSize[0] },
        () => Array.from(
            { length: gameSize[1] },
            () => new field(fieldType.ground)
        )
    );

    selectedCharacter: object | null = null // jaki obiekt jest zaznaczony na akcje

    private constructor() {
        this.animator = new animator({board: this.gameBoard})
        this.interpreter = new eventInterpreter(this.gameBoard, this.selectedCharacter)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.CanvasRightClick, this.interpreter)
        EventAggregatorClass.instance.registerSubscriber(EventTypeEnum.CanvasLeftClick, this.interpreter)

    } // mamy plansze

    public clearGame(){
      this.gameBoard= Array.from(
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
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasRightClick, this.interpreter)
        EventAggregatorClass.instance.unSubscribe(EventTypeEnum.CanvasLeftClick, this.interpreter)

    }
    public startAnimating(){
        this.animate()
    }

}
//