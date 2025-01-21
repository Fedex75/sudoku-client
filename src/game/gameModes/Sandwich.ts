import { InitGameProps, StateProps, RendererProps } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { getDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"
import { drawSVGNumber } from "./Common"

export function sandwichInitGameData({ game, data }: InitGameProps) {
    game.difficulty = getDifficulty(data.id[1] as DifficultyIdentifier)
    const [clues] = data.m.split(' ')
    game.clues = decodeMissionString(clues)
    game.mission = data.m
    sandwichInitLateralClues(game)
}

export function sandwichInitLateralClues(game: Board) {
    const [, horizontalClues, verticalClues] = game.mission.split(' ')
    game.cache.sandwich__clues = {
        horizontal: horizontalClues.split(',').map(c => ({
            value: Number.parseInt(c),
            error: false,
            visible: true
        })),
        vertical: verticalClues.split(',').map(c => ({
            value: Number.parseInt(c),
            error: false,
            visible: true
        })),
    }
}

const lateralClueMarginFactor = 0.8

export function sandwichResize({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth }: StateProps) {
    const boxBorderWidth = logicalSize.current * boxBorderWidthFactor
    const numberOfBoxBorders = (Math.floor(game.nSquares / 3) + 1)
    const numberOfCellBorders = game.nSquares + 1 - numberOfBoxBorders
    const totalBorderThickness = numberOfBoxBorders * boxBorderWidth + numberOfCellBorders * cellBorderWidth
    squareSize.current = Math.floor((logicalSize.current - totalBorderThickness) / (game.nSquares + lateralClueMarginFactor))
    logicalSize.current = squareSize.current * (game.nSquares + lateralClueMarginFactor) + totalBorderThickness

    let newCellPositions = []
    let newValuePositions = []

    let pos = boxBorderWidth + Math.floor(squareSize.current * lateralClueMarginFactor)
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

    rendererState.current.noteDeltas = newNoteDeltas
    rendererState.current.cellPositions = newCellPositions
    rendererState.current.valuePositions = newValuePositions
}

export function sandwichRenderBackground({ ctx, themes, theme, logicalSize, rendererState, squareSize }: RendererProps) {
    //Board background
    ctx.fillStyle = themes[theme].background
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = themes[theme].canvasCellBorderColor
    const lateralMargin = Math.floor(squareSize * lateralClueMarginFactor)
    ctx.fillRect(lateralMargin, lateralMargin, logicalSize - lateralMargin, logicalSize - lateralMargin)
}

export function sandwichRenderBorders({ ctx, game, themes, theme, boxBorderWidth, logicalSize, squareSize, rendererState }: RendererProps) {
    //Borders
    const lateralMargin = Math.floor(squareSize * lateralClueMarginFactor)
    if (theme === 'light') {
        ctx.fillStyle = themes[theme].canvasBoxBorderColor
        ctx.fillRect(lateralMargin, lateralMargin, boxBorderWidth, logicalSize - lateralMargin)
        ctx.fillRect(lateralMargin, lateralMargin, logicalSize - lateralMargin, boxBorderWidth)
        for (let i = 2; i < game.nSquares; i += 3) {
            ctx.fillRect(rendererState.cellPositions[i] + squareSize, lateralMargin, boxBorderWidth, logicalSize - lateralMargin)
            ctx.fillRect(lateralMargin, rendererState.cellPositions[i] + squareSize, logicalSize - lateralMargin, boxBorderWidth)
        }
    } else if (SettingsHandler.settings.highContrastGrid) {
        ctx.fillStyle = 'white'
        for (let i = 2; i < game.nSquares - 1; i += 3) {
            ctx.fillRect(rendererState.cellPositions[i] + squareSize, boxBorderWidth + lateralMargin, boxBorderWidth, logicalSize - boxBorderWidth * 2 - lateralMargin)
            ctx.fillRect(boxBorderWidth + lateralMargin, rendererState.cellPositions[i] + squareSize, logicalSize - boxBorderWidth * 2 - lateralMargin, boxBorderWidth)
        }
    }
}

export function sandwichRenderLateralClues({ ctx, game, squareSize, themes, theme, rendererState }: RendererProps) {
    const x = Math.floor(squareSize * lateralClueMarginFactor * 0.8)
    const y = x
    const size = squareSize * 0.35
    const halfSquareSize = squareSize / 2
    for (let i = 0; i < game.nSquares; i++) {
        ctx.fillStyle = ctx.strokeStyle = (SettingsHandler.settings.checkMistakes && game.cache.sandwich__clues.horizontal[i].error) ? '#ff5252' : (game.selectedCells.some(cell => cell.y === i) ? themes[theme].canvasNoteHighlightColor : themes[theme].canvasClueColor)
        if (game.cache.sandwich__clues.horizontal[i].visible) drawSVGNumber(ctx, game.cache.sandwich__clues.horizontal[i].value, x, rendererState.cellPositions[i] + halfSquareSize, size, 'left', 'center', null)
        ctx.fillStyle = ctx.strokeStyle = (SettingsHandler.settings.checkMistakes && game.cache.sandwich__clues.vertical[i].error) ? '#ff5252' : (game.selectedCells.some(cell => cell.x === i) ? themes[theme].canvasNoteHighlightColor : themes[theme].canvasClueColor)
        if (game.cache.sandwich__clues.vertical[i].visible) drawSVGNumber(ctx, game.cache.sandwich__clues.vertical[i].value, rendererState.cellPositions[i] + halfSquareSize, y, size, 'center', 'top', null)
    }
}

export function sandwichGetSumBetween1and9(game: Board, row: number, column: number): number {
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
            return sum
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
            return sum
        }
    }

    return -1
}

export function sandwichDetectErrors(game: Board) {
    for (let x = 0; x < game.nSquares; x++) {
        const sum = sandwichGetSumBetween1and9(game, -1, x)
        game.cache.sandwich__clues.vertical[x].visible = true
        game.cache.sandwich__clues.vertical[x].error = false
        if (sum !== -1 && sum !== game.cache.sandwich__clues.vertical[x].value) {
            game.cache.sandwich__clues.vertical[x].error = true
        } else if (sum === game.cache.sandwich__clues.vertical[x].value) {
            game.cache.sandwich__clues.vertical[x].visible = false
        }
    }

    for (let y = 0; y < game.nSquares; y++) {
        const sum = sandwichGetSumBetween1and9(game, y, -1)
        game.cache.sandwich__clues.horizontal[y].visible = true
        game.cache.sandwich__clues.horizontal[y].error = false
        if (sum !== -1 && sum !== game.cache.sandwich__clues.horizontal[y].value) {
            game.cache.sandwich__clues.horizontal[y].error = true
        } else if (sum === game.cache.sandwich__clues.horizontal[y].value) {
            game.cache.sandwich__clues.horizontal[y].visible = false
        }
    }

    return
}
