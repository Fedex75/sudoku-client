import { AccentColor } from '../../utils/Colors'
import { GameModeName } from '../../utils/Difficulties'
import { ClassicCanvas } from './classic/ClassicCanvas'
import { KillerCanvas } from './killer/KillerCanvas'
import { SandwichCanvas } from './sandwich/SandwichCanvas'
import { SudokuXCanvas } from './sudokuX/SudokuXCanvas'
import { ThermoCanvas } from './thermo/ThermoCanvas'

export type AnyCanvas = ClassicCanvas | KillerCanvas | SudokuXCanvas | SandwichCanvas | ThermoCanvas

export function createCanvas(gameMode: GameModeName, accentColor: AccentColor, notPlayable: boolean, boxBorderWidthFactor: number): AnyCanvas {
    switch (gameMode) {
        case 'classic':
            return new ClassicCanvas(accentColor, notPlayable, boxBorderWidthFactor)
        case 'killer':
            return new KillerCanvas(accentColor, notPlayable, boxBorderWidthFactor)
        case 'sudokuX':
            return new SudokuXCanvas(accentColor, notPlayable, boxBorderWidthFactor)
        case 'sandwich':
            return new SandwichCanvas(accentColor, notPlayable, boxBorderWidthFactor)
        case 'thermo':
            return new ThermoCanvas(accentColor, notPlayable, boxBorderWidthFactor)
        default:
            throw new Error(`Unknown game mode: ${gameMode}`)
    }
}
