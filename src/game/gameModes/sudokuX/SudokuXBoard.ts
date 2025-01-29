import { Cell } from '../../../utils/Cell'
import brightness from '../../../utils/Utils'
import { themes } from '../../Themes'
import { ClassicBoard } from '../classic/ClassicBoard'

interface Diagonal {
    members: Set<Cell>
    error: boolean
}

export class SudokuXBoard extends ClassicBoard {
    protected mainDiagonal: Diagonal = { members: new Set(), error: false }
    protected secondaryDiagonal: Diagonal = { members: new Set(), error: false }

    get mainDiagonalError() {
        return this.mainDiagonal.error
    }

    get secondaryDiagonalError() {
        return this.secondaryDiagonal.error
    }

    protected getDataFromMission(): void {
        const [nSquares, , solution] = this.mission.split(' ')
        this._nSquares = Number.parseInt(nSquares)
        this._solution = solution
    }

    protected createBoardGeometry(): void {
        super.createBoardGeometry()

        this.mainDiagonal = { members: new Set(), error: false }
        this.secondaryDiagonal = { members: new Set(), error: false }

        for (let i = 0; i < this._nSquares; i++) {
            const cellMainDiagonal = this.get({ x: i, y: i })
            if (cellMainDiagonal) {
                cellMainDiagonal.units.push(this.mainDiagonal.members)
                this.mainDiagonal.members.add(cellMainDiagonal)
            }

            const cellSecondaryDiagonal = this.get({ x: i, y: this._nSquares - 1 - i })
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

    protected checkErrors(): void {
        super.checkErrors()

        const mainDiagonal = [...this.mainDiagonal.members]
        const secondaryDiagonal = [...this.secondaryDiagonal.members]

        this.mainDiagonal.error = false
        for (let i = 0; i < this.nSquares - 1; i++) {
            if (mainDiagonal[i].value === 0) continue
            for (let j = i + 1; j < this.nSquares; j++) {
                if (mainDiagonal[i].value === mainDiagonal[j].value) {
                    this.mainDiagonal.error = true
                }
            }
        }

        this.secondaryDiagonal.error = false
        for (let i = 0; i < this.nSquares - 1; i++) {
            if (secondaryDiagonal[i].value === 0) continue
            for (let j = i + 1; j < this.nSquares; j++) {
                if (secondaryDiagonal[i].value === secondaryDiagonal[j].value) {
                    this.secondaryDiagonal.error = true
                }
            }
        }
    }

    protected checkAnimations(center: Cell): void {
        super.checkAnimations(center)

        if (this.mainDiagonal.members.has(center) && [...this.mainDiagonal.members].every(cell => cell.value !== 0)) {
            this.animations.push({
                type: 'row',
                startTime: null,
                duration: 750,
                func: ({ theme, progress }) => {
                    this.mainDiagonal.members.forEach(cell => {
                        cell.animationColor = `rgba(${themes[theme].animationBaseColor}, ${brightness(Math.abs(center.coords.x - cell.coords.x), progress, 8, 4)})`
                    })
                }
            })
        }

        if (this.secondaryDiagonal.members.has(center) && [...this.secondaryDiagonal.members].every(cell => cell.value !== 0)) {
            this.animations.push({
                type: 'row',
                startTime: null,
                duration: 750,
                func: ({ theme, progress }) => {
                    this.secondaryDiagonal.members.forEach(cell => {
                        cell.animationColor = `rgba(${themes[theme].animationBaseColor}, ${brightness(Math.abs(center.coords.x - cell.coords.x), progress, 8, 4)})`
                    })
                }
            })
        }
    }
}
