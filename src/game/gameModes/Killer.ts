import { indexOfCoordsInArray } from "../../utils/CoordsUtils"
import { RendererProps, InitGameProps, BoardAnimation, CellCoordinates, StateProps } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { decodeDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"
import { classicGetVisibleCells } from "./Classic"
import { commonDetectErrorsFromSolution, dashedLine, drawSVGNumber } from "./Common"

export function killerRenderCagesAndCageValues({ ctx, game, cageLineWidth, rendererState, themes, theme, squareSize }: RendererProps) {
    ctx.lineWidth = cageLineWidth

    //Border
    rendererState.cageVectors.forEach((vector: CageVector) => {
        ctx.fillStyle = ctx.strokeStyle = game.killer__cageErrors.includes(vector[2]) ? '#ff5252' : (game.selectedCells.some(selectedCell => vector[2] === game.get(selectedCell).cageIndex)) ? themes[theme].canvasKillerHighlightedCageColor : themes[theme].canvasKillerCageColor
        dashedLine(ctx, vector[0], vector[1], vector[3], cageLineWidth)
    })

    game.iterateAllCells((cell, { x, y }) => {
        if (cell.cageValue! > 0) {
            ctx.strokeStyle = ctx.fillStyle = game.killer__cageErrors.includes(cell.cageIndex!) ? '#ff5252' : game.selectedCells.some(selectedCell => cell.cageIndex === game.get(selectedCell).cageIndex) && game.nSquares > 3 ? themes[theme].canvasKillerHighlightedCageColor : themes[theme].canvasKillerCageColor
            drawSVGNumber(ctx, cell.cageValue!, rendererState.cellPositions[x] + rendererState.cagePadding, rendererState.cellPositions[y] + rendererState.cagePadding + squareSize * 0.08, squareSize * 0.15, 'right', 'center', null)
        }
    })
}

export function killerInitGameData({ game, data }: InitGameProps) {
    game.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier)
    const [clues, solution, cages] = data.m.split(' ')
    game.clues = decodeMissionString(clues)
    game.mission = data.m
    game.solution = solution
    game.killer__cages = []
    for (const cage of cages.split(',')) {
        let newCage: CellCoordinates[] = []
        for (let i = 0; i < cage.length; i += 2) {
            newCage.push({ x: Number(cage[i]), y: Number(cage[i + 1]) })
        }
        game.killer__cages.push(newCage)
    }
}

export function killerSolveLastInCages(game: Board) {
    let animations: BoardAnimation[] = []
    if (SettingsHandler.settings.killerAutoSolveLastInCage && game.nSquares > 3) {
        for (const cage of game.killer__cages) {
            let remaining = cage.length
            let sum = 0
            let realSum = 0
            cage.forEach(coords => {
                const cell = game.get(coords)
                if (cell.value > 0) remaining--
                sum += cell.value
                if (cell.cageValue! > 0) realSum = cell.cageValue!
            })
            if (remaining === 1 && realSum - sum <= 9) {
                cage.forEach(coords => {
                    if (game.get(coords).value === 0) {
                        animations.concat(game.setValue([coords], realSum - sum))
                    }
                })
            }
        }
    }

    return animations
}

export function killerInitCages(game: Board) {
    game.killer__cageErrors = []

    for (let cageIndex = 0; cageIndex < game.killer__cages.length; cageIndex++) {
        game.killer__cages[cageIndex].forEach((coords, cellIndex) => {
            const cell = game.get(coords)
            cell.cageIndex = cageIndex
            if (SettingsHandler.settings.killerAutoSolveLastInCage && game.killer__cages[cageIndex].length === 1 && game.nSquares > 3) cell.value = cell.solution
            if (cellIndex === 0) {
                let sum = 0
                for (const coords2 of game.killer__cages[cageIndex]) sum += game.get(coords2).solution
                cell.cageValue = sum
            } else {
                cell.cageValue = 0
            }
        })
    }

    if (SettingsHandler.settings.killerAutoSolveLastInCage && game.nSquares > 3) {
        for (let cageIndex = 0; cageIndex < game.killer__cages.length; cageIndex++) {
            killerSolveLastInCages(game)
        }
    }
}

export function killerGetVisibleCells(game: Board, c: CellCoordinates): CellCoordinates[] {
    let visibleCells = classicGetVisibleCells(game, c)

    for (const coords of game.killer__cages[game.get(c).cageIndex!]) {
        if (indexOfCoordsInArray(visibleCells, coords) === -1) visibleCells.push(coords)
    }

    return visibleCells
}

export function killerResize({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth }: StateProps) {
    const boxBorderWidth = logicalSize.current * boxBorderWidthFactor
    const numberOfBoxBorders = (Math.floor(game.nSquares / 3) + 1)
    const numberOfCellBorders = game.nSquares + 1 - numberOfBoxBorders
    const totalBorderThickness = numberOfBoxBorders * boxBorderWidth + numberOfCellBorders * cellBorderWidth
    squareSize.current = Math.floor((logicalSize.current - totalBorderThickness) / game.nSquares)
    logicalSize.current = squareSize.current * game.nSquares + totalBorderThickness

    let newCellPositions = []
    let newValuePositions = []

    let pos = boxBorderWidth
    for (let i = 0; i < game.nSquares; i++) {
        newCellPositions.push(pos)
        newValuePositions.push(pos + squareSize.current / 2)
        pos += squareSize.current + cellBorderWidth
        if ((i + 1) % 3 === 0) pos += boxBorderWidth - cellBorderWidth
    }

    let newNoteDeltas = []

    const notePaddingH = squareSize.current * 0.28
    const notePaddingTop = squareSize.current * 0.34
    const notePaddingBottom = squareSize.current * 0.22

    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) newNoteDeltas.push({ x: notePaddingH + x * (squareSize.current - 2 * notePaddingH) / 2, y: notePaddingTop + y * (squareSize.current - notePaddingTop - notePaddingBottom) / 2 })

    rendererState.current.noteDeltas = newNoteDeltas
    rendererState.current.cellPositions = newCellPositions
    rendererState.current.valuePositions = newValuePositions
}

export type CageVector = [CellCoordinates, CellCoordinates, number, number]

export function killerCalculateCageVectors({ game, rendererState, squareSize, cageLineWidth }: StateProps) {
    rendererState.current.cagePadding = Math.floor(squareSize.current * 0.08)
    let cageLinePositions = Array(game.nSquares * 2).fill(0)

    for (let i = 0; i < game.nSquares; i++) {
        cageLinePositions[i * 2] = rendererState.current.cellPositions[i] + rendererState.current.cagePadding
        cageLinePositions[i * 2 + 1] = rendererState.current.cellPositions[i] + squareSize.current - rendererState.current.cagePadding - cageLineWidth
    }

    let newCageVectors: CageVector[] = []

    let startA = null
    let startB = null

    const targetRatio = Math.floor(squareSize.current * 0.075) + 1

    function addVector(c1: CellCoordinates, c2: CellCoordinates, cageIndex: number) {
        let i = 1
        let ratio = 0
        const delta = Math.max(Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y)) + cageLineWidth

        while (true) {
            ratio = delta / i
            if (ratio <= targetRatio) {
                if ((targetRatio - ratio) > (delta / (i - 1) - targetRatio)) ratio = delta / (i - 2)
                break
            }
            i += 2
        }

        newCageVectors.push([c1, c2, cageIndex, ratio])
    }

    //Horizontal
    for (let y = 0; y < game.nSquares; y++) {
        const top = cageLinePositions[y * 2]
        const bottom = cageLinePositions[y * 2 + 1]

        for (let x = 0; x < game.nSquares; x++) {
            const cell = game.board[x][y]

            const hShift = cell.cageValue! > 9 ? Math.ceil(squareSize.current * 0.28) : (cell.cageValue! > 0 ? Math.ceil(squareSize.current * 0.15) : 0)

            const left = cageLinePositions[x * 2]
            const right = cageLinePositions[x * 2 + 1]

            //Top line
            if (y === 0 || game.board[x][y - 1].cageIndex !== cell.cageIndex) {
                if (startA === null) startA = { x: left + hShift, y: top }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: left + hShift, y: top }, cell.cageIndex!)
                    startA = null
                }
            }

            //Top bridge
            if (!(x === (game.nSquares - 1) || game.board[x + 1][y].cageIndex !== cell.cageIndex) && x < game.nSquares - 1 && !(y > 0 && game.board[x + 1][y - 1].cageIndex === cell.cageIndex && game.board[x][y - 1].cageIndex === cell.cageIndex)
            ) {
                if (startA === null) startA = { x: right, y: top }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: right, y: top }, cell.cageIndex!)
                    startA = null
                }
            }

            //Bottom line
            if (y === (game.nSquares - 1) || game.board[x][y + 1].cageIndex !== cell.cageIndex) {
                if (startB === null) startB = { x: left, y: bottom }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: left + hShift, y: bottom }, cell.cageIndex!)
                    startB = null
                }
            }

            //Bottom bridge
            if (!(x === (game.nSquares - 1) || game.board[x + 1][y].cageIndex !== cell.cageIndex) && x < game.nSquares - 1 && !(y < (game.nSquares - 1) && game.board[x + 1][y + 1].cageIndex === cell.cageIndex && game.board[x][y + 1].cageIndex === cell.cageIndex)) {
                if (startB === null) startB = { x: right, y: bottom }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: right, y: bottom }, cell.cageIndex!)
                    startB = null
                }
            }
        }
    }

    //Vertical
    for (let x = 0; x < game.nSquares; x++) {
        const left = cageLinePositions[x * 2]
        const right = cageLinePositions[x * 2 + 1]

        for (let y = 0; y < game.nSquares; y++) {
            const cell = game.board[x][y]

            const vShift = cell.cageValue! > 0 ? Math.ceil(squareSize.current * 0.20) : 0

            const top = cageLinePositions[y * 2]
            const bottom = cageLinePositions[y * 2 + 1]

            //Left line
            if (x === 0 || game.board[x - 1][y].cageIndex !== cell.cageIndex) {
                if (startA === null) startA = { x: left, y: top + vShift }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: left, y: top + vShift }, cell.cageIndex!)
                    startA = null
                }
            }

            //Left bridge
            if (!(y === (game.nSquares - 1) || game.board[x][y + 1].cageIndex !== cell.cageIndex) && !(x > 0 && game.board[x - 1][y].cageIndex === cell.cageIndex && game.board[x - 1][y + 1].cageIndex === cell.cageIndex)) {
                if (startA === null) startA = { x: left, y: bottom }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: left, y: bottom }, cell.cageIndex!)
                    startA = null
                }
            }

            //Right line
            if (x === (game.nSquares - 1) || game.board[x + 1][y].cageIndex !== cell.cageIndex) {
                if (startB === null) startB = { x: right, y: top }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: right, y: top }, cell.cageIndex!)
                    startB = null
                }
            }

            //Right bridge
            if (!(y === (game.nSquares - 1) || game.board[x][y + 1].cageIndex !== cell.cageIndex) && !(x < (game.nSquares - 1) && game.board[x + 1][y].cageIndex === cell.cageIndex && game.board[x + 1][y + 1].cageIndex === cell.cageIndex)) {
                if (startB === null) startB = { x: right, y: bottom }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: right, y: bottom }, cell.cageIndex!)
                    startB = null
                }
            }
        }
    }

    rendererState.current.cageVectors = newCageVectors
}

export function killerCheckErrors(game: Board) {
    commonDetectErrorsFromSolution(game)

    game.killer__cageErrors = []

    for (const cage of game.killer__cages) {
        let sum = 0
        for (const coords of cage) {
            const cell = game.get(coords)
            if (cell.value > 0) sum += cell.value
            else {
                sum = -1
                break
            }
        }
        if (sum !== -1 && sum !== game.get(cage[0]).cageValue!) {
            game.killer__cageErrors.push(game.get(cage[0]).cageIndex!)
        }
    }
}
