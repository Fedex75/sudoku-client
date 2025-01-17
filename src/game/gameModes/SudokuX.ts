import { indexOfCoordsInArray } from "../../utils/Utils"
import { InitGameProps, CellCoordinates, RendererProps } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { decodeDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"
import { classicGetVisibleCells, classicGetCellUnits, classicGetAllUnits } from "./Classic"
import { commonDetectErrorsByVisibility } from "./Common"

export function sudokuXInitGameData({ game, data }: InitGameProps) {
    game.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier)
    game.clues = decodeMissionString(data.m)
    game.mission = data.m
    game.solution = '000000000000000000000000000000000000000000000000000000000000000000000000000000000'
}

export function sudokuXGetVisibleCells(game: Board, c: CellCoordinates): CellCoordinates[] {
    let visibleCells = classicGetVisibleCells(game, c)

    // If the cell is in the NW-SE diagonal
    if (c.x === c.y) {
        for (let i = 0; i < game.nSquares; i++) {
            if (i !== c.x && indexOfCoordsInArray(visibleCells, { x: i, y: i }) === -1) {
                visibleCells.push({ x: i, y: i })
            }
        }
    }

    // If the cell is in the SW-NE diagonal
    if (c.y === game.nSquares - 1 - c.x) {
        for (let i = 0; i < game.nSquares; i++) {
            if (i !== c.x && indexOfCoordsInArray(visibleCells, { x: i, y: game.nSquares - 1 - i }) === -1) {
                visibleCells.push({ x: i, y: game.nSquares - 1 - i })
            }
        }
    }

    return visibleCells
}

export function sudokuXDetectErrors(game: Board) {
    if (!SettingsHandler.settings.checkMistakes) return

    commonDetectErrorsByVisibility(game)

    game.sudokuX__diagonalErrors = [false, false]
    for (let i = 0; i < game.nSquares - 1; i++) {
        const value1_main_diagonal = game.get({ x: i, y: i }).value
        const value1_secondary_diagonal = game.get({ x: i, y: game.nSquares - 1 - i }).value
        for (let j = i + 1; j < game.nSquares; j++) {
            const value2_main_diagonal = game.get({ x: j, y: j }).value
            const value2_secondary_diagonal = game.get({ x: j, y: game.nSquares - 1 - j }).value
            if (value2_main_diagonal > 0 && value1_main_diagonal > 0 && value2_main_diagonal === value1_main_diagonal) {
                game.sudokuX__diagonalErrors[0] = true
            }
            if (value2_secondary_diagonal > 0 && value1_secondary_diagonal > 0 && value2_secondary_diagonal === value1_secondary_diagonal) {
                game.sudokuX__diagonalErrors[1] = true
            }
        }
    }
}

export function sudokuXRenderDiagonals({ ctx, theme, game, rendererState, squareSize, accentColor }: RendererProps) {
    const near = rendererState.cellPositions[0] + squareSize / 2
    const far = rendererState.cellPositions[game.nSquares - 1] + squareSize / 2

    // Main diagonal
    ctx.fillStyle = ctx.strokeStyle = game.sudokuX__diagonalErrors[0] ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    ctx.lineWidth = squareSize * 0.2
    ctx.beginPath()
    ctx.moveTo(near, near)
    ctx.lineTo(far, far)

    if (game.sudokuX__diagonalErrors[0] || game.sudokuX__diagonalErrors[1]) {
        ctx.stroke()
        ctx.beginPath()
    }

    // Secondary diagonal
    ctx.fillStyle = ctx.strokeStyle = game.sudokuX__diagonalErrors[1] ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    ctx.lineWidth = squareSize * 0.2
    ctx.moveTo(near, far)
    ctx.lineTo(far, near)
    ctx.stroke()

    // Circles

    ctx.fillStyle = ctx.strokeStyle = game.sudokuX__diagonalErrors[0] ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    // NW
    ctx.beginPath()
    ctx.arc(near, near, squareSize * 0.1, Math.PI * 0.75, - Math.PI * 0.25, false)
    ctx.fill()
    // SE
    ctx.beginPath()
    ctx.arc(far, far, squareSize * 0.1, - Math.PI * 0.25, Math.PI * 0.75, false)
    ctx.fill()

    ctx.fillStyle = ctx.strokeStyle = game.sudokuX__diagonalErrors[1] ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    // SW
    ctx.beginPath()
    ctx.arc(near, far, squareSize * 0.1, Math.PI * 0.25, Math.PI * 1.25, false)
    ctx.fill()
    // NE
    ctx.beginPath()
    ctx.arc(far, near, squareSize * 0.1, - Math.PI * 0.75, Math.PI * 0.25, false)
    ctx.fill()
}

export function sudokuXGetCellUnits(game: Board, coords: CellCoordinates) {
    let units: CellCoordinates[][] = classicGetCellUnits(game, coords)

    // NW-SE diagonal
    if (coords.x === coords.y) {
        let nwseDiagonal: CellCoordinates[] = []
        for (let i = 0; i < game.nSquares; i++) {
            nwseDiagonal.push({ x: i, y: i })
        }
        units.push(nwseDiagonal)
    }

    // SW-NE diagonal
    if (coords.y === game.nSquares - 1 - coords.x) {
        let swneDiagonal: CellCoordinates[] = []
        for (let i = 0; i < game.nSquares; i++) {
            swneDiagonal.push({ x: i, y: game.nSquares - 1 - i })
        }
        units.push(swneDiagonal)
    }

    return units
}

export function sudokuXGetAllUnits(game: Board): CellCoordinates[][] {
    let units = classicGetAllUnits(game)
    let currentUnit: CellCoordinates[] = []

    //NW-SE diagonal
    for (let i = 0; i < game.nSquares; i++) {
        currentUnit.push({ x: i, y: i })
    }
    units.push([...currentUnit])

    //NW-SE diagonal
    currentUnit = []
    for (let i = 0; i < game.nSquares; i++) {
        currentUnit.push({ x: i, y: game.nSquares - 1 - i })
    }
    units.push([...currentUnit])

    return units
}
