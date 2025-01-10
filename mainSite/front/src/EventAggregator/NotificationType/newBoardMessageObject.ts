import {newBoardReceivedFrame} from "../../communicationType/frames/newBoardReceived.ts";

export default class newBoardMessageObject{
    newBoardMessageObject: newBoardReceivedFrame;
    constructor(newBoard :  newBoardReceivedFrame) {
        this.newBoardMessageObject = newBoard
    }
}