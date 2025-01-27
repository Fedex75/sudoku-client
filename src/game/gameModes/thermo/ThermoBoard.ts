import { Cell, Thermometer } from '../../../utils/Cell'
import { GameData } from '../../../utils/DataTypes'
import { defaultSettings } from '../../../utils/SettingsHandler'
import { ClassicBoard } from '../classic/ClassicBoard'

export class ThermoBoard extends ClassicBoard {
    public thermometers: Thermometer[]

    constructor(data: GameData, settings = defaultSettings) {
        super(data, settings)

        this.thermometers = []
        this.createThermometers()
        this.recreatePossibleValuesCache()
    }

    public setValue(of: Cell | Set<Cell>, to: number): void {
        super.setValue(of, to)

        let cells = (of instanceof Cell) ? [of] : [...of]
        for (const cell of cells) if (cell.thermometer) this.updatePossibleValuesByThermometer(cell.thermometer)
    }

    private createThermometers() {
        const [, , thermometersData] = this._mission.split(' ')

        for (const thermometerString of thermometersData.split(';')) {
            const newThermometer: Thermometer = {
                members: new Set(),
                error: false
            }

            for (const cellIndex of thermometerString.split(',').map(s => Number.parseInt(s))) {
                const y = Math.floor(cellIndex / this.nSquares)
                const x = cellIndex - y * this.nSquares
                const cell = this.get({ x, y })
                if (!cell) continue
                cell.thermometer = newThermometer
                newThermometer.members.add(cell)
            }

            for (const cell of this.allCells) {
                if (cell.thermometer) cell.visibleCells = cell.visibleCells.union(cell.thermometer.members).difference(new Set([cell]))
            }

            this.thermometers.push(newThermometer)
        }
    }

    protected findSolution(): string {
        return ''
    }

    protected checkAdditionalErrors(): void {
        for (const thermo of this.thermometers) {
            let currentMaxValue = 0
            thermo.error = false
            for (const cell of thermo.members) {
                if (cell.value > 0) {
                    if (cell.value < currentMaxValue) {
                        thermo.error = true
                    } else {
                        currentMaxValue = cell.value
                    }
                }
            }
        }
    }

    protected hasAdditionalErrors(): boolean {
        return [...this.thermometers].some(t => t.error)
    }

    protected updatePossibleValuesByThermometer(thermo: Thermometer): void {
        const members = [...thermo.members]
        for (let i = 0; i < members.length; i++) {
            const cell = members[i]
            if (cell.value > 0) {
                // Remove smaller values from cells after this one
                for (let j = i + 1; j < members.length; j++) {
                    const cell2 = members[j]
                    for (let n = 1; n <= cell.value; n++) cell2.possibleValues.delete(n)
                    if (this._settings.showPossibleValues) {
                        for (let n = 1; n <= cell.value; n++) this.setNote(n, cell2, false)
                    }
                }

                // Remove higher values from cells before this one
                for (let j = i - 1; j >= 0; j--) {
                    const cell2 = members[j]
                    for (let n = cell.value; n <= this.nSquares; n++) cell2.possibleValues.delete(n)
                    if (this._settings.showPossibleValues) {
                        for (let n = cell.value; n <= this.nSquares; n++) this.setNote(n, cell2, false)
                    }
                }
            }
        }
    }

    protected recreatePossibleValuesCache(): void {
        super.recreatePossibleValuesCache()
        if (this.thermometers) for (const thermo of this.thermometers) this.updatePossibleValuesByThermometer(thermo)
    }
}
