import { InitGameProps, StateProps, RendererProps } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { decodeDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"
import { classicGetVisibleCells } from "./Classic"
import { drawSVGNumber } from "./Common"

export function sandwichInitGameData({ game, data }: InitGameProps) {
    game.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier)
    const [clues, horizontalClues, verticalClues] = data.m.split(' ')
    game.clues = decodeMissionString(clues)
    game.mission = data.m
    game.sandwich__horizontalClues = horizontalClues.split(',').map(c => Number.parseInt(c))
    game.sandwich__verticalClues = verticalClues.split(',').map(c => Number.parseInt(c))
}

export function sandwichResize({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth }: StateProps) {
    const boxBorderWidth = logicalSize.current * boxBorderWidthFactor
    const numberOfBoxBorders = (Math.floor(game.nSquares / 3) + 1)
    const numberOfCellBorders = game.nSquares + 1 - numberOfBoxBorders
    const totalBorderThickness = numberOfBoxBorders * boxBorderWidth + numberOfCellBorders * cellBorderWidth
    const sandwichMargin = Math.floor(logicalSize.current * 0.1)
    squareSize.current = Math.floor((logicalSize.current - totalBorderThickness - sandwichMargin) / game.nSquares)
    logicalSize.current = squareSize.current * game.nSquares + totalBorderThickness + sandwichMargin

    let newCellPositions = []
    let newValuePositions = []

    let pos = boxBorderWidth + sandwichMargin
    for (let i = 0; i < game.nSquares; i++) {
        newCellPositions.push(pos)
        newValuePositions.push(pos + squareSize.current / 2)
        pos += squareSize.current + cellBorderWidth
        if ((i + 1) % 3 === 0) pos += boxBorderWidth - cellBorderWidth
    }

    let newNoteDeltas = []

    const notePaddingH = squareSize.current * 0.2
    const notePaddingTop = squareSize.current * 0.17
    const notePaddingBottom = squareSize.current * 0.17

    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) newNoteDeltas.push({ x: notePaddingH + x * (squareSize.current - 2 * notePaddingH) / 2, y: notePaddingTop + y * (squareSize.current - notePaddingTop - notePaddingBottom) / 2 })

    rendererState.current.sandwichMargin = sandwichMargin
    rendererState.current.noteDeltas = newNoteDeltas
    rendererState.current.cellPositions = newCellPositions
    rendererState.current.valuePositions = newValuePositions
}

export function sandwichRenderBackground({ ctx, themes, theme, logicalSize, rendererState }: RendererProps) {
    //Board background
    ctx.fillStyle = themes[theme].background
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = themes[theme].canvasCellBorderColor
    ctx.fillRect(rendererState.sandwichMargin, rendererState.sandwichMargin, logicalSize - rendererState.sandwichMargin, logicalSize - rendererState.sandwichMargin)
}

export function sandwichRenderBorders({ ctx, game, themes, theme, boxBorderWidth, logicalSize, squareSize, rendererState }: RendererProps) {
    //Borders
    if (theme === 'light') {
        ctx.fillStyle = themes[theme].canvasBoxBorderColor
        ctx.fillRect(rendererState.sandwichMargin, rendererState.sandwichMargin, boxBorderWidth, logicalSize - rendererState.sandwichMargin)
        ctx.fillRect(rendererState.sandwichMargin, rendererState.sandwichMargin, logicalSize - rendererState.sandwichMargin, boxBorderWidth)
        for (let i = 2; i < game.nSquares; i += 3) {
            ctx.fillRect(rendererState.cellPositions[i] + squareSize, rendererState.sandwichMargin, boxBorderWidth, logicalSize - rendererState.sandwichMargin)
            ctx.fillRect(rendererState.sandwichMargin, rendererState.cellPositions[i] + squareSize, logicalSize - rendererState.sandwichMargin, boxBorderWidth)
        }
    } else if (SettingsHandler.settings.highContrastGrid) {
        ctx.fillStyle = 'white'
        for (let i = 2; i < game.nSquares - 1; i += 3) {
            ctx.fillRect(rendererState.cellPositions[i] + squareSize, boxBorderWidth + rendererState.sandwichMargin, boxBorderWidth, logicalSize - boxBorderWidth * 2 - rendererState.sandwichMargin)
            ctx.fillRect(boxBorderWidth + rendererState.sandwichMargin, rendererState.cellPositions[i] + squareSize, logicalSize - boxBorderWidth * 2 - rendererState.sandwichMargin, boxBorderWidth)
        }
    }
}

export function sandwichRenderLateralClues({ ctx, game, squareSize, themes, theme, rendererState }: RendererProps) {
    const x = rendererState.sandwichMargin * 0.8
    const y = rendererState.sandwichMargin * 0.8
    const size = squareSize * 0.35
    const halfSquareSize = squareSize / 2
    for (let i = 0; i < game.nSquares; i++) {
        ctx.fillStyle = ctx.strokeStyle = game.sandwich__lateralCluesErrors.horizontal[i] ? '#ff5252' : (game.selectedCells.some(cell => cell.y === i) ? themes[theme].canvasNoteHighlightColor : themes[theme].canvasClueColor)
        if (game.sandwich__visibleHorizontalClues[i]) drawSVGNumber(ctx, game.sandwich__horizontalClues[i], x, rendererState.cellPositions[i] + halfSquareSize, size, 'left', 'center', null)
        ctx.fillStyle = ctx.strokeStyle = game.sandwich__lateralCluesErrors.vertical[i] ? '#ff5252' : (game.selectedCells.some(cell => cell.x === i) ? themes[theme].canvasNoteHighlightColor : themes[theme].canvasClueColor)
        if (game.sandwich__visibleVerticalClues[i]) drawSVGNumber(ctx, game.sandwich__verticalClues[i], rendererState.cellPositions[i] + halfSquareSize, y, size, 'center', 'top', null)
    }
}

export function sandwichGetSumBetween1and9(game: Board, row: number, column: number): [number, number, number] {
    if (row >= 0) {
        let x1 = -1
        let x9 = -1
        for (let x = 0; x < game.nSquares; x++) {
            const val = game.get({ x, y: row }).value
            if (val === 1) x1 = x
            if (val === 9) x9 = x
        }
        if (x1 > -1 && x9 > -1) {
            const minX = Math.min(x1, x9) + 1
            const maxX = Math.max(x1, x9) - 1
            let sum = 0
            for (let x = minX; x <= maxX; x++) {
                const val = game.get({ x, y: row }).value
                if (val === 0) {
                    sum = -1
                    break
                }
                sum += val
            }
            return [sum, minX, maxX]
        }
    }

    if (column >= 0) {
        let y1 = -1
        let y9 = -1
        for (let y = 0; y < game.nSquares; y++) {
            const val = game.get({ x: column, y }).value
            if (val === 1) y1 = y
            if (val === 9) y9 = y
        }
        if (y1 > -1 && y9 > -1) {
            const minY = Math.min(y1, y9) + 1
            const maxY = Math.max(y1, y9) - 1
            let sum = 0
            for (let y = minY; y <= maxY; y++) {
                const val = game.get({ x: column, y }).value
                if (val === 0) {
                    sum = -1
                    break
                }
                sum += val
            }
            return [sum, minY, maxY]
        }
    }

    return [-1, -1, -1]
}

export function sandwichDetectErrors(game: Board) {
    if (!SettingsHandler.settings.checkMistakes) return []

    game.iterateAllCells((cell, { x, y }) => {
        for (const vc of classicGetVisibleCells(game, { x, y })) {
            cell.isError = ((vc.x !== x || vc.y !== y) && game.get(vc).value === cell.value)
        }
    })

    for (let x = 0; x < game.nSquares; x++) {
        const [sum, minY, maxY] = sandwichGetSumBetween1and9(game, -1, x)
        game.sandwich__visibleVerticalClues[x] = true
        game.sandwich__lateralCluesErrors.vertical[x] = false
        if (sum !== -1 && sum !== game.sandwich__verticalClues[x]) {
            for (let y = minY; y <= maxY; y++) {
                game.get({ x, y }).isError = true
            }
            game.sandwich__lateralCluesErrors.vertical[x] = true
        } else if (sum === game.sandwich__verticalClues[x]) {
            game.sandwich__visibleVerticalClues[x] = false
        }
    }

    for (let y = 0; y < game.nSquares; y++) {
        const [sum, minX, maxX] = sandwichGetSumBetween1and9(game, y, -1)
        game.sandwich__visibleHorizontalClues[y] = true
        game.sandwich__lateralCluesErrors.horizontal[y] = false
        if (sum !== -1 && sum !== game.sandwich__horizontalClues[y]) {
            for (let x = minX; x <= maxX; x++) {
                game.get({ x, y }).isError = true
            }
            game.sandwich__lateralCluesErrors.horizontal[y] = true
        } else if (sum === game.sandwich__horizontalClues[y]) {
            game.sandwich__visibleHorizontalClues[y] = false
        }
    }

    return []
}

export function sandwichInitClueVisibility(game: Board) {
    game.sandwich__visibleHorizontalClues = []
    game.sandwich__visibleVerticalClues = []
    game.sandwich__lateralCluesErrors = { horizontal: [], vertical: [] }
    for (let i = 0; i < game.nSquares; i++) {
        game.sandwich__visibleHorizontalClues.push(true)
        game.sandwich__visibleVerticalClues.push(true)
        game.sandwich__lateralCluesErrors.horizontal.push(false)
        game.sandwich__lateralCluesErrors.vertical.push(false)
    }
}
