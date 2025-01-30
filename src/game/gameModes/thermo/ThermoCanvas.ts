import { Canvas } from '../../../utils/Canvas'
import { Thermometer } from '../../../utils/Cell'
import { ColorDefinitions } from '../../../utils/Colors'
import { themes } from '../../Themes'
import { ThermoBoard } from './ThermoBoard'

export class ThermoCanvas extends Canvas<ThermoBoard> {
    protected thermometersCtx: CanvasRenderingContext2D | null = null

    public createOffscreenCanvases(): void {
        super.createOffscreenCanvases()
        const canvas = document.createElement('canvas')
        this.thermometersCtx = canvas.getContext('2d')
    }

    public destroyOffscreenCanvases(): void {
        super.destroyOffscreenCanvases()
        this.thermometersCtx = null
    }

    protected renderThermometersToOffscreenCanvas() {
        if (!this.thermometersCtx || !this._game) return

        const THERMOMETER_WIDTH_FACTOR = 0.3

        this.thermometersCtx.clearRect(0, 0, this.thermometersCtx.canvas.width, this.thermometersCtx.canvas.height)

        this.thermometersCtx.globalAlpha = 1
        this.thermometersCtx.fillStyle = this.thermometersCtx.strokeStyle = themes[this._theme].thermometerColor
        this.thermometersCtx.lineWidth = this.squareSize * THERMOMETER_WIDTH_FACTOR
        for (const thermo of this._game.thermometers) {
            const members = [...thermo.members]
            this.thermometersCtx.beginPath()
            this.thermometersCtx.arc(members[0].screenPosition.x + this.squareSize / 2, members[0].screenPosition.y + this.squareSize / 2, this.squareSize * THERMOMETER_WIDTH_FACTOR, 0, Math.PI * 2)
            this.thermometersCtx.fill()

            for (let i = 1; i < thermo.members.size; i++) {
                this.thermometersCtx.beginPath()
                this.thermometersCtx.moveTo(members[i - 1].screenPosition.x + this.squareSize / 2, members[i - 1].screenPosition.y + this.squareSize / 2)
                this.thermometersCtx.lineTo(members[i].screenPosition.x + this.squareSize / 2, members[i].screenPosition.y + this.squareSize / 2)
                this.thermometersCtx.stroke()

                this.thermometersCtx.beginPath()
                this.thermometersCtx.arc(members[i].screenPosition.x + this.squareSize / 2, members[i].screenPosition.y + this.squareSize / 2, this.squareSize * THERMOMETER_WIDTH_FACTOR / 2, 0, Math.PI * 2)
                this.thermometersCtx.fill()
            }
        }
    }

    protected renderThermometers() {
        if (!this.ctx || !this.tempCtx || !this.thermometersCtx || !this.canvasRef || !this._game) return

        this.tempCtx.clearRect(0, 0, this.tempCtx.canvas.width, this.tempCtx.canvas.height)
        this.tempCtx.drawImage(this.thermometersCtx.canvas, 0, 0)

        let selectedThermometers: Set<Thermometer> = new Set()
        for (const cell of this._game.selectedCells) {
            if (cell.thermometer) selectedThermometers.add(cell.thermometer)
        }

        // Highlight selected thermometers
        Canvas.applyColorWithMask(this.tempCtx, ctx => {
            for (const thermo of selectedThermometers) {
                for (const c of thermo.members) {
                    ctx.rect(c.screenPosition.x - Canvas.CELL_BORDER_WIDTH, c.screenPosition.y - Canvas.CELL_BORDER_WIDTH, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2)
                }
            }
        }, themes[this._theme].highlightedThermometerColor)

        // Paint thermometers with errors
        if (this._game.settings.showLogicErrors) {
            Canvas.applyColorWithMask(this.tempCtx, ctx => {
                if (!this._game) return
                for (const thermo of this._game.thermometers) {
                    if (thermo.error) {
                        for (const c of thermo.members) {
                            ctx.rect(c.screenPosition.x - Canvas.CELL_BORDER_WIDTH, c.screenPosition.y - Canvas.CELL_BORDER_WIDTH, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2)
                        }
                    }
                }
            }, ColorDefinitions[this.additionalColors.errorColor])
        }

        this.ctx.globalAlpha = 0.5
        this.ctx.drawImage(this.tempCtx.canvas, 0, 0)
        this.ctx.globalAlpha = 1
    }

    afterCanvasChangedSize(): void {
        super.afterCanvasChangedSize()
        if (this.ctx && this.thermometersCtx) this.thermometersCtx.canvas.width = this.thermometersCtx.canvas.height = this.ctx.canvas.width
        this.renderThermometersToOffscreenCanvas()
    }

    renderActiveGame(): void {
        this.renderCellBackground()
        this.renderThermometers()
        this.renderCellValueAndCandidates()
        this.renderSelection()
        this.renderLinks()
        this.renderFadeAnimations()
    }
}
