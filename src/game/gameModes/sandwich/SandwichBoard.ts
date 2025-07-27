import { Cell } from '../../../utils/Cell';
import { UseHistory } from '../../../utils/DataTypes';
import { ClassicBoard } from '../classic/ClassicBoard';

export type SandwichClue = {
    value: number;
    visible: boolean;
    error: boolean;
};

export class SandwichBoard extends ClassicBoard {
    public horizontalClues: SandwichClue[] = [];
    public verticalClues: SandwichClue[] = [];

    protected getDataFromMission(): void {
        const [nSquares, , solution, hClues, vClues] = this.mission.split(' ');
        this._nSquares = Number.parseInt(nSquares);
        this._solution = solution;

        this.horizontalClues = hClues.split(',').map(clue => ({
            value: Number.parseInt(clue),
            visible: true,
            error: false
        }));

        this.verticalClues = vClues.split(',').map(clue => ({
            value: Number.parseInt(clue),
            visible: true,
            error: false
        }));
    }

    private getSumBetween1And9(unit: Set<Cell>) {
        let found1or9 = false;
        let sum = 0;
        for (const cell of unit) {
            if (found1or9) {
                if (cell.value === 0) return -1;
                if (cell.value === 1 || cell.value === 9) return sum;
                sum += cell.value;
            } else {
                if (cell.value === 1 || cell.value === 9) found1or9 = true;
            }
        }

        return -1;
    }

    private solveLastInUnitSum(unit: Set<Cell>, sum: number) {
        if (!this._settings.sandwichAutoSolveLastInSum) return;

        let found1or9 = false;
        let actualSum = 0;
        let emptyCell: Cell | null = null;
        for (const cell of unit) {
            if (found1or9) {
                if (cell.value === 0) {
                    if (emptyCell) return; // There's more than one empty cell, nothing we can do
                    emptyCell = cell;
                }
                if (cell.value === 1 || cell.value === 9) {
                    if (!emptyCell) return;
                    if (sum - actualSum > 0 && sum - actualSum <= 9) {
                        this.setValue({ of: emptyCell, to: (sum - actualSum), causedByUser: false });
                    }
                    return;
                }
                actualSum += cell.value;
            } else {
                if (cell.value === 1 || cell.value === 9) found1or9 = true;
            }
        }
    }

    @UseHistory
    public setValue({ of, to }: { of: Cell | Set<Cell>, to: number, causedByUser: boolean; }): void {
        super.setValue({ of, to, causedByUser: false });

        const cells = (of instanceof Cell) ? [of] : [...of];
        for (const cell of cells) {
            this.solveLastInUnitSum(cell.column, this.verticalClues[cell.coords.x].value);
            this.solveLastInUnitSum(cell.row, this.horizontalClues[cell.coords.y].value);
        }
    }

    public restart() {
        super.restart();
        for (let i = 0; i < this.nSquares; i++) {
            const cell = this.get({ x: i, y: i });
            if (!cell) continue;
            this.solveLastInUnitSum(cell.column, this.verticalClues[i].value);
            this.solveLastInUnitSum(cell.row, this.horizontalClues[i].value);
        }
        this.recreatePossibleValuesCache();
        this.triggerValuesChanged(false);
    }

    protected createBoardGeometry(): void {
        super.createBoardGeometry();

        for (let i = 0; i < this.nSquares; i++) {
            const cell = this.get({ x: i, y: i });
            if (!cell) continue;
            this.solveLastInUnitSum(cell.column, this.verticalClues[i].value);
            this.solveLastInUnitSum(cell.row, this.horizontalClues[i].value);
        }
    }

    protected checkErrors(): void {
        super.checkErrors();

        for (let x = 0; x < this._nSquares; x++) {
            const cell = this.get({ x, y: 0 });
            if (!cell) continue;
            const sum = this.getSumBetween1And9(cell.column);
            this.verticalClues[x].visible = true;
            this.verticalClues[x].error = false;
            if (sum !== -1 && sum !== this.verticalClues[x].value) {
                if (this._settings.showErrors && this._settings.showLogicErrors && this._settings.sandwichShowSumErrors) this.verticalClues[x].error = true;
                this._hasErrors = true;
            } else if (sum === this.verticalClues[x].value) {
                this.verticalClues[x].visible = false;
            }
        }

        for (let y = 0; y < this._nSquares; y++) {
            const cell = this.get({ x: 0, y });
            if (!cell) continue;
            const sum = this.getSumBetween1And9(cell.row);
            this.horizontalClues[y].visible = true;
            this.horizontalClues[y].error = false;
            if (sum !== -1 && sum !== this.horizontalClues[y].value) {
                if (this._settings.showErrors && this._settings.showLogicErrors && this._settings.sandwichShowSumErrors) this.horizontalClues[y].error = true;
                this._hasErrors = true;
            } else if (sum === this.horizontalClues[y].value) {
                this.horizontalClues[y].visible = false;
            }
        }
    }
}
