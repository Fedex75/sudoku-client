import { Canvas } from '../../../utils/Canvas';
import { ScreenCoordinates, KillerCage } from '../../../utils/Cell';
import { AccentColor, Colors } from '../../../utils/Colors';
import { themes } from '../../Themes';
import { KillerBoard } from './KillerBoard';

export type CageVector = {
    start: ScreenCoordinates;
    end: ScreenCoordinates;
    cage: KillerCage;
    ratio: number;
};

export class KillerCanvas extends Canvas<KillerBoard> {
    protected cagesCtx: CanvasRenderingContext2D | null = null;

    protected cagePadding = 0;

    constructor(accentColor: AccentColor, notPlayable: boolean, boxBorderWidthFactor: number) {
        super(accentColor, notPlayable, boxBorderWidthFactor);
        this.notePaddingLeftFactor = 0.28;
        this.notePaddingTopFactor = 0.34;
        this.notePaddingBottomFactor = 0.22;
    }

    protected renderCagesAndCageValues() {
        if (!this.ctx || !this.cagesCtx || !this.tempCtx || !this.canvasRef || !this.game) return;

        this.tempCtx.clearRect(0, 0, this.tempCtx.canvas.width, this.tempCtx.canvas.height);
        this.tempCtx.drawImage(this.cagesCtx.canvas, 0, 0);

        let selectedCages: KillerCage[] = [];
        for (const cell of this.game.selectedCells) {
            if (cell.cage && !selectedCages.includes(cell.cage)) selectedCages.push(cell.cage);
        }

        // Paint selected cages
        Canvas.applyColorWithMask(this.tempCtx, ctx => {
            for (const cage of selectedCages) {
                for (const cell of cage.members) {
                    ctx.rect(
                        cell.screenPosition.x - Canvas.CELL_BORDER_WIDTH,
                        cell.screenPosition.y - Canvas.CELL_BORDER_WIDTH,
                        this.squareSize + Canvas.CELL_BORDER_WIDTH * 2,
                        this.squareSize + Canvas.CELL_BORDER_WIDTH * 2
                    );
                }
            }
        }, themes[this._theme].killerHighlightedCageColor);

        // Paint cages that are on colored cells black to improve contrast
        Canvas.applyColorWithMask(this.tempCtx, ctx => {
            if (!this.game) return;

            for (const cell of this.game.allCells) {
                if (cell.color) {
                    ctx.rect(
                        cell.screenPosition.x - Canvas.CELL_BORDER_WIDTH,
                        cell.screenPosition.y - Canvas.CELL_BORDER_WIDTH,
                        this.squareSize + Canvas.CELL_BORDER_WIDTH * 2,
                        this.squareSize + Canvas.CELL_BORDER_WIDTH * 2
                    );
                }
            }
        }, themes[this._theme].killerCageOnColoredCellColor);


        // Paint cages with error
        Canvas.applyColorWithMask(this.tempCtx, ctx => {
            if (!this.game) return;

            for (const cage of this.game.cages) {
                if (cage.error) {
                    for (const cell of cage.members) {
                        ctx.rect(
                            cell.screenPosition.x - Canvas.CELL_BORDER_WIDTH,
                            cell.screenPosition.y - Canvas.CELL_BORDER_WIDTH,
                            this.squareSize + Canvas.CELL_BORDER_WIDTH * 2,
                            this.squareSize + Canvas.CELL_BORDER_WIDTH * 2
                        );
                    }
                }
            }
        }, Colors[this.additionalColors.errorColor]);

        // Apply spare error color to corresponding cages
        Canvas.applyColorWithMask(this.tempCtx, ctx => {
            if (!this.game) return;

            for (const cage of this.game.cages) {
                if (cage.error) {
                    for (const cell of cage.members) {
                        if (cell.color === this.additionalColors.errorColor) {
                            ctx.rect(
                                cell.screenPosition.x - Canvas.CELL_BORDER_WIDTH,
                                cell.screenPosition.y - Canvas.CELL_BORDER_WIDTH,
                                this.squareSize + Canvas.CELL_BORDER_WIDTH * 2,
                                this.squareSize + Canvas.CELL_BORDER_WIDTH * 2
                            );
                        }
                    }
                }
            }
        }, Colors[this.additionalColors.spareErrorColor]);

        this.ctx.drawImage(this.tempCtx.canvas, 0, 0);
    }

    protected renderCagesToOffscreenCanvas() {
        if (!this.cagesCtx || !this.tempCtx || !this.game) return;

        this.cagePadding = Math.floor(this.squareSize * 0.08);
        let cageLinePositions = Array(this.game.nSquares * 2).fill(0);

        for (let i = 0; i < this.game.nSquares; i++) {
            const cell = this.game.get({ x: i, y: 0 });
            if (!cell) continue;
            cageLinePositions[i * 2] = cell.screenPosition.x + this.cagePadding;
            cageLinePositions[i * 2 + 1] = cell.screenPosition.x + this.squareSize - this.cagePadding - Canvas.CAGE_LINE_WIDTH;
        }

        let newCageVectors: CageVector[] = [];

        let startA = null;
        let startB = null;

        const targetRatio = Math.floor(this.squareSize * 0.075) + 1;

        function addVector(c1: ScreenCoordinates, c2: ScreenCoordinates, cage: KillerCage) {
            const delta = Math.max(Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y)) + Canvas.CAGE_LINE_WIDTH;
            const i = Math.ceil(delta / (2 * targetRatio) - 0.5);
            let ratio = delta / (2 * i + 1);

            if ((targetRatio - ratio) > (delta / (i - 1) - targetRatio)) ratio = delta / (i - 2);

            newCageVectors.push({ start: c1, end: c2, cage, ratio });
        }

        //Horizontal
        for (let y = 0; y < this.game.nSquares; y++) {
            const top = cageLinePositions[y * 2];
            const bottom = cageLinePositions[y * 2 + 1];

            for (let x = 0; x < this.game.nSquares; x++) {
                const cell = this.game.get({ x, y });
                if (!cell || !cell.cage) continue;

                const hShift = cell.cageSum > 9 ? Math.ceil(this.squareSize * 0.28) : (cell.cageSum > 0 ? Math.ceil(this.squareSize * 0.15) : 0);

                const left = cageLinePositions[x * 2];
                const right = cageLinePositions[x * 2 + 1];

                const topCell = this.game.get({ x, y: y - 1 });
                const bottomCell = this.game.get({ x, y: y + 1 });
                const rightCell = this.game.get({ x: x + 1, y });
                const topRightCell = this.game.get({ x: x + 1, y: y - 1 });
                const bottomRightCell = this.game.get({ x: x + 1, y: y + 1 });

                //Top line
                if (!topCell || topCell.cage !== cell.cage) {
                    if (startA === null) startA = { x: left + hShift, y: top };
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: left + hShift, y: top }, cell.cage);
                        startA = null;
                    }
                }

                //Top bridge
                if (
                    rightCell && rightCell.cage === cell.cage &&
                    (
                        !topRightCell || topRightCell.cage !== cell.cage ||
                        !topCell || topCell.cage !== cell.cage
                    )
                ) {
                    if (startA === null) startA = { x: right, y: top };
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: right, y: top }, cell.cage);
                        startA = null;
                    }
                }

                //Bottom line
                if (!bottomCell || bottomCell.cage !== cell.cage) {
                    if (startB === null) startB = { x: left, y: bottom };
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: left + hShift, y: bottom }, cell.cage);
                        startB = null;
                    }
                }

                //Bottom bridge
                if (
                    rightCell && rightCell.cage === cell.cage &&
                    (
                        !bottomRightCell || bottomRightCell.cage !== cell.cage ||
                        !bottomCell || bottomCell.cage !== cell.cage
                    )
                ) {
                    if (startB === null) startB = { x: right, y: bottom };
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: right, y: bottom }, cell.cage);
                        startB = null;
                    }
                }
            }
        }

        //Vertical
        for (let x = 0; x < this.game.nSquares; x++) {
            const left = cageLinePositions[x * 2];
            const right = cageLinePositions[x * 2 + 1];

            for (let y = 0; y < this.game.nSquares; y++) {
                const cell = this.game.get({ x, y });
                if (!cell || !cell.cage) continue;

                const vShift = cell.cageSum! > 0 ? Math.ceil(this.squareSize * 0.20) : 0;

                const top = cageLinePositions[y * 2];
                const bottom = cageLinePositions[y * 2 + 1];

                const leftCell = this.game.get({ x: x - 1, y });
                const bottomCell = this.game.get({ x, y: y + 1 });
                const bottomLeftCell = this.game.get({ x: x - 1, y: y + 1 });
                const rightCell = this.game.get({ x: x + 1, y });
                const bottomRightCell = this.game.get({ x: x + 1, y: y + 1 });

                //Left line
                if (!leftCell || leftCell.cage !== cell.cage) {
                    if (startA === null) startA = { x: left, y: top + vShift };
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: left, y: top + vShift }, cell.cage!);
                        startA = null;
                    }
                }

                //Left bridge
                if (
                    bottomCell && bottomCell.cage === cell.cage &&
                    (
                        !leftCell || leftCell.cage !== cell.cage ||
                        !bottomLeftCell || bottomLeftCell.cage !== cell.cage
                    )
                ) {
                    if (startA === null) startA = { x: left, y: bottom };
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: left, y: bottom }, cell.cage!);
                        startA = null;
                    }
                }

                //Right line
                if (!rightCell || rightCell.cage !== cell.cage) {
                    if (startB === null) startB = { x: right, y: top };
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: right, y: top }, cell.cage!);
                        startB = null;
                    }
                }

                //Right bridge
                if (
                    bottomCell && bottomCell.cage === cell.cage &&
                    (
                        !rightCell || rightCell.cage !== cell.cage ||
                        !bottomRightCell || bottomRightCell.cage !== cell.cage
                    )
                ) {
                    if (startB === null) startB = { x: right, y: bottom };
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: right, y: bottom }, cell.cage!);
                        startB = null;
                    }
                }
            }
        }

        this.cagesCtx.clearRect(0, 0, this.cagesCtx.canvas.width, this.cagesCtx.canvas.height);
        this.cagesCtx.fillStyle = this.cagesCtx.strokeStyle = themes[this.theme].killerCageColor;

        //Border
        newCageVectors.forEach((vector: CageVector) => {
            if (!this.cagesCtx) return;
            KillerCanvas.dashedLine(this.cagesCtx, vector.start, vector.end, vector.ratio, Canvas.CAGE_LINE_WIDTH);
        });

        for (const cell of this.game.allCells) {
            if (cell.cage && cell.cageSum > 0) KillerCanvas.drawSVGNumber(this.cagesCtx, cell.cageSum, cell.screenPosition.x + this.cagePadding, cell.screenPosition.y + this.cagePadding + this.squareSize * 0.08, this.squareSize * 0.15, 'right', 'center', null);
        }
    }

    afterCanvasChangedSize() {
        super.afterCanvasChangedSize();
        if (this.ctx && this.cagesCtx) this.cagesCtx.canvas.width = this.cagesCtx.canvas.height = this.ctx.canvas.width;
        this.renderCagesToOffscreenCanvas();
    }

    protected renderActiveGame(): void {
        this.renderCellBackground();
        this.renderCellValueAndCandidates();
        this.renderCagesAndCageValues();
        this.renderSelection();
        this.renderLinks();
        this.renderFadeAnimations();
    }

    public createOffscreenCanvases(): void {
        super.createOffscreenCanvases();
        const canvas = document.createElement('canvas');
        this.cagesCtx = canvas.getContext('2d');
    }

    public destroyOffscreenCanvases(): void {
        super.destroyOffscreenCanvases();
        this.cagesCtx = null;
    }
}
