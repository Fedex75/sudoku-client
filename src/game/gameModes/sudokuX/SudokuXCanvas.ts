import { Canvas } from '../../../utils/Canvas'
import { SudokuXBoard } from './SudokuXBoard'

export class SudokuXCanvas extends Canvas<SudokuXBoard> {
    private renderDiagonals() {
        if (!this.canvasRef || !this.game) return
        const ctx = this.canvasRef.getContext('2d')
        if (!ctx) return

        const topLeftCornerCell = this.game.get({ x: 0, y: 0 })
        const bottomRightCornerCell = this.game.get({ x: this.game.nSquares - 1, y: this.game.nSquares - 1 })
        if (!topLeftCornerCell || !bottomRightCornerCell) return

        // Here, we assume that the x and y coordinates of these cells are the same
        const near = topLeftCornerCell.screenPosition.x + this.squareSize / 2
        const far = bottomRightCornerCell.screenPosition.x + this.squareSize / 2

        // Main diagonal
        ctx.fillStyle = ctx.strokeStyle = this.game.mainDiagonalError ? (this.accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = this.theme === 'dark' ? '#333333aa' : '#ddddddaa')
        ctx.lineWidth = this.squareSize * 0.2
        ctx.beginPath()
        ctx.moveTo(near, near)
        ctx.lineTo(far, far)

        if (this.game.mainDiagonalError || this.game.secondaryDiagonalError) {
            ctx.stroke()
            ctx.beginPath()
        }

        // Secondary diagonal
        ctx.fillStyle = ctx.strokeStyle = this.game.secondaryDiagonalError ? (this.accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = this.theme === 'dark' ? '#333333aa' : '#ddddddaa')
        ctx.lineWidth = this.squareSize * 0.2
        ctx.moveTo(near, far)
        ctx.lineTo(far, near)
        ctx.stroke()

        // Circles

        ctx.fillStyle = ctx.strokeStyle = this.game.mainDiagonalError ? (this.accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = this.theme === 'dark' ? '#333333aa' : '#ddddddaa')
        // NW
        ctx.beginPath()
        ctx.arc(near, near, this.squareSize * 0.1, Math.PI * 0.75, - Math.PI * 0.25, false)
        ctx.fill()
        // SE
        ctx.beginPath()
        ctx.arc(far, far, this.squareSize * 0.1, - Math.PI * 0.25, Math.PI * 0.75, false)
        ctx.fill()

        ctx.fillStyle = ctx.strokeStyle = this.game.secondaryDiagonalError ? (this.accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = this.theme === 'dark' ? '#333333aa' : '#ddddddaa')
        // SW
        ctx.beginPath()
        ctx.arc(near, far, this.squareSize * 0.1, Math.PI * 0.25, Math.PI * 1.25, false)
        ctx.fill()
        // NE
        ctx.beginPath()
        ctx.arc(far, near, this.squareSize * 0.1, - Math.PI * 0.75, Math.PI * 0.25, false)
        ctx.fill()
    }

    renderActiveGame(): void {
        this.renderCellBackground()
        this.renderDiagonals()
        this.renderCellValueAndCandidates()
        this.renderSelection()
        this.renderLinks()
        this.renderFadeAnimations()
    }
}
