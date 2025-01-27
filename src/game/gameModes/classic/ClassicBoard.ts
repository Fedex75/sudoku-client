import brightness from "../../../utils/Utils"
import { decodeMissionString } from "../../../utils/Decoder"
import Solver from "../../../utils/Solver"
import Board from "../../../utils/Board"
import { themes } from '../../Themes'
import { Cell } from '../../../utils/Cell'

export class ClassicBoard extends Board {
    protected findSolution(): string {
        const [, encodedClues] = this._mission.split(' ')
        const decodedClues = decodeMissionString(encodedClues)
        return Solver.solve(decodedClues)
    }

    protected createBoardMatrix(): Cell[][] {
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
                    Number.parseInt(this._solution[index]) || 0,
                    Number.parseInt(decodedClues[index])
                ))
            }
            newMatrix.push(column)
        }
        return newMatrix
    }

    protected hasAdditionalErrors(): boolean {
        return false
    }

    protected checkAdditionalErrors(): void { }

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

    protected createBoardGeometry() {
        this.units = []

        for (let row = 0; row < this.nSquares; row++) {
            const column = new Set<Cell>()
            for (let y = 0; y < this.nSquares; y++) {
                const cell = this.get({ x: row, y })
                if (cell) {
                    column.add(cell)
                    cell.column = column
                    cell.units.push(column)
                }
            }

            this.units.push(column)
        }

        for (let col = 0; col < this.nSquares; col++) {
            const row = new Set<Cell>()
            for (let x = 0; x < this.nSquares; x++) {
                const cell = this.get({ x, y: col })
                if (cell) {
                    row.add(cell)
                    cell.row = row
                    cell.units.push(row)
                }
            }
            this.units.push(row)
        }

        for (let boxX = 0; boxX < this.nSquares; boxX += 3) {
            for (let boxY = 0; boxY < this.nSquares; boxY += 3) {
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

    get calculatorValue(): number {
        return [...this.selectedCellsValues].reduce((a, b) => a + b, 0)
    }

    protected customAfterValuesChanged(): void { }
}
