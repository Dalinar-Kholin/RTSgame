import {DataMessageFrame} from "./dataMessageFrame.ts";
import AttackDataFrame from "./attackDataFrame.ts";
import BuildDataFrame from "./buildDataFrame.ts";
import EmptyDataFrame from "./emptyDataFrame.ts";
import {ServerMessageFrame} from "./serverMessageFrame.ts";
import {newBoardReceivedFrame} from "./newBoardReceived.ts";

export const FrameTypeEnum =  {
    empty: 0,
    message: 1,
    attack: 2,
    build: 3,
    serverMessage: 4,
    startGame: 5,
    boardFrame: 6,
    endGame: 7
}

export type FrameTypeEnumType = (typeof FrameTypeEnum)[keyof typeof FrameTypeEnum]

export type FrameType = DataMessageFrame | AttackDataFrame | BuildDataFrame | EmptyDataFrame | ServerMessageFrame | newBoardReceivedFrame