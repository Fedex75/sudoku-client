import { indexOf } from "../../utils/Utils"
import { RendererProps, InitGameProps, CellCoordinates, StateProps, KillerCage, CageVector } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { getDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"
import { classicGetVisibleCells } from "./Classic"
import { dashedLine, drawSVGNumber } from './Common'

const cagesOffscreenCanvas = document.createElement('canvas')
const cagesOffScreenCanvasCtx = cagesOffscreenCanvas.getContext('2d')
const cagesTempCanvas = document.createElement('canvas')
const cagesTempCanvasCtx = cagesTempCanvas.getContext('2d')

export function killerRenderCagesAndCageValues({ ctx, game, rendererState, accentColor, squareSize, cellBorderWidth, logicalSize }: RendererProps) {
    if (!cagesOffScreenCanvasCtx || !cagesTempCanvasCtx) return

    cagesTempCanvasCtx.clearRect(0, 0, logicalSize, logicalSize)
    cagesTempCanvasCtx.drawImage(cagesOffscreenCanvas, 0, 0)

    let selectedCages: KillerCage[] = []
    for (const c of game.selectedCells) {
        const cell = game.get(c)
        if (cell.cache.cage && !selectedCages.includes(cell.cache.cage)) selectedCages.push(cell.cache.cage)
    }

    cagesTempCanvasCtx.globalCompositeOperation = 'source-in'

    function applyColorWithMask(createMask: () => void, color: string) {
        if (!cagesTempCanvasCtx) return

        cagesTempCanvasCtx.save()
        cagesTempCanvasCtx.beginPath()
        createMask()
        cagesTempCanvasCtx.clip()
        cagesTempCanvasCtx.fillStyle = color
        cagesTempCanvasCtx.fillRect(0, 0, logicalSize, logicalSize)
        cagesTempCanvasCtx.restore()
    }

    // Paint cages that are on colored cells black to improve contrast
    applyColorWithMask(() => {
        game.iterateAllCells((cell, c) => {
            if (cell.color !== 'default') {
                cagesTempCanvasCtx.rect(rendererState.cellPositions[c.x] - cellBorderWidth, rendererState.cellPositions[c.y] - cellBorderWidth, squareSize + cellBorderWidth * 2, squareSize + cellBorderWidth * 2)
            }
        })
    }, 'black')

    // Paint selected cages white
    applyColorWithMask(() => {
        for (const cage of selectedCages) {
            for (const c of cage.members) {
                cagesTempCanvasCtx.rect(rendererState.cellPositions[c.x] - cellBorderWidth, rendererState.cellPositions[c.y] - cellBorderWidth, squareSize + cellBorderWidth * 2, squareSize + cellBorderWidth * 2)
            }
        }
    }, 'white')

    // Paint cages with error red or yellow
    if (SettingsHandler.settings.checkMistakes && game.cache.killer__cageErrors.length > 0) {
        applyColorWithMask(() => {
            for (const cage of game.cache.killer__cageErrors) {
                for (const c of cage.members) {
                    cagesTempCanvasCtx.rect(rendererState.cellPositions[c.x] - cellBorderWidth, rendererState.cellPositions[c.y] - cellBorderWidth, squareSize + cellBorderWidth * 2, squareSize + cellBorderWidth * 2)
                }
            }
        }, accentColor === 'red' ? '#ffe173' : '#ff5252')
    }

    cagesTempCanvasCtx.globalCompositeOperation = 'source-over'

    ctx.drawImage(cagesTempCanvas, 0, 0)
}

export function killerInitGameData({ game, data }: InitGameProps) {
    game.difficulty = getDifficulty(data.id[1] as DifficultyIdentifier)
    const [clues, solution] = data.m.split(' ')
    game.clues = decodeMissionString(clues)
    game.mission = data.m
    game.solution = solution
}

export function killerSolveLastInCages(game: Board) {
    if (SettingsHandler.settings.killerAutoSolveLastInCage && game.nSquares > 3) {
        for (const cage of game.cache.killer__cages) {
            let remaining = cage.members.length
            let sum = 0
            cage.members.forEach(coords => {
                const cell = game.get(coords)
                if (cell.value > 0) remaining--
                sum += cell.value
            })
            if (remaining === 1 && cage.sum - sum <= 9) {
                cage.members.forEach(coords => {
                    if (game.get(coords).value === 0) {
                        game.setValue([coords], cage.sum - sum)
                    }
                })
            }
        }
    }
}

export function killerInitCages(game: Board) {
    const [, , cages] = game.mission.split(' ')

    game.cache.killer__cages = []
    for (const cage of cages.split(',')) {
        let newCage: KillerCage = {
            members: [],
            sum: 0
        }
        for (let i = 0; i < cage.length; i += 2) {
            newCage.members.push({ x: Number(cage[i]), y: Number(cage[i + 1]) })
        }
        game.cache.killer__cages.push(newCage)
    }

    for (const cage of game.cache.killer__cages) {
        cage.sum = 0
        cage.members.forEach(c => {
            const cell = game.get(c)
            cell.cache.cage = cage
            cage.sum += cell.cache.solution
        })
    }
}

export function killerGetVisibleCells(game: Board, c: CellCoordinates): CellCoordinates[] {
    let visibleCells = classicGetVisibleCells(game, c)

    for (const coords of game.get(c).cache.cage!.members) {
        if ((coords.x !== c.x || coords.y !== c.y) && indexOf(coords, visibleCells) === -1) visibleCells.push(coords)
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

export function killerCalculateCageVectors({ game, rendererState, squareSize, cageLineWidth, logicalSize, themes, theme }: StateProps) {
    if (!cagesOffScreenCanvasCtx || !cagesTempCanvasCtx) return

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

    function addVector(c1: CellCoordinates, c2: CellCoordinates, cage: KillerCage) {
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

        newCageVectors.push({ firstCell: c1, secondCell: c2, cage, ratio })
    }

    //Horizontal
    for (let y = 0; y < game.nSquares; y++) {
        const top = cageLinePositions[y * 2]
        const bottom = cageLinePositions[y * 2 + 1]

        for (let x = 0; x < game.nSquares; x++) {
            const cell = game.get({ x, y })

            const cageValue = (indexOf({ x, y }, cell.cache.cage!.members) === 0) ? cell.cache.cage!.sum : 0
            const hShift = cageValue > 9 ? Math.ceil(squareSize.current * 0.28) : (cageValue > 0 ? Math.ceil(squareSize.current * 0.15) : 0)

            const left = cageLinePositions[x * 2]
            const right = cageLinePositions[x * 2 + 1]

            //Top line
            if (y === 0 || game.get({ x, y: y - 1 }).cache.cage !== cell.cache.cage) {
                if (startA === null) startA = { x: left + hShift, y: top }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: left + hShift, y: top }, cell.cache.cage!)
                    startA = null
                }
            }

            //Top bridge
            if (!(x === (game.nSquares - 1) || game.get({ x: x + 1, y }).cache.cage !== cell.cache.cage) && x < game.nSquares - 1 && !(y > 0 && game.get({ x: x + 1, y: y - 1 }).cache.cage === cell.cache.cage && game.get({ x, y: y - 1 }).cache.cage === cell.cache.cage)
            ) {
                if (startA === null) startA = { x: right, y: top }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: right, y: top }, cell.cache.cage!)
                    startA = null
                }
            }

            //Bottom line
            if (y === (game.nSquares - 1) || game.get({ x, y: y + 1 }).cache.cage !== cell.cache.cage) {
                if (startB === null) startB = { x: left, y: bottom }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: left + hShift, y: bottom }, cell.cache.cage!)
                    startB = null
                }
            }

            //Bottom bridge
            if (!(x === (game.nSquares - 1) || game.get({ x: x + 1, y }).cache.cage !== cell.cache.cage) && x < game.nSquares - 1 && !(y < (game.nSquares - 1) && game.get({ x: x + 1, y: y + 1 }).cache.cage === cell.cache.cage && game.get({ x, y: y + 1 }).cache.cage === cell.cache.cage)) {
                if (startB === null) startB = { x: right, y: bottom }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: right, y: bottom }, cell.cache.cage!)
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
            const cell = game.get({ x, y })

            const cageValue = (indexOf({ x, y }, cell.cache.cage!.members) === 0) ? cell.cache.cage!.sum : 0
            const vShift = cageValue! > 0 ? Math.ceil(squareSize.current * 0.20) : 0

            const top = cageLinePositions[y * 2]
            const bottom = cageLinePositions[y * 2 + 1]

            //Left line
            if (x === 0 || game.get({ x: x - 1, y }).cache.cage !== cell.cache.cage) {
                if (startA === null) startA = { x: left, y: top + vShift }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: left, y: top + vShift }, cell.cache.cage!)
                    startA = null
                }
            }

            //Left bridge
            if (!(y === (game.nSquares - 1) || game.get({ x, y: y + 1 }).cache.cage !== cell.cache.cage) && !(x > 0 && game.get({ x: x - 1, y }).cache.cage === cell.cache.cage && game.get({ x: x - 1, y: y + 1 }).cache.cage === cell.cache.cage)) {
                if (startA === null) startA = { x: left, y: bottom }
            } else {
                if (startA !== null) {
                    addVector(startA, { x: left, y: bottom }, cell.cache.cage!)
                    startA = null
                }
            }

            //Right line
            if (x === (game.nSquares - 1) || game.get({ x: x + 1, y }).cache.cage !== cell.cache.cage) {
                if (startB === null) startB = { x: right, y: top }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: right, y: top }, cell.cache.cage!)
                    startB = null
                }
            }

            //Right bridge
            if (!(y === (game.nSquares - 1) || game.get({ x, y: y + 1 }).cache.cage !== cell.cache.cage) && !(x < (game.nSquares - 1) && game.get({ x: x + 1, y }).cache.cage === cell.cache.cage && game.get({ x: x + 1, y: y + 1 }).cache.cage === cell.cache.cage)) {
                if (startB === null) startB = { x: right, y: bottom }
            } else {
                if (startB !== null) {
                    addVector(startB, { x: right, y: bottom }, cell.cache.cage!)
                    startB = null
                }
            }
        }
    }

    cagesOffscreenCanvas.width = logicalSize.current
    cagesOffscreenCanvas.height = logicalSize.current
    cagesTempCanvas.width = logicalSize.current
    cagesTempCanvas.height = logicalSize.current

    cagesOffScreenCanvasCtx.clearRect(0, 0, logicalSize.current, logicalSize.current)
    cagesOffScreenCanvasCtx.fillStyle = cagesOffScreenCanvasCtx.strokeStyle = themes[theme].canvasKillerCageColor

    //Border
    newCageVectors.forEach((vector: CageVector) => {
        dashedLine(cagesOffScreenCanvasCtx, vector.firstCell, vector.secondCell, vector.ratio, cageLineWidth)
    })

    game.cache.killer__cages.forEach(cage => {
        drawSVGNumber(cagesOffScreenCanvasCtx, cage.sum, rendererState.current.cellPositions[cage.members[0].x] + rendererState.current.cagePadding, rendererState.current.cellPositions[cage.members[0].y] + rendererState.current.cagePadding + squareSize.current * 0.08, squareSize.current * 0.15, 'right', 'center', null)
    })
}

export function killerCheckErrors(game: Board) {
    game.cache.killer__cageErrors = []

    for (const cage of game.cache.killer__cages) {
        let sum = 0
        for (const coords of cage.members) {
            const cell = game.get(coords)
            if (cell.value > 0) sum += cell.value
            else {
                sum = -1
                break
            }
        }
        if (sum !== -1 && sum !== cage.sum) {
            game.cache.killer__cageErrors.push(cage)
        }
    }
}
