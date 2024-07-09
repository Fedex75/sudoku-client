import { GameData, RawGameData } from "../utils/DataTypes";
import { GameModeName } from "../utils/Difficulties";
import ClassicBoard from "./classic/ClassicBoard";

export function newGameFromMode(mode: GameModeName, data: GameData | RawGameData){
    const nSquares = 9; //TODO: fix this assumption

    switch (mode){
        case 'classic':
            return new ClassicBoard(data, nSquares);
        case 'killer':
            return new ClassicBoard(data, nSquares);
        case 'sandwich':
            return new ClassicBoard(data, nSquares);
        case 'sudokuX':
            return new ClassicBoard(data, nSquares);
        case 'thermo':
            return new ClassicBoard(data, nSquares);
    }
}

export type AnyBoard = ClassicBoard;
