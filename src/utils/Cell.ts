import { ColorName, colorNames, colorNamesShortened } from './Colors'

export type ScreenCoordinates = {
    x: number,
    y: number
}

export type Thermometer = {
    members: Set<Cell>,
    error: boolean
}

export type KillerCage = {
    members: Set<Cell>
    sum: number,
    error: boolean
}

export type CellCoordinates = {
    x: number
    y: number
}

export class ColorGroup {
    private _members: Set<Cell> = new Set()
    private _visibleCells: Set<Cell> = new Set()

    constructor(members: Set<Cell>, color: ColorName | null) {
        this.members = members
        for (const cell of this.members) {
            cell.colorGroups.add(this)
            if (color) cell.color = color
        }
    }

    calculateVisibleCells() {
        if (this._members.size === 0) return
        this._visibleCells = [...this._members].map(cell => cell.visibleCells).reduce((a, b) => a.intersection(b))
    }

    remove(cell: Cell) {
        cell.colorGroups.delete(this)
        this.members.delete(cell)
    }

    set members(value: Set<Cell>) {
        this._members = value
        this.calculateVisibleCells()
    }

    get members() {
        return this._members
    }

    get visibleCells() {
        return this._visibleCells
    }
}

export class Cell {
    // Intrinsic properties
    private readonly _coords: CellCoordinates

    // Primary properties
    private _value: number = 0
    private _notes: Set<number> = new Set()
    private _hint: boolean = false
    private _color: ColorName = 'default'
    private readonly _clue: boolean = false
    private readonly _solution: number

    // Additional properties
    public hasVisibleError: boolean = false
    public highlighted: boolean = false
    public possibleValues: Set<number> = new Set()
    public locked: boolean = false

    // Board geometry
    public visibleCells: Set<Cell> = new Set()
    public box: Set<Cell> = new Set()
    public row: Set<Cell> = new Set()
    public column: Set<Cell> = new Set()
    public orthogonalCells: Set<Cell> = new Set()
    public units: Set<Cell>[] = []
    public colorGroups: Set<ColorGroup> = new Set()

    // Render properties
    public screenPosition: ScreenCoordinates = { x: 0, y: 0 }
    public valuePosition: ScreenCoordinates = { x: 0, y: 0 }
    public animationColor: string = ''
    public animationGamma: number = 1

    // Killer
    public cage: KillerCage | null = null
    public cageSum: number = 0

    // Thermo
    public thermometer: Thermometer | null = null

    constructor(coords: CellCoordinates, clue: boolean, solution: number, value: number) {
        this._coords = coords
        this._solution = solution
        this._clue = clue
        this._value = value
    }

    get coords() { return this._coords }

    get value() { return this._value }
    set value(value) { this._value = value }

    get color() { return this._color }
    set color(color) { this._color = color }

    get notes() { return this._notes }
    set notes(notes) { this._notes = notes }

    get clue() { return this._clue || this._hint }

    get hint() { return this._hint }
    set hint(value: boolean) {
        if (value && !this._clue) {
            if (this._solution !== 0) {
                this._hint = true
                this.value = this._solution
            }
        } else {
            this._hint = false
        }
    }

    get solution() {
        return this._solution
    }

    get dataToSave(): string {
        let result = this.value.toString()

        if (this.notes.size > 0) result += 'N' + [...this.notes].join('')
        if (this.color !== 'default') result += 'C' + colorNamesShortened[colorNames.indexOf(this.color)]
        if (this.hint) result += 'H'
        if (this.locked) result += 'L'

        return result
    }
}
