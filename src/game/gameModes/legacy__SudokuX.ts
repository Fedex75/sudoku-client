/*import brightness from "../../utils/Utils"
import { InitGameProps, RendererProps, Cell } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { getDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import Board from "../../utils/Board"
import { classicGetVisibleCells, classicGetCellUnits, classicGetAllUnits } from "./classic/ClassicBoard"
import SettingsHandler from '../../utils/SettingsHandler'

export function sudokuXInitGameData({ game, data }: InitGameProps) {
    game.difficulty = getDifficulty(data.id[1] as DifficultyIdentifier)
    game.clues = decodeMissionString(data.m)
    game.mission = data.m
    game.solution = ''
}

export function sudokuXGetVisibleCells(game: Board, cell: Cell): Cell[] {
    let visibleCells = classicGetVisibleCells(game, cell)

    // If the cell is in the NW-SE diagonal
    if (cell.coords.x === cell.coords.y) {
        for (let i = 0; i < game.nSquares; i++) {
            const c = game.get({ x: i, y: i })
            if (c !== cell && !visibleCells.includes(c)) {
                visibleCells.push(c)
            }
        }
    }

    // If the cell is in the SW-NE diagonal
    if (cell.coords.y === game.nSquares - 1 - cell.coords.x) {
        for (let i = 0; i < game.nSquares; i++) {
            const newY = game.nSquares - 1 - i
            const c = game.get({ x: i, y: newY })
            if (c !== cell && !visibleCells.includes(c)) {
                visibleCells.push(c)
            }
        }
    }

    return visibleCells
}

export function sudokuXDetectErrors(game: Board) {
    game.cache.sudokuX__diagonalErrors = [false, false]

    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: i, y: i }).cache.isError) {
            game.cache.sudokuX__diagonalErrors[0] = true
            break
        }
    }

    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: i, y: game.nSquares - 1 - i }).cache.isError) {
            game.cache.sudokuX__diagonalErrors[1] = true
            break
        }
    }
}

export function sudokuXRenderDiagonals({ ctx, theme, game, rendererState, squareSize, accentColor }: RendererProps) {
    const near = rendererState.cellPositions[0] + squareSize / 2
    const far = rendererState.cellPositions[game.nSquares - 1] + squareSize / 2

    const mainDiagonalError = (SettingsHandler.settings.checkMistakes && game.cache.sudokuX__diagonalErrors[0])
    const secondaryDiagonalError = (SettingsHandler.settings.checkMistakes && game.cache.sudokuX__diagonalErrors[1])

    // Main diagonal
    ctx.fillStyle = ctx.strokeStyle = mainDiagonalError ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    ctx.lineWidth = squareSize * 0.2
    ctx.beginPath()
    ctx.moveTo(near, near)
    ctx.lineTo(far, far)

    if (game.cache.sudokuX__diagonalErrors[0] || game.cache.sudokuX__diagonalErrors[1]) {
        ctx.stroke()
        ctx.beginPath()
    }

    // Secondary diagonal
    ctx.fillStyle = ctx.strokeStyle = secondaryDiagonalError ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    ctx.lineWidth = squareSize * 0.2
    ctx.moveTo(near, far)
    ctx.lineTo(far, near)
    ctx.stroke()

    // Circles

    ctx.fillStyle = ctx.strokeStyle = mainDiagonalError ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    // NW
    ctx.beginPath()
    ctx.arc(near, near, squareSize * 0.1, Math.PI * 0.75, - Math.PI * 0.25, false)
    ctx.fill()
    // SE
    ctx.beginPath()
    ctx.arc(far, far, squareSize * 0.1, - Math.PI * 0.25, Math.PI * 0.75, false)
    ctx.fill()

    ctx.fillStyle = ctx.strokeStyle = secondaryDiagonalError ? (accentColor === 'red' ? '#ffe17344' : '#ff525244') : (ctx.strokeStyle = theme === 'dark' ? '#333333aa' : '#ddddddaa')
    // SW
    ctx.beginPath()
    ctx.arc(near, far, squareSize * 0.1, Math.PI * 0.25, Math.PI * 1.25, false)
    ctx.fill()
    // NE
    ctx.beginPath()
    ctx.arc(far, near, squareSize * 0.1, - Math.PI * 0.75, Math.PI * 0.25, false)
    ctx.fill()
}

export function sudokuXGetCellUnits(game: Board, cell: Cell) {
    let units: Cell[][] = classicGetCellUnits(game, cell)

    // NW-SE diagonal
    if (cell.coords.x === cell.coords.y) {
        let nwseDiagonal: Cell[] = []
        for (let i = 0; i < game.nSquares; i++) {
            nwseDiagonal.push(game.get({ x: i, y: i }))
        }
        units.push(nwseDiagonal)
    }

    // SW-NE diagonal
    if (cell.coords.y === game.nSquares - 1 - cell.coords.x) {
        let swneDiagonal: Cell[] = []
        for (let i = 0; i < game.nSquares; i++) {
            swneDiagonal.push(game.get({ x: i, y: game.nSquares - 1 - i }))
        }
        units.push(swneDiagonal)
    }

    return units
}

export function sudokuXGetAllUnits(game: Board): Cell[][] {
    let units = classicGetAllUnits(game)
    let currentUnit: Cell[] = []

    //NW-SE diagonal
    for (let i = 0; i < game.nSquares; i++) {
        currentUnit.push(game.get({ x: i, y: i }))
    }
    units.push([...currentUnit])

    //NW-SE diagonal
    currentUnit = []
    for (let i = 0; i < game.nSquares; i++) {
        currentUnit.push(game.get({ x: i, y: game.nSquares - 1 - i }))
    }
    units.push([...currentUnit])

    return units
}

export function sudokuXCheckDiagonalAnimations(game: Board, center: Cell) {
    if (center.cache.coords.x === center.cache.coords.y) {
        let shouldAddMainDiagonalAnimation = true
        for (let i = 0; i < game.nSquares; i++) {
            if (game.get({ x: i, y: i }).value === 0) {
                shouldAddMainDiagonalAnimation = false
                break
            }
        }

        if (shouldAddMainDiagonalAnimation) {
            game.animations.push({
                type: 'diagonal',
                startTime: null,
                duration: 750,
                func: ({ animationColors, themes, theme, progress }) => {
                    for (let i = 0; i < game.nSquares; i++) animationColors[i][i] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(center.cache.coords.x - i), progress, 8, 4)})`
                }
            })
        }
    }

    if (center.cache.coords.x === game.nSquares - 1 - center.cache.coords.x) {
        let shouldAddSecondaryDiagonalAnimation = true
        for (let i = 0; i < game.nSquares; i++) {
            if (game.get({ x: i, y: game.nSquares - 1 - i }).value === 0) {
                shouldAddSecondaryDiagonalAnimation = false
                break
            }
        }

        if (shouldAddSecondaryDiagonalAnimation) {
            game.animations.push({
                type: 'diagonal',
                startTime: null,
                duration: 750,
                func: ({ animationColors, themes, theme, progress }) => {
                    for (let i = 0; i < game.nSquares; i++) {
                        const y = game.nSquares - 1 - i
                        animationColors[i][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(center.cache.coords.x - i), progress, 8, 4)})`
                    }
                }
            })
        }
    }
}
*/
