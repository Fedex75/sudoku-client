import { Canvas } from '../../../utils/Canvas'
import { AccentColor, ColorDefinitions } from '../../../utils/Colors'
import { themes } from '../../Themes'
import { SandwichBoard } from './SandwichBoard'

export class SandwichCanvas extends Canvas<SandwichBoard> {
    constructor(accentColor: AccentColor, notPlayable: boolean, boxBorderWidthFactor: number) {
        super(accentColor, notPlayable, boxBorderWidthFactor)
        this.topAndLeftMarginFactor = 0.8
    }

    renderLateralClues() {
        if (!this.ctx || !this.game) return

        const x = Math.floor(this.squareSize * this.topAndLeftMarginFactor * 0.8)
        const y = x
        const size = this.squareSize * 0.35
        const halfSquareSize = this.squareSize / 2
        for (let i = 0; i < this.game.nSquares; i++) {
            const cell = this.game.get({ x: i, y: i })
            if (!cell) continue
            this.ctx.fillStyle = this.ctx.strokeStyle = (this.game.settings.checkLogicErrors && this.game.horizontalClues[i].error) ? ColorDefinitions[this.additionalColors.errorColor] : ([...this.game.selectedCells].some(cell => cell.coords.y === i) ? themes[this._theme].noteHighlightColor : themes[this._theme].clueColor)
            if (this.game.horizontalClues[i].visible) Canvas.drawSVGNumber(this.ctx, this.game.horizontalClues[i].value, x, cell.screenPosition.y + halfSquareSize, size, 'left', 'center', null)
            this.ctx.fillStyle = this.ctx.strokeStyle = (this.game.settings.checkLogicErrors && this.game.verticalClues[i].error) ? ColorDefinitions[this.additionalColors.errorColor] : ([...this.game.selectedCells].some(cell => cell.coords.x === i) ? themes[this._theme].noteHighlightColor : themes[this._theme].clueColor)
            if (this.game.verticalClues[i].visible) Canvas.drawSVGNumber(this.ctx, this.game.verticalClues[i].value, cell.screenPosition.x + halfSquareSize, y, size, 'center', 'top', null)
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
