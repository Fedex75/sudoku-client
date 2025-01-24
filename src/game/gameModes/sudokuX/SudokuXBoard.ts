import { ClassicBoard } from '../classic/ClassicBoard'

export class SudokuXBoard extends ClassicBoard {
    setMode(): void {
        this._mode = 'sudokuX'
    }
}
