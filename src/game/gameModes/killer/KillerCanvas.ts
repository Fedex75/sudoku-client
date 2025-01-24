import { Canvas } from '../../../utils/Canvas'
import { ScreenCoordinates, KillerCage } from '../../../utils/Cell'
import { AccentColor } from '../../../utils/Colors'
import SettingsHandler from '../../../utils/SettingsHandler'
import { themes } from '../../Themes'
import { KillerBoard } from './KillerBoard'

export type CageVector = {
    start: ScreenCoordinates
    end: ScreenCoordinates
    cage: KillerCage
    ratio: number
}

export class KillerCanvas extends Canvas<KillerBoard> {
    protected readonly cagesOffscreenCanvas = document.createElement('canvas')
    protected readonly cagesOffscreenCanvasCtx = this.cagesOffscreenCanvas.getContext('2d')
    protected readonly cagesTempCanvas = document.createElement('canvas')
    protected readonly cagesTempCanvasCtx = this.cagesTempCanvas.getContext('2d')

    protected cagePadding = 0

    constructor(accentColor: AccentColor, notPlayable: boolean, boxBorderWidthFactor: number) {
        super(accentColor, notPlayable, boxBorderWidthFactor)
        this.notePaddingLeftFactor = 0.28
        this.notePaddingTopFactor = 0.34
        this.notePaddingBottomFactor = 0.22
    }

    protected applyColorWithMask(createMask: () => void, color: string) {
        if (!this.cagesTempCanvasCtx) return

        this.cagesTempCanvasCtx.save()
        this.cagesTempCanvasCtx.beginPath()
        createMask()
        this.cagesTempCanvasCtx.clip()
        this.cagesTempCanvasCtx.fillStyle = color
        this.cagesTempCanvasCtx.fillRect(0, 0, this.logicalSize, this.logicalSize)
        this.cagesTempCanvasCtx.restore()
    }

    protected renderCagesAndCageValues() {
        if (!this.cagesOffscreenCanvasCtx || !this.cagesTempCanvasCtx || !this.canvasRef || !this._game) return
        const ctx = this.canvasRef.getContext('2d')
        if (!ctx) return

        this.cagesTempCanvasCtx.clearRect(0, 0, this.logicalSize, this.logicalSize)
        this.cagesTempCanvasCtx.drawImage(this.cagesOffscreenCanvas, 0, 0)

        let selectedCages: KillerCage[] = []
        for (const cell of this._game.selectedCells) {
            if (cell.cage && !selectedCages.includes(cell.cage)) selectedCages.push(cell.cage)
        }

        this.cagesTempCanvasCtx.globalCompositeOperation = 'source-in'

        // Paint cages that are on colored cells black to improve contrast
        this.applyColorWithMask(() => {
            if (!this.cagesTempCanvasCtx || !this._game) return

            for (const cell of this._game.allCells) {
                if (cell.color !== 'default') {
                    this.cagesTempCanvasCtx.rect(cell.screenPosition.x - Canvas.CELL_BORDER_WIDTH, cell.screenPosition.y - Canvas.CELL_BORDER_WIDTH, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2)
                }
            }
        }, 'black')

        // Paint selected cages white
        this.applyColorWithMask(() => {
            if (!this.cagesTempCanvasCtx) return

            for (const cage of selectedCages) {
                for (const cell of cage.members) {
                    this.cagesTempCanvasCtx.rect(cell.screenPosition.x - Canvas.CELL_BORDER_WIDTH, cell.screenPosition.y - Canvas.CELL_BORDER_WIDTH, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2)
                }
            }
        }, 'white')

        // Paint cages with error red or yellow
        if (SettingsHandler.settings.checkMistakes) {
            this.applyColorWithMask(() => {
                if (!this.cagesTempCanvasCtx || !this._game) return

                for (const cage of this._game.cages) {
                    if (cage.error) {
                        for (const cell of cage.members) {
                            this.cagesTempCanvasCtx.rect(cell.screenPosition.x - Canvas.CELL_BORDER_WIDTH, cell.screenPosition.y - Canvas.CELL_BORDER_WIDTH, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2, this.squareSize + Canvas.CELL_BORDER_WIDTH * 2)
                        }
                    }
                }
            }, this.accentColor === 'red' ? '#ffe173' : '#ff5252')
        }

        this.cagesTempCanvasCtx.globalCompositeOperation = 'source-over'

        ctx.drawImage(this.cagesTempCanvas, 0, 0)
    }

    afterCanvasChangedSize() {
        if (!this.cagesOffscreenCanvasCtx || !this.cagesTempCanvasCtx || !this._game) return
        super.afterCanvasChangedSize()

        this.cagePadding = Math.floor(this.squareSize * 0.08)
        let cageLinePositions = Array(this._game.nSquares * 2).fill(0)

        for (let i = 0; i < this._game.nSquares; i++) {
            const cell = this._game.get({ x: i, y: 0 })
            if (!cell) continue
            cageLinePositions[i * 2] = cell.screenPosition.x + this.cagePadding
            cageLinePositions[i * 2 + 1] = cell.screenPosition.x + this.squareSize - this.cagePadding - Canvas.CAGE_LINE_WIDTH
        }

        let newCageVectors: CageVector[] = []

        let startA = null
        let startB = null

        const targetRatio = Math.floor(this.squareSize * 0.075) + 1

        function addVector(c1: ScreenCoordinates, c2: ScreenCoordinates, cage: KillerCage) {
            const delta = Math.max(Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y)) + Canvas.CAGE_LINE_WIDTH
            const i = Math.ceil(delta / (2 * targetRatio) - 0.5)
            let ratio = delta / (2 * i + 1)

            if ((targetRatio - ratio) > (delta / (i - 1) - targetRatio)) ratio = delta / (i - 2)

            newCageVectors.push({ start: c1, end: c2, cage, ratio })
        }

        //Horizontal
        for (let y = 0; y < this._game.nSquares; y++) {
            const top = cageLinePositions[y * 2]
            const bottom = cageLinePositions[y * 2 + 1]

            for (let x = 0; x < this._game.nSquares; x++) {
                const cell = this._game.get({ x, y })
                if (!cell || !cell.cage) continue

                const hShift = cell.cageSum > 9 ? Math.ceil(this.squareSize * 0.28) : (cell.cageSum > 0 ? Math.ceil(this.squareSize * 0.15) : 0)

                const left = cageLinePositions[x * 2]
                const right = cageLinePositions[x * 2 + 1]

                const topCell = this._game.get({ x, y: y - 1 })
                const bottomCell = this._game.get({ x, y: y + 1 })
                const rightCell = this._game.get({ x: x + 1, y })
                const topRightCell = this._game.get({ x: x + 1, y: y - 1 })
                const bottomRightCell = this._game.get({ x: x + 1, y: y + 1 })

                //Top line
                if (!topCell || topCell.cage !== cell.cage) {
                    if (startA === null) startA = { x: left + hShift, y: top }
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: left + hShift, y: top }, cell.cage)
                        startA = null
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
                    if (startA === null) startA = { x: right, y: top }
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: right, y: top }, cell.cage)
                        startA = null
                    }
                }

                //Bottom line
                if (!bottomCell || bottomCell.cage !== cell.cage) {
                    if (startB === null) startB = { x: left, y: bottom }
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: left + hShift, y: bottom }, cell.cage)
                        startB = null
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
                    if (startB === null) startB = { x: right, y: bottom }
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: right, y: bottom }, cell.cage)
                        startB = null
                    }
                }
            }
        }

        //Vertical
        for (let x = 0; x < this._game.nSquares; x++) {
            const left = cageLinePositions[x * 2]
            const right = cageLinePositions[x * 2 + 1]

            for (let y = 0; y < this._game.nSquares; y++) {
                const cell = this._game.get({ x, y })
                if (!cell || !cell.cage) continue

                const vShift = cell.cageSum! > 0 ? Math.ceil(this.squareSize * 0.20) : 0

                const top = cageLinePositions[y * 2]
                const bottom = cageLinePositions[y * 2 + 1]

                const leftCell = this._game.get({ x: x - 1, y })
                const bottomCell = this._game.get({ x, y: y + 1 })
                const bottomLeftCell = this._game.get({ x: x - 1, y: y + 1 })
                const rightCell = this._game.get({ x: x + 1, y })
                const bottomRightCell = this._game.get({ x: x + 1, y: y + 1 })

                //Left line
                if (!leftCell || leftCell.cage !== cell.cage) {
                    if (startA === null) startA = { x: left, y: top + vShift }
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: left, y: top + vShift }, cell.cage!)
                        startA = null
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
                    if (startA === null) startA = { x: left, y: bottom }
                } else {
                    if (startA !== null) {
                        addVector(startA, { x: left, y: bottom }, cell.cage!)
                        startA = null
                    }
                }

                //Right line
                if (!rightCell || rightCell.cage !== cell.cage) {
                    if (startB === null) startB = { x: right, y: top }
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: right, y: top }, cell.cage!)
                        startB = null
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
                    if (startB === null) startB = { x: right, y: bottom }
                } else {
                    if (startB !== null) {
                        addVector(startB, { x: right, y: bottom }, cell.cage!)
                        startB = null
                    }
                }
            }
        }

        this.cagesOffscreenCanvas.width = this.logicalSize
        this.cagesOffscreenCanvas.height = this.logicalSize
        this.cagesTempCanvas.width = this.logicalSize
        this.cagesTempCanvas.height = this.logicalSize

        this.cagesOffscreenCanvasCtx.clearRect(0, 0, this.logicalSize, this.logicalSize)
        this.cagesOffscreenCanvasCtx.fillStyle = this.cagesOffscreenCanvasCtx.strokeStyle = themes[this.theme].canvasKillerCageColor

        //Border
        newCageVectors.forEach((vector: CageVector) => {
            if (!this.cagesOffscreenCanvasCtx) return
            KillerCanvas.dashedLine(this.cagesOffscreenCanvasCtx, vector.start, vector.end, vector.ratio, Canvas.CAGE_LINE_WIDTH)
        })

        for (const cell of this._game.allCells) {
            if (cell.cage && cell.cageSum > 0) KillerCanvas.drawSVGNumber(this.cagesOffscreenCanvasCtx, cell.cageSum, cell.screenPosition.x + this.cagePadding, cell.screenPosition.y + this.cagePadding + this.squareSize * 0.08, this.squareSize * 0.15, 'right', 'center', null)
        }
    }

    renderActiveGame(): void {
        this.renderCellBackground()
        this.renderCellValueAndCandidates()
        this.renderCagesAndCageValues()
        this.renderSelection()
        this.renderLinks()
        this.renderFadeAnimations()
    }
}
