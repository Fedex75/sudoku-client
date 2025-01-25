import { Cell } from '../../../utils/Cell'
import { GameData } from '../../../utils/DataTypes'
import { decodeMissionString } from '../../../utils/Decoder'
import { ClassicBoard } from '../classic/ClassicBoard'

interface Diagonal {
    members: Set<Cell>
    error: boolean
}

export class SudokuXBoard extends ClassicBoard {
    protected mainDiagonal: Diagonal
    protected secondaryDiagonal: Diagonal

    constructor(data: GameData) {
        super(data)

        this.mainDiagonal = { members: new Set(), error: false }
        this.secondaryDiagonal = { members: new Set(), error: false }
        this.calculateDiagonals()
    }

    get mainDiagonalError() {
        return this.mainDiagonal.error
    }

    get secondaryDiagonalError() {
        return this.secondaryDiagonal.error
    }

    createBoardMatrix(): Cell[][] {
        // When we have solutions for all boards, this will be the same as ClassicBoard's
        const [, encodedClues] = this._mission.split(' ')
        const decodedClues = decodeMissionString(encodedClues)

        const newMatrix: Cell[][] = []
        let column: Cell[] = []
        for (let x = 0; x < this.nSquares; x++) {
            column = []
            for (let y = 0; y < this.nSquares; y++) {
                const index = y * this.nSquares + x
                column.push(new Cell(
                    { x, y },
                    decodedClues[index] !== '0',
                    0,
                    Number.parseInt(decodedClues[index])
                ))
            }
            newMatrix.push(column)
        }
        return newMatrix
    }

    calculateDiagonals() {
        this.mainDiagonal = { members: new Set(), error: false }
        this.secondaryDiagonal = { members: new Set(), error: false }

        for (let i = 0; i < this.nSquares; i++) {
            const cellMainDiagonal = this.get({ x: i, y: i })
            if (cellMainDiagonal) {
                cellMainDiagonal.units.push(this.mainDiagonal.members)
                this.mainDiagonal.members.add(cellMainDiagonal)
            }

            const cellSecondaryDiagonal = this.get({ x: i, y: this.nSquares - 1 - i })
            if (cellSecondaryDiagonal) {
                cellSecondaryDiagonal.units.push(this.secondaryDiagonal.members)
                this.secondaryDiagonal.members.add(cellSecondaryDiagonal)
            }
        }

        this.units.push(this.mainDiagonal.members)
        this.units.push(this.secondaryDiagonal.members)

        for (const cell of this.allCells) {
            // The cells that this one can see is the union of all its units, minus itself
            cell.visibleCells = cell.units.reduce((a, b) => a.union(b), new Set()).difference(new Set([cell]))
        }
    }

    hasAdditionalErrors(): boolean {
        return this.mainDiagonal.error || this.secondaryDiagonal.error
    }

    checkAdditionalErrors(): void {
        this.mainDiagonal.error = [...this.mainDiagonal.members].some(cell => cell.error)
        this.secondaryDiagonal.error = [...this.secondaryDiagonal.members].some(cell => cell.error)
    }
}
