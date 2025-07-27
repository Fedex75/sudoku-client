import { Canvas } from '../../../utils/Canvas';
import { Colors } from '../../../utils/Colors';
import { themes } from '../../Themes';
import { SudokuXBoard } from './SudokuXBoard';

export class SudokuXCanvas extends Canvas<SudokuXBoard> {
    private renderDiagonals() {
        if (!this.ctx || !this.game) return;
        if (!this.game.settings.sudokuXShowDiagonals) return;

        const topLeftCornerCell = this.game.get({ x: 0, y: 0 });
        const bottomRightCornerCell = this.game.get({ x: this.game.nSquares - 1, y: this.game.nSquares - 1 });
        if (!topLeftCornerCell || !bottomRightCornerCell) return;

        // Here, we assume that the x and y coordinates of these cells are the same
        const near = topLeftCornerCell.screenPosition.x + this.squareSize / 2;
        const far = bottomRightCornerCell.screenPosition.x + this.squareSize / 2;

        this.ctx.globalAlpha = 0.66;

        const mainDiagonalColor = this.game.mainDiagonalError ? Colors[this.additionalColors.errorColor] : themes[this._theme].sudokuXDiagonalColor;
        const secondaryDiagonalColor = this.game.secondaryDiagonalError ? Colors[this.additionalColors.errorColor] : themes[this._theme].sudokuXDiagonalColor;

        // Main diagonal
        this.ctx.fillStyle = this.ctx.strokeStyle = mainDiagonalColor;
        this.ctx.lineWidth = this.squareSize * 0.2;
        this.ctx.beginPath();
        this.ctx.moveTo(near, near);
        this.ctx.lineTo(far, far);

        if (this.game.mainDiagonalError || this.game.secondaryDiagonalError) {
            this.ctx.stroke();
            this.ctx.beginPath();
        }

        // Secondary diagonal
        this.ctx.fillStyle = this.ctx.strokeStyle = secondaryDiagonalColor;
        this.ctx.lineWidth = this.squareSize * 0.2;
        this.ctx.moveTo(near, far);
        this.ctx.lineTo(far, near);
        this.ctx.stroke();

        // Circles

        this.ctx.fillStyle = this.ctx.strokeStyle = mainDiagonalColor;
        // NW
        this.ctx.beginPath();
        this.ctx.arc(near, near, this.squareSize * 0.1, Math.PI * 0.75, - Math.PI * 0.25, false);
        this.ctx.fill();
        // SE
        this.ctx.beginPath();
        this.ctx.arc(far, far, this.squareSize * 0.1, - Math.PI * 0.25, Math.PI * 0.75, false);
        this.ctx.fill();

        this.ctx.fillStyle = this.ctx.strokeStyle = secondaryDiagonalColor;
        // SW
        this.ctx.beginPath();
        this.ctx.arc(near, far, this.squareSize * 0.1, Math.PI * 0.25, Math.PI * 1.25, false);
        this.ctx.fill();
        // NE
        this.ctx.beginPath();
        this.ctx.arc(far, near, this.squareSize * 0.1, - Math.PI * 0.75, Math.PI * 0.25, false);
        this.ctx.fill();

        this.ctx.globalAlpha = 1;
    }

    renderActiveGame(): void {
        this.renderCellBackground();
        this.renderDiagonals();
        this.renderCellValueAndCandidates();
        this.renderSelection();
        this.renderLinks();
        this.renderFadeAnimations();
    }
}
