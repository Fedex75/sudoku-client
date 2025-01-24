import { Cell } from '../../../utils/Cell'
import { ClassicBoard } from '../classic/ClassicBoard'

export class SandwichBoard extends ClassicBoard {
    setMode(): void {
        this._mode = 'sandwich'
    }

    createBoardMatrix(): Cell[][] {
        const result = super.createBoardMatrix()

        // TODO: add sandwich clues

        return result
    }
}
