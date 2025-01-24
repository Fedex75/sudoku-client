import { GameData } from '../../utils/DataTypes'
import { GameModeName } from '../../utils/Difficulties'
import { ClassicBoard } from './classic/ClassicBoard'
import { KillerBoard } from './killer/KillerBoard'
import { SandwichBoard } from './sandwich/SandwichBoard'
import { SudokuXBoard } from './sudokuX/SudokuXBoard'
import { ThermoBoard } from './thermo/ThermoBoard'

export type AnyBoard = ClassicBoard | KillerBoard | SudokuXBoard | SandwichBoard | ThermoBoard

export function createBoard(gameMode: GameModeName, data: GameData): AnyBoard {
    let newGame

    switch (gameMode) {
        case 'classic':
            newGame = new ClassicBoard(data)
            break
        case 'killer':
            newGame = new KillerBoard(data)
            break
        case 'sudokuX':
            newGame = new SudokuXBoard(data)
            break
        case 'sandwich':
            newGame = new SandwichBoard(data)
            break
        case 'thermo':
            newGame = new ThermoBoard(data)
            break
        default:
            throw new Error(`Unknown game mode: ${gameMode}`)
    }

    newGame.triggerValuesChanged()
    return newGame
}
