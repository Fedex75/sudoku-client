import { Cell, InitGameProps, RendererProps, StateProps, Thermometer } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { getDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"
import { classicGetVisibleCells } from "./Classic"

const thermosOffscreenCanvas = document.createElement('canvas')
const thermosOffScreenCanvasCtx = thermosOffscreenCanvas.getContext('2d')
const thermosTempCanvas = document.createElement('canvas')
const thermosTempCanvasCtx = thermosTempCanvas.getContext('2d')

export function thermoInitGameData({ game, data }: InitGameProps) {
    game.difficulty = getDifficulty(data.id[1] as DifficultyIdentifier)
    const [clues] = data.m.split(' ')
    game.clues = decodeMissionString(clues)
    game.mission = data.m
    game.solution = ''
}

export function thermoInitThermometerData(game: Board) {
    const [, thermometers] = game.mission.split(' ')

    game.cache.thermo__thermometers = []
    for (const thermometer of thermometers.split(';')) {
        const newThermometer: Thermometer = {
            members: [],
            error: false
        }
        for (const cellIndex of thermometer.split(',').map(s => Number.parseInt(s))) {
            const y = Math.floor(cellIndex / game.nSquares)
            const x = cellIndex - y * game.nSquares
            newThermometer.members.push(game.get({ x, y }))
            game.get({ x, y }).cache.thermometer = newThermometer
        }
        game.cache.thermo__thermometers.push(newThermometer)
    }
}

export function thermoGetVisibleCells(game: Board, cell: Cell) {
    let visibleCells = classicGetVisibleCells(game, cell)

    if (cell.cache.thermometer) {
        for (const tc of cell.cache.thermometer.members) {
            if ((tc.cache.coords.x !== cell.cache.coords.x || tc.cache.coords.y !== cell.cache.coords.y) && !visibleCells.includes(tc)) visibleCells.push(tc)
        }
    }

    return visibleCells
}

export function thermoDetectErrors(game: Board) {
    for (const thermo of game.cache.thermo__thermometers) {
        let currentMaxValue = 0
        thermo.error = false
        for (const cell of thermo.members) {
            if (cell.value > 0) {
                if (cell.value < currentMaxValue) {
                    thermo.error = true
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
        thermosOffScreenCanvasCtx.arc(rendererState.current.cellPositions[thermo.members[0].cache.coords.x] + squareSize.current / 2, rendererState.current.cellPositions[thermo.members[0].cache.coords.y] + squareSize.current / 2, squareSize.current * THERMOMETER_WIDTH_FACTOR, 0, Math.PI * 2)
        thermosOffScreenCanvasCtx.fill()

        for (let i = 1; i < thermo.members.length; i++) {
            thermosOffScreenCanvasCtx.beginPath()
            thermosOffScreenCanvasCtx.moveTo(rendererState.current.cellPositions[thermo.members[i - 1].cache.coords.x] + squareSize.current / 2, rendererState.current.cellPositions[thermo.members[i - 1].cache.coords.y] + squareSize.current / 2)
            thermosOffScreenCanvasCtx.lineTo(rendererState.current.cellPositions[thermo.members[i].cache.coords.x] + squareSize.current / 2, rendererState.current.cellPositions[thermo.members[i].cache.coords.y] + squareSize.current / 2)
            thermosOffScreenCanvasCtx.stroke()

            thermosOffScreenCanvasCtx.beginPath()
            thermosOffScreenCanvasCtx.arc(rendererState.current.cellPositions[thermo.members[i].cache.coords.x] + squareSize.current / 2, rendererState.current.cellPositions[thermo.members[i].cache.coords.y] + squareSize.current / 2, squareSize.current * THERMOMETER_WIDTH_FACTOR / 2, 0, Math.PI * 2)
            thermosOffScreenCanvasCtx.fill()
        }
    }
}

export function thermoRenderThermometers({ ctx, game, squareSize, rendererState, logicalSize, cellBorderWidth, theme, accentColor }: RendererProps) {
    if (!thermosOffScreenCanvasCtx || !thermosTempCanvasCtx) return

    thermosTempCanvasCtx.clearRect(0, 0, logicalSize, logicalSize)
    thermosTempCanvasCtx.drawImage(thermosOffscreenCanvas, 0, 0)

    let selectedThermometers: Thermometer[] = []
    for (const cell of game.selectedCells) {
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
            for (const c of thermo.members) {
                thermosTempCanvasCtx.rect(rendererState.cellPositions[c.cache.coords.x] - cellBorderWidth, rendererState.cellPositions[c.cache.coords.y] - cellBorderWidth, squareSize + cellBorderWidth * 2, squareSize + cellBorderWidth * 2)
            }
        }
    }, theme === 'dark' ? '#777' : '#888')

    // Paint thermometers with errors red
    if (SettingsHandler.settings.checkMistakes) {
        applyColorWithMask(() => {
            for (const thermo of game.cache.thermo__thermometers) {
                if (thermo.error) {
                    for (const c of thermo.members) {
                        thermosTempCanvasCtx.rect(rendererState.cellPositions[c.cache.coords.x] - cellBorderWidth, rendererState.cellPositions[c.cache.coords.y] - cellBorderWidth, squareSize + cellBorderWidth * 2, squareSize + cellBorderWidth * 2)
                    }
                }
            }
        }, accentColor === 'red' ? '#ffe173' : '#ff5252')
    }

    thermosTempCanvasCtx.globalCompositeOperation = 'source-over'

    ctx.globalAlpha = 0.5
    ctx.drawImage(thermosTempCanvas, 0, 0)
    ctx.globalAlpha = 1
}

export function thermoCalculatePossibleValues(game: Board) {
    for (const thermo of game.cache.thermo__thermometers) {
        for (let i = 0; i < thermo.members.length; i++) {
            const cell = thermo.members[i]
            if (cell.value > 0) {
                for (let j = i + 1; j < thermo.members.length; j++) {
                    const cell2 = thermo.members[j]
                    cell2.cache.possibleValues = cell2.cache.possibleValues.filter(n => n > cell.value)
                    if (SettingsHandler.settings.showPossibleValues) {
                        for (let n = cell.value; n > 0; n--) game.setNote(n, [thermo.members[j]], false)
                    }
                }

                for (let j = i - 1; j >= 0; j--) {
                    const cell2 = thermo.members[j]
                    cell2.cache.possibleValues = cell2.cache.possibleValues.filter(n => n < cell.value)
                    if (SettingsHandler.settings.showPossibleValues) {
                        for (let n = cell.value; n < game.nSquares; n++) game.setNote(n, [thermo.members[j]], false)
                    }
                }
            }
        }
    }
}
