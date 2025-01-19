import { CellCoordinates, InitGameProps, RendererProps, StateProps, Thermometer } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { getDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import { indexOf } from "../../utils/Utils"
import Board from "../Board"
import { classicGetVisibleCells } from "./Classic"
import { commonDetectErrorsByVisibility } from "./Common"

const thermosOffscreenCanvas = document.createElement('canvas')
const thermosOffScreenCanvasCtx = thermosOffscreenCanvas.getContext('2d')
const thermosTempCanvas = document.createElement('canvas')
const thermosTempCanvasCtx = thermosTempCanvas.getContext('2d')

export function thermoInitGameData({ game, data }: InitGameProps) {
    console.log(game.id)
    game.difficulty = getDifficulty(data.id[1] as DifficultyIdentifier)
    const [clues] = data.m.split(' ')
    game.clues = decodeMissionString(clues)
    game.mission = data.m
    game.solution = '000000000000000000000000000000000000000000000000000000000000000000000000000000000'
}

export function thermoInitThermometerData(game: Board) {
    const [, thermometers] = game.mission.split(' ')

    game.cache.thermo__thermometers = []
    for (const thermometer of thermometers.split(';')) {
        const newThermometer: Thermometer = []
        for (const cellIndex of thermometer.split(',').map(s => Number.parseInt(s))) {
            const y = Math.floor(cellIndex / game.nSquares)
            const x = cellIndex - y * game.nSquares
            newThermometer.push({ x, y })
            game.get({ x, y }).cache.thermometer = newThermometer
        }
        game.cache.thermo__thermometers.push(newThermometer)
    }
}

export function thermoGetVisibleCells(game: Board, coords: CellCoordinates) {
    const cell = game.get(coords)
    let visibleCells = classicGetVisibleCells(game, coords)

    if (cell.cache.thermometer) {
        for (const c of cell.cache.thermometer) {
            if ((c.x !== coords.x || c.y !== coords.y) && indexOf(c, visibleCells) === -1) visibleCells.push(c)
        }
    }

    return visibleCells
}

export function thermoDetectErrors(game: Board) {
    commonDetectErrorsByVisibility(game)

    for (const thermo of game.cache.thermo__thermometers) {
        let currentMaxValue = 0
        for (const coords of thermo) {
            const cell = game.get(coords)
            if (cell.value > 0) {
                if (cell.value < currentMaxValue) {
                    cell.cache.isError = true
                } else {
                    currentMaxValue = cell.value
                }
            }
        }
    }
}

export function thermoRenderThermometersToOffscreenCanvas({ game, squareSize, rendererState, logicalSize, theme }: StateProps) {
    if (!thermosOffScreenCanvasCtx) return

    thermosOffscreenCanvas.width = logicalSize.current
    thermosOffscreenCanvas.height = logicalSize.current
    thermosTempCanvas.width = logicalSize.current
    thermosTempCanvas.height = logicalSize.current

    const THERMOMETER_WIDTH_FACTOR = 0.3

    thermosOffScreenCanvasCtx.clearRect(0, 0, logicalSize.current, logicalSize.current)

    thermosOffScreenCanvasCtx.globalAlpha = 1
    thermosOffScreenCanvasCtx.fillStyle = thermosOffScreenCanvasCtx.strokeStyle = theme === 'dark' ? '#555' : '#aaa'
    thermosOffScreenCanvasCtx.lineWidth = squareSize.current * THERMOMETER_WIDTH_FACTOR
    for (const thermo of game.cache.thermo__thermometers) {
        thermosOffScreenCanvasCtx.beginPath()
        thermosOffScreenCanvasCtx.arc(rendererState.current.cellPositions[thermo[0].x] + squareSize.current / 2, rendererState.current.cellPositions[thermo[0].y] + squareSize.current / 2, squareSize.current * THERMOMETER_WIDTH_FACTOR, 0, Math.PI * 2)
        thermosOffScreenCanvasCtx.fill()

        for (let i = 1; i < thermo.length; i++) {
            thermosOffScreenCanvasCtx.beginPath()
            thermosOffScreenCanvasCtx.moveTo(rendererState.current.cellPositions[thermo[i - 1].x] + squareSize.current / 2, rendererState.current.cellPositions[thermo[i - 1].y] + squareSize.current / 2)
            thermosOffScreenCanvasCtx.lineTo(rendererState.current.cellPositions[thermo[i].x] + squareSize.current / 2, rendererState.current.cellPositions[thermo[i].y] + squareSize.current / 2)
            thermosOffScreenCanvasCtx.stroke()

            thermosOffScreenCanvasCtx.beginPath()
            thermosOffScreenCanvasCtx.arc(rendererState.current.cellPositions[thermo[i].x] + squareSize.current / 2, rendererState.current.cellPositions[thermo[i].y] + squareSize.current / 2, squareSize.current * THERMOMETER_WIDTH_FACTOR / 2, 0, Math.PI * 2)
            thermosOffScreenCanvasCtx.fill()
        }
    }
}

export function thermoRenderThermometers({ ctx, game, squareSize, rendererState, logicalSize, cellBorderWidth, theme }: RendererProps) {
    if (!thermosOffScreenCanvasCtx || !thermosTempCanvasCtx) return

    thermosTempCanvasCtx.clearRect(0, 0, logicalSize, logicalSize)
    thermosTempCanvasCtx.drawImage(thermosOffscreenCanvas, 0, 0)

    let selectedThermometers: Thermometer[] = []
    for (const c of game.selectedCells) {
        const cell = game.get(c)
        if (cell.cache.thermometer && !selectedThermometers.includes(cell.cache.thermometer)) selectedThermometers.push(cell.cache.thermometer)
    }

    thermosTempCanvasCtx.globalCompositeOperation = 'source-in'

    function applyColorWithMask(createMask: () => void, color: string) {
        if (!thermosTempCanvasCtx) return

        thermosTempCanvasCtx.save()
        thermosTempCanvasCtx.beginPath()
        createMask()
        thermosTempCanvasCtx.clip()
        thermosTempCanvasCtx.fillStyle = color
        thermosTempCanvasCtx.fillRect(0, 0, logicalSize, logicalSize)
        thermosTempCanvasCtx.restore()
    }

    // Paint selected thermometers white
    applyColorWithMask(() => {
        for (const thermo of selectedThermometers) {
            for (const c of thermo) {
                thermosTempCanvasCtx.rect(rendererState.cellPositions[c.x] - cellBorderWidth, rendererState.cellPositions[c.y] - cellBorderWidth, squareSize + cellBorderWidth * 2, squareSize + cellBorderWidth * 2)
            }
        }
    }, theme === 'dark' ? '#777' : '#888')

    thermosTempCanvasCtx.globalCompositeOperation = 'source-over'

    ctx.globalAlpha = 0.5
    ctx.drawImage(thermosTempCanvas, 0, 0)
    ctx.globalAlpha = 1
}

export function thermoCalculatePossibleValues(game: Board) {
    for (const thermo of game.cache.thermo__thermometers) {
        for (let i = 0; i < thermo.length; i++) {
            const cell = game.get(thermo[i])
            if (cell.value > 0) {
                for (let j = i + 1; j < thermo.length; j++) {
                    game.get(thermo[j]).cache.possibleValues = game.get(thermo[j]).cache.possibleValues.filter(n => n > cell.value)
                    if (SettingsHandler.settings.showPossibleValues) {
                        for (let n = cell.value; n > 0; n--) game.setNote(n, [thermo[j]], false)
                    }
                }

                for (let j = i - 1; j >= 0; j--) {
                    game.get(thermo[j]).cache.possibleValues = game.get(thermo[j]).cache.possibleValues.filter(n => n < cell.value)
                    if (SettingsHandler.settings.showPossibleValues) {
                        for (let n = cell.value; n < game.nSquares; n++) game.setNote(n, [thermo[j]], false)
                    }
                }
            }
        }
    }
}
