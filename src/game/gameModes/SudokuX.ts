import { indexOfCoordsInArray } from "../../utils/CoordsUtils"
import { InitGameProps, CellCoordinates, RendererProps } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { decodeDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"
import { classicGetVisibleCells, classicGetCellUnits, classicGetAllUnits } from "./Classic"

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

    for (let x = 0; x <= game.nSquares - 1; x++) {
        for (let y = 0; y <= game.nSquares - 1; y++) {
            game.get({ x, y }).isError = false
        }
    }

    for (let x = 0; x <= game.nSquares - 1; x++) {
        for (let y = 0; y <= game.nSquares - 1; y++) {
            const cell = game.get({ x, y })
            if (cell.value > 0 && !cell.clue) {
                for (const vc of game.ruleset.game.getVisibleCells(game, { x, y })) {
                    if ((vc.x !== x || vc.y !== y) && game.get(vc).value === cell.value) {
                        cell.isError = game.get(vc).isError = true
                    }
                }
            }
        }
    }
}

export function sudokuXRenderDiagonals({ ctx, theme, game, rendererState, squareSize }: RendererProps) {
    ctx.fillStyle = ctx.strokeStyle = theme === 'dark' ? '#333333' : '#dddddd'

    const near = rendererState.cellPositions[0] + squareSize / 2
    const far = rendererState.cellPositions[game.nSquares - 1] + squareSize / 2

    // SW-NE diagonal
    ctx.lineWidth = squareSize * 0.2
    ctx.beginPath()
    ctx.moveTo(near, far)
    ctx.lineTo(far, near)
    ctx.stroke()

    // NW-SE diagonal
    ctx.lineWidth = squareSize * 0.2
    ctx.beginPath()
    ctx.moveTo(near, near)
    ctx.lineTo(far, far)
    ctx.stroke()

    // Circles
    ctx.beginPath()
    ctx.arc(near, near, squareSize * 0.1, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(near, far, squareSize * 0.1, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(far, near, squareSize * 0.1, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(far, far, squareSize * 0.1, 0, 2 * Math.PI, false)
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
