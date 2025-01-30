import { Cell, KillerCage } from '../../../utils/Cell'
import { UseHistory } from '../../../utils/DataTypes'
import { ClassicBoard } from '../classic/ClassicBoard'

export class KillerBoard extends ClassicBoard {
    public cages: KillerCage[] = []

    protected getDataFromMission(): void {
        const [nSquares, , solution] = this.mission.split(' ')
        this._nSquares = Number.parseInt(nSquares)
        this._solution = solution
    }

    get calculatorValue(): number {
        const selectedCages = new Set([...this.selectedCells].filter(cell => cell.value === 0).map(cell => cell.cage).filter(cage => cage !== null)) // Get all the cages that the selected cells belong to
        let selectedCellsMatchCagesExactly = [...selectedCages].every(cage => [...cage.members].every(cell => this.selectedCells.has(cell))) // If every cell of every selected cage is in the selected cells

        if (selectedCellsMatchCagesExactly) {
            let sum = 0
            for (const cage of selectedCages) {
                sum += cage.sum
            }

            for (const cell of this.selectedCells) {
                if (cell.value > 0 && cell.cage && !selectedCages.has(cell.cage)) {
                    sum += cell.value
                }
            }

            return sum
        } else {
            return 0
        }
    }

    @UseHistory
    public setValue(params: { of: Cell | Set<Cell>, to: number, causedByUser: boolean }): void {
        super.setValue({ of: params.of, to: params.to, causedByUser: false })

        const cells = (params.of instanceof Cell) ? [params.of] : [...params.of]
        for (const cage of cells.map(cell => cell.cage)) {
            if (!cage) continue
            this.solveLastInCage(cage)
        }
    }

    public restart(): void {
        super.restart()
        for (const cage of this.cages) this.solveLastInCage(cage)
        this.recreatePossibleValuesCache()
        this.triggerValuesChanged(false)
    }

    private solveLastInCage(cage: KillerCage) {
        if (!this._settings.killerAutoSolveLastInCage || this._nSquares <= 3) return // TODO: replace the this._nSquares <= 3 check with settings override

        let remaining = cage.members.size
        let sum = 0
        cage.members.forEach(cell => {
            if (cell.value > 0) remaining--
            sum += cell.value
        })

        if (remaining === 1 && cage.sum - sum <= 9) {
            cage.members.forEach(cell => {
                if (cell.value === 0) {
                    this.setValue({ of: cell, to: cage.sum - sum, causedByUser: false })
                }
            })
        }
    }

    protected createBoardGeometry(): void {
        super.createBoardGeometry()
        const [, , , cages] = this.mission.split(' ')

        this.cages = []
        for (const cage of cages.split(',')) {
            const newCage: KillerCage = {
                members: new Set(),
                sum: 0,
                error: false
            }
            for (let i = 0; i < cage.length; i += 2) {
                const cell = this.get({ x: Number.parseInt(cage[i]), y: Number.parseInt(cage[i + 1]) })
                if (!cell) continue
                newCage.members.add(cell)
                cell.cage = newCage
                newCage.sum += cell.solution
            }
            const cell = this.get({ x: Number.parseInt(cage[0]), y: Number.parseInt(cage[1]) })
            if (cell) cell.cageSum = newCage.sum
            this.cages.push(newCage)
        }

        for (const cell of this.allCells) {
            if (cell.cage) cell.visibleCells = cell.visibleCells.union(cell.cage.members).difference(new Set([cell]))
        }

        for (const cage of this.cages) this.solveLastInCage(cage)
    }

    protected checkErrors(): void {
        super.checkErrors()

        for (const cage of this.cages) {
            cage.error = false
            let sum = 0
            for (const cell of cage.members) {
                if (cell.value > 0) sum += cell.value
                else {
                    sum = -1
                    break
                }
            }

            if (sum !== -1 && sum !== cage.sum) {
                if (this.settings.showErrors && this.settings.showLogicErrors && this.settings.killerShowCageErrors) cage.error = true
                this._hasErrors = true
            }
        }
    }
}
