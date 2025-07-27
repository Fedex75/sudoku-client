import { ColorName, colorNames, colorNamesShortened } from './Colors';

export type ScreenCoordinates = {
    x: number,
    y: number;
};

export type Thermometer = {
    members: Set<Cell>,
    error: boolean;
};

export type KillerCage = {
    members: Set<Cell>;
    sum: number,
    error: boolean;
};

export type CellCoordinates = {
    x: number;
    y: number;
};

export class ColorGroup {
    private _members: Set<Cell> = new Set();
    private _visibleCells: Set<Cell> = new Set();

    constructor(members: Set<Cell>, color: ColorName | null) {
        this.members = members;
        for (const cell of this.members) {
            cell.addColorGroup(this);
        }
    }

    calculateVisibleCells() {
        if (this._members.size === 0) return;
        this._visibleCells = [...this._members].map(cell => cell.visibleCells).reduce((a, b) => a.intersection(b));
    }

    remove(cell: Cell) {
        cell.deleteColorGroup(this);
        this.members.delete(cell);
    }

    set members(value: Set<Cell>) {
        this._members = value;
        this.calculateVisibleCells();
    }

    get members() {
        return this._members;
    }

    get visibleCells() {
        return this._visibleCells;
    }
}

export class Cell {
    // Intrinsic properties
    private readonly _coords: CellCoordinates;

    // Primary properties
    private _value: number = 0;
    private _notes: Set<number> = new Set();
    private _hint: boolean = false;
    private _color: ColorName | null = null;
    private readonly _clue: boolean = false;
    private readonly _solution: number;

    // Additional properties
    public hasVisibleError: boolean = false;
    public highlighted: boolean = false;
    public possibleValues: Set<number> = new Set();
    private _locked: boolean = false;

    // Board geometry
    public visibleCells: Set<Cell> = new Set();
    public box: Set<Cell> = new Set();
    public row: Set<Cell> = new Set();
    public column: Set<Cell> = new Set();
    public orthogonalCells: Set<Cell> = new Set();
    public units: Set<Cell>[] = [];
    private _colorGroups: Set<ColorGroup> = new Set();

    // Render properties
    public screenPosition: ScreenCoordinates = { x: 0, y: 0 };
    public valuePosition: ScreenCoordinates = { x: 0, y: 0 };
    public animationColor: string = '';
    public animationGamma: number = 1;

    // Killer
    public cage: KillerCage | null = null;
    public cageSum: number = 0;

    // Thermo
    public thermometer: Thermometer | null = null;

    // Cache
    private stringRepresentation: string = '';

    constructor(coords: CellCoordinates, clue: boolean, solution: number, value: number) {
        this._coords = coords;
        this._solution = solution;
        this._clue = clue;
        this._value = value;
        this.updateStringRepresentation();
    }

    get coords() { return this._coords; }

    get value() { return this._value; }
    set value(value) {
        this._value = value;
        this.updateStringRepresentation();
    }

    get color() { return this._color; }
    set color(color) {
        this._color = color;
        this.updateStringRepresentation();
    }

    get notes() { return this._notes; }
    set notes(notes) {
        this._notes = notes;
        this.updateStringRepresentation();
    }

    get clue() { return this._clue || this._hint; }

    get hint() { return this._hint; }
    set hint(value: boolean) {
        if (value && !this._clue) {
            if (this._solution !== 0) {
                this._hint = true;
                this.value = this._solution;
            }
        } else {
            this._hint = false;
        }
        this.updateStringRepresentation();
    }

    get solution() {
        return this._solution;
    }

    get dataToSave(): string {
        return this.stringRepresentation;
    }

    get colorGroups() {
        return this._colorGroups;
    }

    set colorGroups(value: Set<ColorGroup>) {
        this._colorGroups = value;
        this.updateStringRepresentation();
    }

    public restart() {
        if (!this._clue) this.value = 0;
        this.notes = new Set();
        this.hint = false;
        this.locked = false;
        this.color = null;
        this._colorGroups = new Set();
        this.updateStringRepresentation();
    }

    get locked() {
        return this._locked;
    }

    set locked(value: boolean) {
        this._locked = value;
        this.updateStringRepresentation();
    }

    public addNote(value: number) {
        this.notes.add(value);
        this.updateStringRepresentation();
    }

    public deleteNote(value: number) {
        this.notes.delete(value);
        this.updateStringRepresentation();
    }

    public clearNotes() {
        this.notes.clear();
        this.updateStringRepresentation();
    }

    public addColorGroup(value: ColorGroup) {
        this._colorGroups.add(value);
        this.updateStringRepresentation();
    }

    public deleteColorGroup(value: ColorGroup) {
        this._colorGroups.delete(value);
        this.updateStringRepresentation();
    }

    private updateStringRepresentation() {
        this.stringRepresentation = this.value.toString();

        if (this.notes.size > 0) this.stringRepresentation += 'N' + [...this.notes].join('');
        if (this.color) this.stringRepresentation += 'C' + colorNamesShortened[colorNames.indexOf(this.color)];
        if (this.hint) this.stringRepresentation += 'H';
        if (this.locked) this.stringRepresentation += 'L';
    }
}
