import { Canvas } from '../../../utils/Canvas'
import { AccentColor } from '../../../utils/Colors'
import { themes } from '../../Themes'
import { SandwichBoard } from './SandwichBoard'

export class SandwichCanvas extends Canvas<SandwichBoard> {
    constructor(accentColor: AccentColor, notPlayable: boolean, boxBorderWidthFactor: number) {
        super(accentColor, notPlayable, boxBorderWidthFactor)
        this.topAndLeftMarginFactor = 0.8
    }

    renderLateralClues() {
        if (!this.canvasRef || !this._game) return
        const ctx = this.canvasRef.getContext('2d')
        if (!ctx) return

        const x = Math.floor(this.squareSize * this.topAndLeftMarginFactor * 0.8)
        const y = x
        const size = this.squareSize * 0.35
        const halfSquareSize = this.squareSize / 2
        for (let i = 0; i < this._game.nSquares; i++) {
            const cell = this._game.get({ x: i, y: i })
            if (!cell) continue
            ctx.fillStyle = ctx.strokeStyle = (this._game.settings.checkErrors && this._game.horizontalClues[i].error) ? '#ff5252' : ([...this._game.selectedCells].some(cell => cell.coords.y === i) ? themes[this._theme].canvasNoteHighlightColor : themes[this._theme].canvasClueColor)
            if (this._game.horizontalClues[i].visible) Canvas.drawSVGNumber(ctx, this._game.horizontalClues[i].value, x, cell.screenPosition.y + halfSquareSize, size, 'left', 'center', null)
            ctx.fillStyle = ctx.strokeStyle = (this._game.settings.checkErrors && this._game.verticalClues[i].error) ? '#ff5252' : ([...this._game.selectedCells].some(cell => cell.coords.x === i) ? themes[this._theme].canvasNoteHighlightColor : themes[this._theme].canvasClueColor)
            if (this._game.verticalClues[i].visible) Canvas.drawSVGNumber(ctx, this._game.verticalClues[i].value, cell.screenPosition.x + halfSquareSize, y, size, 'center', 'top', null)
        }
    }

    renderActiveGame(): void {
        this.renderCellBackground()
        this.renderLateralClues()
        this.renderCellValueAndCandidates()
        this.renderSelection()
        this.renderLinks()
        this.renderFadeAnimations()
    }
}
