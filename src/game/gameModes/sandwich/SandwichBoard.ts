import { Cell } from '../../../utils/Cell'
import { ClassicBoard } from '../classic/ClassicBoard'

export type SandwichClue = {
    value: number
    visible: boolean
    error: boolean
}

export class SandwichBoard extends ClassicBoard {
    public horizontalClues: SandwichClue[] = []
    public verticalClues: SandwichClue[] = []

    protected getDataFromMission(): void {
        const [nSquares, , solution, hClues, vClues] = this.mission.split(' ')
        this._nSquares = Number.parseInt(nSquares)
        this._solution = solution

        this.horizontalClues = hClues.split(',').map(clue => ({
            value: Number.parseInt(clue),
            visible: true,
            error: false
        }))

        this.verticalClues = vClues.split(',').map(clue => ({
            value: Number.parseInt(clue),
            visible: true,
            error: false
        }))
    }

    protected getSumBetween1And9(row: number, column: number) {
        let unit = []
        let cell: Cell | undefined

        if (row >= 0) {
            cell = this.get({ x: 0, y: row })
            if (!cell) return -1
            unit = [...cell.row]
        } else {
            cell = this.get({ x: column, y: 0 })
            if (!cell) return -1
            unit = [...cell.column]
        }

        let found1or9 = false
        let sum = 0
        for (cell of unit) {
            if (found1or9) {
                if (cell.value === 0) return -1
                if (cell.value === 1 || cell.value === 9) return sum
                sum += cell.value
            } else {
                if (cell.value === 1 || cell.value === 9) found1or9 = true
            }
        }

        return -1
    }

    protected checkErrors(): void {
        super.checkErrors()

        for (let x = 0; x < this._nSquares; x++) {
            const sum = this.getSumBetween1And9(-1, x)
            this.verticalClues[x].visible = true
            this.verticalClues[x].error = false
            if (sum !== -1 && sum !== this.verticalClues[x].value) {
                this.verticalClues[x].error = true
                this._hasErrors = true
            } else if (sum === this.verticalClues[x].value) {
                this.verticalClues[x].visible = false
            }
        }

        for (let y = 0; y < this._nSquares; y++) {
            const sum = this.getSumBetween1And9(y, -1)
            this.horizontalClues[y].visible = true
            this.horizontalClues[y].error = false
            if (sum !== -1 && sum !== this.horizontalClues[y].value) {
                this.horizontalClues[y].error = true
                this._hasErrors = true
            } else if (sum === this.horizontalClues[y].value) {
                this.horizontalClues[y].visible = false
            }
        }
    }
}
