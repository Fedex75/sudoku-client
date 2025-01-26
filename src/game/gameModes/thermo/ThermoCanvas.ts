import { Canvas } from '../../../utils/Canvas'
import { Thermometer } from '../../../utils/Cell'
import { ThermoBoard } from './ThermoBoard'

export class ThermoCanvas extends Canvas<ThermoBoard> {
    protected readonly thermometersOffscreenCanvas = document.createElement('canvas')
    protected readonly thermometersOffscreenCanvasCtx = this.thermometersOffscreenCanvas.getContext('2d')
    protected readonly thermometersTempCanvas = document.createElement('canvas')
    protected readonly thermometersTempCanvasCtx = this.thermometersTempCanvas.getContext('2d')

    protected renderThermometersToOffscreenCanvas() {
        if (!this.thermometersOffscreenCanvas || !this.thermometersOffscreenCanvasCtx || !this._game) return

        this.thermometersOffscreenCanvas.width = this.logicalSize
        this.thermometersOffscreenCanvas.height = this.logicalSize
        this.thermometersTempCanvas.width = this.logicalSize
        this.thermometersTempCanvas.height = this.logicalSize

        const THERMOMETER_WIDTH_FACTOR = 0.3

        this.thermometersOffscreenCanvasCtx.clearRect(0, 0, this.logicalSize, this.logicalSize)

        this.thermometersOffscreenCanvasCtx.globalAlpha = 1
        this.thermometersOffscreenCanvasCtx.fillStyle = this.thermometersOffscreenCanvasCtx.strokeStyle = this._theme === 'dark' ? '#555' : '#aaa'
        this.thermometersOffscreenCanvasCtx.lineWidth = this.squareSize * THERMOMETER_WIDTH_FACTOR
        for (const thermo of this._game.thermometers) {
            const members = [...thermo.members]
            this.thermometersOffscreenCanvasCtx.beginPath()
            this.thermometersOffscreenCanvasCtx.arc(members[0].screenPosition.x + this.squareSize / 2, members[0].screenPosition.y + this.squareSize / 2, this.squareSize * THERMOMETER_WIDTH_FACTOR, 0, Math.PI * 2)
            this.thermometersOffscreenCanvasCtx.fill()

            for (let i = 1; i < thermo.members.size; i++) {
                this.thermometersOffscreenCanvasCtx.beginPath()
                this.thermometersOffscreenCanvasCtx.moveTo(members[i - 1].screenPosition.x + this.squareSize / 2, members[i - 1].screenPosition.y + this.squareSize / 2)
                this.thermometersOffscreenCanvasCtx.lineTo(members[i].screenPosition.x + this.squareSize / 2, members[i].screenPosition.y + this.squareSize / 2)
                this.thermometersOffscreenCanvasCtx.stroke()

                this.thermometersOffscreenCanvasCtx.beginPath()
                this.thermometersOffscreenCanvasCtx.arc(members[i].screenPosition.x + this.squareSize / 2, members[i].screenPosition.y + this.squareSize / 2, this.squareSize * THERMOMETER_WIDTH_FACTOR / 2, 0, Math.PI * 2)
                this.thermometersOffscreenCanvasCtx.fill()
            }
        }
    }

    private applyColorWithMask(createMask: () => void, color: string) {
        if (!this.thermometersTempCanvasCtx) return

        this.thermometersTempCanvasCtx.save()
        this.thermometersTempCanvasCtx.beginPath()
        createMask()
        this.thermometersTempCanvasCtx.clip()
        this.thermometersTempCanvasCtx.fillStyle = color
        this.thermometersTempCanvasCtx.fillRect(0, 0, this.logicalSize, this.logicalSize)
        this.thermometersTempCanvasCtx.restore()
    }

    protected renderThermometers() {
        if (!this.thermometersTempCanvasCtx || !this.canvasRef || !this._game) return
        const ctx = this.canvasRef.getContext('2d')
        if (!ctx) return

        this.thermometersTempCanvasCtx.clearRect(0, 0, this.logicalSize, this.logicalSize)
        this.thermometersTempCanvasCtx.drawImage(this.thermometersOffscreenCanvas, 0, 0)

        let selectedThermometers: Set<Thermometer> = new Set()
        for (const cell of this._game.selectedCells) {
            if (cell.thermometer) selectedThermometers.add(cell.thermometer)
        }

        this.thermometersTempCanvasCtx.globalCompositeOperation = 'source-in'

        // Paint selected thermometers white
        this.applyColorWithMask(() => {
            if (!this.thermometersTempCanvasCtx) return
            for (const thermo of selectedThermometers) {
                for (const c of thermo.members) {
                    this.thermometersTempCanvasCtx.rect(c.screenPosition.x - Canvas.CELL_BORDER_WIDTH, c.screenPosition.y - Canvas.CELL_BORDER_WIDTH, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2)
                }
            }
        }, this._theme === 'dark' ? '#777' : '#888')

        // Paint thermometers with errors red
        if (this._game.settings.checkErrors) {
            this.applyColorWithMask(() => {
                if (!this.thermometersTempCanvasCtx || !this._game) return
                for (const thermo of this._game.thermometers) {
                    if (thermo.error) {
                        for (const c of thermo.members) {
                            this.thermometersTempCanvasCtx.rect(c.screenPosition.x - Canvas.CELL_BORDER_WIDTH, c.screenPosition.y - Canvas.CELL_BORDER_WIDTH, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2)
                        }
                    }
                }
            }, this.accentColor === 'red' ? '#ffe173' : '#ff5252')
        }

        this.thermometersTempCanvasCtx.globalCompositeOperation = 'source-over'

        ctx.globalAlpha = 0.5
        ctx.drawImage(this.thermometersTempCanvas, 0, 0)
        ctx.globalAlpha = 1
    }

    afterCanvasChangedSize(): void {
        super.afterCanvasChangedSize()
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
