import { DifficultyIdentifier, DifficultyName, GameModeIdentifier, GameModeName, getDifficulty, getMode } from "./Difficulties";
import { BoardAnimation, BoardHistory, GameData, UseHistory } from "./DataTypes";
import { ColorName, colorNames, colorNamesShortened } from "./Colors";
import { Cell, CellCoordinates, ColorGroup } from './Cell';
import { BOARD_API_VERSION } from './Constants';
import { defaultSettings, Settings } from './hooks/SettingsHandler';

export default abstract class Board {
    // Intrinsic constants
    protected readonly _id: string;
    protected readonly _mode: GameModeName;
    protected readonly _difficulty: DifficultyName;
    protected readonly _mission: string;

    // Board geometry
    protected _nSquares: number = 0;
    protected _board: Cell[][] = [];
    protected units: Set<Cell>[] = [];

    // Additional board information
    protected _settings: Settings;
    protected _solution: string = '';
    protected _complete: boolean = false;
    protected _hasErrors: boolean = false;
    protected _fullNotation: boolean = false;
    protected colorGroups: Set<ColorGroup> = new Set();
    protected _selectedCells: Set<Cell> = new Set();

    // History
    protected stash: string | null = null;
    protected _hasChanged: boolean = false;
    protected history: BoardHistory = [];

    // Public data
    public timer: number = 0;
    public animations: BoardAnimation[] = [];
    public cellPositionsHaveBeenCalculated = false;

    constructor(id: string, mission: string, settings: Settings = defaultSettings) {
        this._id = id;
        this._mode = getMode(this._id[0] as GameModeIdentifier);
        this._difficulty = getDifficulty(this._id[1] as DifficultyIdentifier);
        this._mission = mission;
        this._settings = settings;
    }

    get nSquares() {
        return this._nSquares;
    }

    get fullNotation() { return this._fullNotation; }

    get complete() {
        return this._complete;
    }

    get allCells(): Iterable<Cell> {
        return this.iterateAllCells();
    }

    get id() {
        return this._id;
    }

    get mission() {
        return this._mission;
    }

    get mode() {
        return this._mode;
    }

    get selectedCellsValues(): Set<number> {
        return new Set([...this._selectedCells].map(cell => cell.value).filter(value => value > 0));
    }

    get hasHistory(): boolean {
        return this.history.length > 0;
    }

    get canErase(): boolean {
        return this._selectedCells.size > 0 && [...this._selectedCells].some(cell => !cell.clue && (cell.value !== 0 || cell.notes.size > 0 || cell.color));
    }

    get canGiveHint(): boolean {
        return this._selectedCells.size > 0 && [...this._selectedCells].some(cell => !cell.clue && cell.solution > 0);
    }

    get hasChanged(): boolean {
        return this._hasChanged;
    }

    get selectedCells() {
        return this._selectedCells;
    }

    set selectedCells(value) {
        this._selectedCells = value;
    }

    get difficulty() {
        return this._difficulty;
    }

    set settings(v: Settings) {
        this._settings = v;
        this.triggerValuesChanged(false);
    }

    get settings() {
        return this._settings;
    }

    get completedNumbers() {
        let completedNumbers: Set<number> = new Set();
        let count = Array(this._nSquares).fill(0);
        for (const cell of this.allCells) {
            if (cell.value > 0) {
                count[cell.value - 1]++;
                if (count[cell.value - 1] === this._nSquares) {
                    completedNumbers.add(cell.value);
                }
            }
        }

        return completedNumbers;
    }

    get dataToSave() {
        const dataToSave: GameData = {
            id: this._id,
            mission: this._mission,
            boardString: this.boardToSave,
            timer: this.timer,
            version: BOARD_API_VERSION,
            history: this.history
        };

        return dataToSave;
    }

    // Game mode specific logic for the calculator
    public abstract get calculatorValue(): number;

    // Obtain the string definition to pass to the SudokuWiki solver (game mode specific)
    public abstract get stringDefinitionForSolver(): string;

    public init(data: GameData) {
        this.timer = data.timer || 0;
        this.history = data.history || [];
        this.getDataFromMission();
        this.createBoardGeometry();
        if (data.boardString) this.loadHistoryState(data.boardString);
        else this.recreatePossibleValuesCache();
    }

    protected abstract getDataFromMission(): void;

    public getLinks(forValue: number) {
        let links: Cell[][] = [];

        for (const unit of this.units) {
            let newLink = [];
            for (const cell of unit) {
                if (cell.notes.has(forValue)) {
                    newLink.push(cell);
                }
            }
            if (newLink.length <= 2) {
                links.push(newLink);
            }
        }

        return links;
    }

    public restart() {
        // Restore initial state
        this.timer = 0;
        this._selectedCells = new Set();
        this.history = [];
        this.stash = null;
        this._hasChanged = false;
        this.animations = [];
        this._fullNotation = false;
        this.colorGroups = new Set();
        for (const cell of this.allCells) cell.restart();

        this.recreatePossibleValuesCache();
    }

    public stashBoard() {
        this.stash = `${this.boardToSave}`;
        this._hasChanged = false;
    }

    protected pushBoard() {
        if (this.stash && this._hasChanged) {
            this.history.push(this.stash);
            this.stash = null;
        }
    }

    public loadHistoryState(boardString: string) {
        this.updateBoardMatrixFromSavedString(boardString);
        this.recreatePossibleValuesCache();
    }

    public popBoard() {
        const historyItem = this.history.pop();
        if (historyItem) this.loadHistoryState(historyItem);
    }

    public get(coords: CellCoordinates): Cell | undefined {
        if (
            coords.x >= 0 &&
            coords.x < this._nSquares &&
            coords.y >= 0 &&
            coords.y < this._nSquares
        ) return this._board[coords.x][coords.y];
    }

    public select(cell: Cell, withState: boolean | null = null): boolean | null {
        if (this._selectedCells.has(cell)) {
            if (!withState) {
                this._selectedCells.delete(cell);
                return false;
            }
        } else {
            if (withState === null || withState) {
                this._selectedCells.add(cell);
                return true;
            }
        }

        return null;
    }

    public selectBox(from: Cell, to: Cell) {
        const minX = Math.min(from.coords.x, to.coords.x);
        const maxX = Math.max(from.coords.x, to.coords.x);
        const minY = Math.min(from.coords.y, to.coords.y);
        const maxY = Math.max(from.coords.y, to.coords.y);
        this._selectedCells.clear();
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const cell = this.get({ x, y });
                if (cell) this._selectedCells.add(cell);
            }
        }
    }

    public onlyAvailableInAnyUnit(c: Cell, n: number) {
        if (!c.possibleValues.has(n)) return false;
        return c.units.some(unit => [...unit].filter(cell => cell.value === 0 && cell.possibleValues.has(n)).length === 1);
    }

    @UseHistory
    public setNote({ withValue, of, to, checkingAutoSolution }: { withValue: number, of: Cell | Set<Cell>, to: boolean | null, checkingAutoSolution: boolean, causedByUser: boolean; }): boolean | null {
        let cells = (of instanceof Cell) ? [of] : [...of];
        let finalNoteState: boolean | null = null;

        if (to === null) {
            if (this._settings.showPossibleValues) {
                to = cells.some(cell => (
                    cell.value === 0 &&
                    cell.possibleValues.has(withValue) &&
                    !cell.notes.has(withValue
                    )));
            } else {
                to = cells.some(cell => (
                    cell.value === 0 &&
                    !cell.notes.has(withValue) && !cell.locked
                ));
            }
        }

        // If removing these notes would make fullNotation false (i.e. if the test fails),
        // then ignore the fact that the notation is currently full and remove the notes without setValue.
        const ignoreFullNotation = cells.length > 1 && this._fullNotation && to === false && !this.testFullNotation(new Set(cells), withValue);

        for (const cell of cells) {
            if (cell.value === 0) {
                //Check if only available place in any unit
                if (this._settings.showPossibleValues && this._settings.autoSolveOnlyInBox && checkingAutoSolution && this.onlyAvailableInAnyUnit(cell, withValue)) {
                    finalNoteState = true;
                    this.setValue({ of: cell, to: withValue, causedByUser: false });
                    this._hasChanged = true;
                } else if (cell.notes.has(withValue)) {
                    if (to !== true) {
                        //Remove note
                        cell.deleteNote(withValue);
                        this._hasChanged = true;
                        finalNoteState = false;
                        if (
                            cell.notes.size === 1 && (
                                (this._settings.autoSolveCellsWithColor && cell.locked) ||
                                (this._settings.autoSolveCellsFullNotation && this._fullNotation && !ignoreFullNotation)
                            )
                        ) {
                            finalNoteState = true;
                            this.setValue({ of: cell, to: [...cell.notes][0], causedByUser: false });
                        }
                    }
                } else if (to !== false && !cell.locked) {
                    //Add note
                    if (!this._settings.showPossibleValues || cell.possibleValues.has(withValue)) {
                        cell.addNote(withValue);
                        finalNoteState = true;
                        this._hasChanged = true;
                    }
                }
            }
        }

        if (cells.length === 1) {
            return finalNoteState;
        }
        return null;
    }

    @UseHistory
    public setValue({ of, to }: { of: Cell | Set<Cell>, to: number, causedByUser: boolean; }) {
        let cells = (of instanceof Cell) ? [of] : [...of];

        for (const cell of cells) {
            if (!cell.clue && cell.value !== to) {
                cell.value = to;
                cell.clearNotes();
                this._hasChanged = true;
                for (const visibleCell of cell.visibleCells) {
                    if (this._settings.autoRemoveCandidates) this.setNote({ withValue: to, of: visibleCell, to: false, checkingAutoSolution: false, causedByUser: false });
                }

                if (this._settings.clearColorOnInput) {
                    cell.color = null;
                    this._hasChanged = true;
                    for (const cg of cell.colorGroups) this.removeCellFromColorGroup(cell, cg);
                }

                this.updatePossibleValuesByValue(cell);

                this.checkAnimations(cell);
            }
        }
    }

    @UseHistory
    public giveHint({ forCells }: { forCells: Set<Cell>, causedByUser: boolean; }) {
        for (const cell of forCells) {
            if (!cell.clue && cell.solution > 0) {
                // Attempt to set the cell to a clue, which will also set the value
                // It will fail if the solution is unknown
                cell.hint = true;

                if (cell.clue) {
                    this._hasChanged = true;
                    this.updatePossibleValuesByValue(cell);
                }
            }
        }
    }

    @UseHistory
    public erase({ cells }: { cells: Set<Cell>, causedByUser: boolean; }) {
        for (const cell of cells) {
            if (!cell.clue && (cell.value > 0 || cell.notes.size > 0 || cell.color)) {
                cell.value = 0;
                cell.clearNotes();
                cell.color = null;
                this._hasChanged = true;

                for (const cg of cell.colorGroups) this.removeCellFromColorGroup(cell, cg);

                this.recreatePossibleValuesCache();
            }
        }
    }

    public calculateHighlightedCells(forValue: number) {
        for (const cell of this.allCells) cell.highlighted = false;

        let targetValues: number[] = [];

        if (this._settings.advancedHighlight) {
            if (forValue > 0) {
                targetValues = [forValue];
            } else {
                for (const c of this._selectedCells) {
                    if (c.value > 0) targetValues.push(c.value);
                }
            }

            if (targetValues.length > 0) {
                for (const cell of this.allCells) {
                    if (cell.value > 0 || !targetValues.every(v => cell.possibleValues.has(v))) cell.highlighted = true;
                }
            }
        }

        if (!this._settings.advancedHighlight || targetValues.length === 0) {
            for (const sc of this._selectedCells) {
                for (const vc of sc.visibleCells) {
                    vc.highlighted = true;
                }
                sc.highlighted = true;
            }
        }
    }

    @UseHistory
    public setColor({ of, to, causedByUser }: { of: Cell, to: ColorName | null, causedByUser: boolean; }) {
        if (of.color !== to) {
            of.color = to;
            if (to && of.notes.size > 1 && this._settings.lockCellsWithColor) of.locked = true;
            this._hasChanged = true;
            if (to === null) {
                if (causedByUser) this.recreatePossibleValuesCache();
            }
            else this.updatePossibleValuesByColor(of);
        }
    }

    @UseHistory
    public clearColors({ causedByUser }: { causedByUser: boolean; }) {
        for (const cell of this.allCells) {
            if (cell.color) {
                cell.color = null;
                this._hasChanged = true;
            }
        }
        this.removeColorGroups({ from: this.colorGroups, causedByUser: false });
    }

    public getTextRepresentation(cluesOnly: boolean) {
        let text = '';
        for (const cell of this.allCells) {
            text += cluesOnly && !cell.clue ? 0 : cell.value;
        }
        return text;
    }

    @UseHistory
    public createColorGroup({ withCells, painted }: { withCells: Set<Cell>, painted: ColorName | null, causedByUser: boolean; }) {
        if (withCells.size < 2 || painted === null) return;

        const newColorGroup = new ColorGroup(withCells, painted);
        this.colorGroups.add(newColorGroup);
        for (const cell of withCells) this.setColor({ of: cell, to: painted, causedByUser: false });
        for (const cell of withCells) this.updatePossibleValuesByColor(cell);
        this.updatePossibleValuesByColorGroups(newColorGroup);
        this._hasChanged = true;
    }

    @UseHistory
    public removeColorGroups({ from, causedByUser }: { from: Set<ColorGroup>, causedByUser: boolean; }) {
        let shouldRecreateCache = false;

        for (const group of from) {
            // Remove the reference to the group from its members
            for (const cell of group.members) {
                cell.deleteColorGroup(group);
                cell.color = null;
                this._hasChanged = true;
            }

            // Remove the color group
            if (this.colorGroups.delete(group)) shouldRecreateCache = true;
        }

        if (causedByUser && shouldRecreateCache) this.recreatePossibleValuesCache();
    }

    public triggerValuesChanged(shouldPushBoard: boolean) {
        if (shouldPushBoard) this.pushBoard();
        this._complete = this.checkIsComplete();
        this.checkFullNotation();
    }

    private get boardToSave() {
        const colorGroups = [...this.colorGroups];
        return [...this.allCells].map(cell => cell.dataToSave + [...cell.colorGroups].map(cg => `G${colorGroups.indexOf(cg)}`).join('')).join(' ');
    }

    private removeCellFromColorGroup(cell: Cell, cg: ColorGroup) {
        cg.remove(cell);
        if (cg.members.size === 0) this.colorGroups.delete(cg);
    }

    private updateBoardMatrixFromSavedString(data: string) {
        let x = 0;
        let y = 0;
        const cells = data.split(' ');
        const regex = new RegExp(`(?=[NCGHL])`, 'g');
        let colorGroups: Set<Cell>[] = [];
        for (const cellString of cells) {
            const cell = this.get({ x, y });
            if (cell) {
                cell.restart();
                const infoArr = cellString.split(regex).filter(Boolean);
                if (infoArr.length > 0) {
                    cell.value = Number.parseInt(infoArr.shift() || '0');
                    for (const info of infoArr) {
                        const rest = info.slice(1);
                        switch (info[0]) {
                            case 'N':
                                cell.notes = new Set(rest.split('').map(n => Number.parseInt(n)));
                                break;
                            case 'C':
                                cell.color = colorNames[colorNamesShortened.indexOf(info[1])];
                                break;
                            case 'G':
                                const index = Number.parseInt(rest);
                                if (!colorGroups[index]) colorGroups[index] = new Set();
                                colorGroups[index].add(cell);
                                break;
                            case 'H':
                                cell.hint = true;
                                break;
                            case 'L':
                                if (this._settings.lockCellsWithColor) cell.locked = true;
                                break;
                        }
                    }
                }
            }

            y++;
            if (y === this._nSquares) {
                y = 0;
                x++;
            }
        }

        for (const cg of colorGroups) {
            this.createColorGroup({ withCells: cg, painted: [...cg][0].color, causedByUser: false });
        }
    }

    private testFullNotation(except: Set<Cell> = new Set(), withValue: number | null = null): boolean {
        // If we're testing with exception, then we don't care about the other values, only withValue
        const specialTest = this._fullNotation && except.size > 0 && withValue;
        for (const unit of this.units) {
            for (let n = specialTest ? withValue : 1; n <= 9; n++) {
                let found = false;
                for (const cell of unit) {
                    if (!(n === withValue && except.has(cell)) && (cell.value === n || cell.notes.has(n))) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    return false;
                }
                if (specialTest) return true;
            }
        }

        return true;
    }

    protected checkIsComplete(): boolean {
        this.checkErrors();
        return !this._hasErrors && [...this.allCells].every(cell => cell.value > 0);
    }

    protected checkFullNotation() {
        if (!this.testFullNotation()) {
            this._fullNotation = false;
            return;
        }

        if (this._settings.clearColorFullNotation) {
            if (!this._fullNotation) {
                // If the notation wasn't full, clear all color
                this.clearColors({ causedByUser: false });
            } else {
                // If it was already full, clear only multi-cell color groups
                this.removeColorGroups({ from: new Set(Array.from(this.colorGroups).filter(cg => cg.members.size > 1)), causedByUser: false });
            }
        }

        this._fullNotation = true;
    }

    protected *iterateAllCells(): IterableIterator<Cell> {
        for (let x = 0; x < this._nSquares; x++) {
            for (let y = 0; y < this._nSquares; y++) {
                const cell = this.get({ x, y });
                if (cell) yield cell;
            }
        }
    }

    protected checkErrors() {
        if (this._nSquares < 9) return; // TODO: This is a hack. When it's implemented, we should use the per-game settings system to override checkErrors for the 3x3 canvases. Then we won't need this guard

        for (const cell of this.allCells) cell.hasVisibleError = false;
        this._hasErrors = false;

        for (const cell of this.allCells) {
            if (cell.value > 0 && !cell.possibleValues.has(cell.value)) {
                if (this._settings.showErrors && this._settings.showLogicErrors) cell.hasVisibleError = true;
                this._hasErrors = true;
            }

            if (cell.value > 0 && cell.solution !== 0 && cell.value !== cell.solution) {
                if (this._settings.showErrors && this._settings.showSolutionErrors) cell.hasVisibleError = true;
                this._hasErrors = true;
            }
        }
    }

    protected recreatePossibleValuesCache() {
        for (const cell of this.allCells) cell.possibleValues = new Set(Array.from({ length: this._nSquares }, (_, i) => i + 1));
        for (const cell of this.allCells) this.updatePossibleValuesByValue(cell);
        for (const cell of this.allCells) this.updatePossibleValuesByColor(cell);
        for (const cg of this.colorGroups) this.updatePossibleValuesByColorGroups(cg);
        this.triggerValuesChanged(false);
    }

    protected updatePossibleValuesByValue(cell: Cell) {
        for (const vc of cell.visibleCells) {
            if (cell !== vc) vc.possibleValues.delete(cell.value);
        }
    }

    protected updatePossibleValuesByColor(cell: Cell) {
        if (cell.color) {
            if (this._settings.autoSolveCellsWithColor && cell.locked && cell.notes.size === 1) this.setValue({ of: cell, to: [...cell.notes][0], causedByUser: false });
            else if (cell.locked) cell.possibleValues = new Set(cell.notes);
        }
    }

    protected updatePossibleValuesByColorGroups(cg: ColorGroup) {
        if (!this._settings.lockCellsWithColor) return;

        let notes = new Set<number>();
        let unsolvedCount = 0;
        for (const cell of cg.members) {
            notes = notes.union(cell.notes);
            if (cell.value === 0) unsolvedCount++;
        }

        if (notes.size === unsolvedCount) {
            // Remove possible values and notes from all the visible cells not in the group
            for (const vc of cg.visibleCells) {
                if (!vc.colorGroups.has(cg)) {
                    for (const note of notes) vc.possibleValues.delete(note);
                    if (this._settings.showPossibleValues) for (const note of notes) this.setNote({ withValue: note, of: vc, to: false, checkingAutoSolution: false, causedByUser: false });
                }
            }
        }
    }

    // Add any necessary animations
    protected abstract checkAnimations(center: Cell): void;

    // Initialize the board matrix, cages, thermometers, etc.
    protected abstract createBoardGeometry(): void;
}
