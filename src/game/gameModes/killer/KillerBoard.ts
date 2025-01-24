import { Cell, KillerCage } from '../../../utils/Cell'
import { GameData } from '../../../utils/DataTypes'
import SettingsHandler from '../../../utils/SettingsHandler'
import { ClassicBoard } from '../classic/ClassicBoard'

export class KillerBoard extends ClassicBoard {
    public cages: Set<KillerCage>

    constructor(data: GameData) {
        super(data)

        this.cages = new Set()
        this.createCages()
    }

    createBoardMatrix(): Cell[][] {
        const boardMatrix = super.createBoardMatrix()

        const [, , solution] = this.mission.split(' ')

        for (let x = 0; x < this.nSquares; x++) {
            for (let y = 0; y < this.nSquares; y++) {
                const index = y * this.nSquares + x
                boardMatrix[x][y].solution = Number.parseInt(solution[index])
            }
        }

        return boardMatrix
    }

    createCages() {
        const [, , , cages] = this.mission.split(' ')

        this.cages = new Set()
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
            this.cages.add(newCage)
        }
    }

    customAfterValuesChanged(): void {
        super.customAfterValuesChanged()

        if (SettingsHandler.settings.killerAutoSolveLastInCage && this.nSquares > 3) {
            for (const cage of this.cages) {
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
        }
    }

    calculateUnitsAndVisibility(): void {
        super.calculateUnitsAndVisibility()

        for (const cell of this.allCells) {
            if (cell.cage) cell.visibleCells = cell.visibleCells.union(cell.cage.members).difference(new Set([cell]))
        }
    }

    checkAdditionalErrors(): void {
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

    hasAdditionalErrors(): boolean {
        return [...this.cages].some(cage => cage.error)
    }
}
