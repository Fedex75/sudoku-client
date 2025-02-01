import Board from '../../utils/Board'
import { GameData } from '../../utils/DataTypes'
import { GameModeName } from '../../utils/Difficulties'
import { defaultSettings } from '../../utils/hooks/SettingsHandler'
import { ClassicBoard } from './classic/ClassicBoard'
import { KillerBoard } from './killer/KillerBoard'
import { SandwichBoard } from './sandwich/SandwichBoard'
import { SudokuXBoard } from './sudokuX/SudokuXBoard'
import { ThermoBoard } from './thermo/ThermoBoard'

export function BoardFactory(gameMode: GameModeName, data: GameData, settings = defaultSettings): Board {
    let newGame

    switch (gameMode) {
        case 'classic':
            newGame = new ClassicBoard(data.id, data.mission, settings)
            break
        case 'killer':
            newGame = new KillerBoard(data.id, data.mission, settings)
            break
        case 'sudokuX':
            newGame = new SudokuXBoard(data.id, data.mission, settings)
            break
        case 'sandwich':
            newGame = new SandwichBoard(data.id, data.mission, settings)
            break
        case 'thermo':
            newGame = new ThermoBoard(data.id, data.mission, settings)
            break
        default:
            throw new Error(`Unknown game mode: ${gameMode}`)
    }

    newGame.init(data)

    return newGame
}
