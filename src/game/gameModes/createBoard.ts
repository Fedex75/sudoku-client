import { GameData } from '../../utils/DataTypes'
import { GameModeName } from '../../utils/Difficulties'
import { defaultSettings } from '../../utils/SettingsHandler'
import { ClassicBoard } from './classic/ClassicBoard'
import { KillerBoard } from './killer/KillerBoard'
import { SandwichBoard } from './sandwich/SandwichBoard'
import { SudokuXBoard } from './sudokuX/SudokuXBoard'
import { ThermoBoard } from './thermo/ThermoBoard'

export type AnyBoard = ClassicBoard | KillerBoard | SudokuXBoard | SandwichBoard | ThermoBoard

export function createBoard(gameMode: GameModeName, data: GameData, settings = defaultSettings): AnyBoard {
    let newGame

    switch (gameMode) {
        case 'classic':
            newGame = new ClassicBoard(data, settings)
            break
        case 'killer':
            newGame = new KillerBoard(data, settings)
            break
        case 'sudokuX':
            newGame = new SudokuXBoard(data, settings)
            break
        case 'sandwich':
            newGame = new SandwichBoard(data, settings)
            break
        case 'thermo':
            newGame = new ThermoBoard(data, settings)
            break
        default:
            throw new Error(`Unknown game mode: ${gameMode}`)
    }

    newGame.triggerValuesChanged()
    return newGame
}
