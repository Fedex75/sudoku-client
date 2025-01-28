import brightness from "../../../utils/Utils"
import { decodeMissionString } from "../../../utils/Decoder"
import Solver from "../../../utils/Solver"
import Board from "../../../utils/Board"
import { themes } from '../../Themes'
import { Cell } from '../../../utils/Cell'

export class ClassicBoard extends Board {
    protected getDataFromMission(): void {
        const [nSquares, encodedClues] = this.mission.split(' ')
        this._nSquares = Number.parseInt(nSquares)
        const decodedClues = decodeMissionString(encodedClues)
        this._solution = Solver.solve(decodedClues)
    }

    protected createBoardGeometry() {
        const [, encodedClues] = this._mission.split(' ')
        const decodedClues = decodeMissionString(encodedClues)

        this._board = []
        let column: Cell[] = []
        for (let x = 0; x < this._nSquares; x++) {
            column = []
            for (let y = 0; y < this._nSquares; y++) {
                const index = y * this._nSquares + x
                column.push(new Cell(
                    { x, y },
                    decodedClues[index] !== '0',
                    this._solution === '' ? 0 : Number.parseInt(this._solution[index]),
                    Number.parseInt(decodedClues[index])
                ))
            }
            this._board.push(column)
        }

        this.units = []

        for (let row = 0; row < this._nSquares; row++) {
            const column = new Set<Cell>()
            for (let y = 0; y < this._nSquares; y++) {
                const cell = this.get({ x: row, y })
                if (cell) {
                    column.add(cell)
                    cell.column = column
                    cell.units.push(column)
                }
            }

            this.units.push(column)
        }

        for (let col = 0; col < this._nSquares; col++) {
            const row = new Set<Cell>()
            for (let x = 0; x < this._nSquares; x++) {
                const cell = this.get({ x, y: col })
                if (cell) {
                    row.add(cell)
                    cell.row = row
                    cell.units.push(row)
                }
            }
            this.units.push(row)
        }

        for (let boxX = 0; boxX < this._nSquares; boxX += 3) {
            for (let boxY = 0; boxY < this._nSquares; boxY += 3) {
                const box = new Set<Cell>()
                for (let dX = 0; dX < 3; dX++) {
                    for (let dY = 0; dY < 3; dY++) {
                        const cell = this.get({ x: boxX + dX, y: boxY + dY })
                        if (cell) {
                            box.add(cell)
                            cell.box = box
                            cell.units.push(box)
                        }
                    }
                }
                this.units.push(box)
            }
        }

        for (const cell of this.allCells) {
            cell.orthogonalCells = new Set()
            let c: Cell | undefined
            c = this.get({ x: cell.coords.x - 1, y: cell.coords.y })
            if (c) cell.orthogonalCells.add(c)
            c = this.get({ x: cell.coords.x + 1, y: cell.coords.y })
            if (c) cell.orthogonalCells.add(c)
            c = this.get({ x: cell.coords.x, y: cell.coords.y - 1 })
            if (c) cell.orthogonalCells.add(c)
            c = this.get({ x: cell.coords.x, y: cell.coords.y + 1 })
            if (c) cell.orthogonalCells.add(c)

            // The cells that this one can see is the union of all its units, minus itself
            cell.visibleCells = cell.units.reduce((a, b) => a.union(b), new Set()).difference(new Set([cell]))
        }
    }

    protected checkAnimations(center: Cell): void {
        if ([...center.row].every(cell => cell.value !== 0)) {
            this.animations.push({
                type: 'row',
                startTime: null,
                duration: 750,
                func: ({ theme, progress }) => {
                    center.row.forEach(cell => {
                        cell.animationColor = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(center.coords.x - cell.coords.x), progress, 8, 4)})`
                    })
                }
            })
        }

        if ([...center.column].every(cell => cell.value !== 0)) {
            this.animations.push({
                type: 'col',
                startTime: null,
                duration: 750,
                func: ({ theme, progress }) => {
                    center.column.forEach(cell => {
                        cell.animationColor = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(center.coords.y - cell.coords.y), progress, 8, 4)})`
                    })
                }
            })
        }

        if ([...center.box].every(cell => cell.value !== 0)) {
            this.animations.push({
                type: 'box',
                startTime: null,
                duration: 750,
                func: ({ theme, progress }) => {
                    for (const cell of center.box) {
                        cell.animationColor = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(cell.coords.y % 3 * 3 + cell.coords.x % 3, progress, 8, 8)})`
                    }
                }
            })
        }
    }

    get calculatorValue(): number {
        return [...this.selectedCellsValues].reduce((a, b) => a + b, 0)
    }
}
