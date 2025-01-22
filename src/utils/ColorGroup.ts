import { ColorName } from './Colors'
import { Cell } from './DataTypes'
import { intersection, remove } from './Utils'

export class ColorGroup {
    private _members: Cell[] = []
    private _visibleCells: Cell[] = []

    constructor(members: Cell[], color: ColorName | null) {
        this.members = members
        for (const cell of this.members) {
            cell.cache.colorGroups.push(this)
            if (color) cell.color = color
        }
    }

    calculateVisibleCells() {
        this._visibleCells = intersection(this.members.map(c => c.cache.visibleCells))
    }

    remove(cell: Cell) {
        remove(this, cell.cache.colorGroups)
        this.members = this.members.filter(member => member !== cell)
    }

    set members(value: Cell[]) {
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
