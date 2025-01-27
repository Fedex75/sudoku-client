import { Cell, KillerCage } from '../../../utils/Cell'
import { GameData } from '../../../utils/DataTypes'
import { defaultSettings } from '../../../utils/SettingsHandler'
import { ClassicBoard } from '../classic/ClassicBoard'

export class KillerBoard extends ClassicBoard {
    public cages: KillerCage[]

    constructor(data: GameData, settings = defaultSettings) {
        super(data, settings)
        this.cages = this.createCages()
        for (const cage of this.cages) this.solveLastInCage(cage)
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

    public setValue(of: Cell | Set<Cell>, to: number): void {
        super.setValue(of, to)
        let cells = (of instanceof Cell) ? [of] : [...of]
        for (const cage of cells.map(cell => cell.cage)) {
            if (!cage) continue
            this.solveLastInCage(cage)
        }
    }

    private solveLastInCage(cage: KillerCage) {
        if (!this._settings.killerAutoSolveLastInCage || this.nSquares <= 3) return

        let remaining = cage.members.size
        let sum = 0
        cage.members.forEach(cell => {
            if (cell.value > 0) remaining--
            sum += cell.value
        })

        if (remaining === 1 && cage.sum - sum <= 9) {
            cage.members.forEach(cell => {
                if (cell.value === 0) {
                    this.setValue(cell, cage.sum - sum)
                }
            })
        }
    }

    private createCages() {
        const [, , , cages] = this.mission.split(' ')

        const newCages: KillerCage[] = []
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
            newCages.push(newCage)
        }

        for (const cell of this.allCells) {
            if (cell.cage) cell.visibleCells = cell.visibleCells.union(cell.cage.members).difference(new Set([cell]))
        }

        return newCages
    }

    protected findSolution(): string {
        const [, , solution] = this.mission.split(' ')
        return solution
    }

    protected checkAdditionalErrors(): void {
        for (const cage of this.cages) {
            let sum = 0
            for (const cell of cage.members) {
                if (cell.value > 0) sum += cell.value
                else {
                    sum = -1
                    break
                }
            }

            cage.error = (sum !== -1 && sum !== cage.sum)
        }
    }

    protected hasAdditionalErrors(): boolean {
        return [...this.cages].some(cage => cage.error)
    }
}
