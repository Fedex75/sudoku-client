import { indexOfCoordsInArray } from "../../utils/CoordsUtils"
import { Cell, CellCoordinates, InitGameProps, RendererProps, StateProps } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { decodeDifficulty, DifficultyIdentifier } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Solver from "../../utils/Solver"
import Board from "../Board"

export function classicRenderBackground({ ctx, themes, theme, logicalSize }: RendererProps) {
    //Board background
    ctx.fillStyle = themes[theme].canvasCellBorderColor
    ctx.fillRect(0, 0, logicalSize, logicalSize)
}

export function classicRenderCellBackground({ ctx, game, lockedInput, notPlayable, colors, darkColors, highlightedCells, selectedCellsValues, squareSize, animationColors, currentAnimations, rendererState }: RendererProps) {
    game.iterateAllCells((cell, { x, y }) => {
        const hasSameValueAsSelected = ((lockedInput > 0 && lockedInput === cell.value) || (lockedInput === 0 && selectedCellsValues.length > 0 && selectedCellsValues.includes(cell.value)))

        //Background
        ctx.fillStyle =
            notPlayable ? colors.default :
                (hasSameValueAsSelected || highlightedCells[x][y]) ? darkColors[cell.color] : //Cell has same value as selected cell or is in same row or column as any cell with the same value as the selected cell
                    (colors[cell.color]) //Cell color

        ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y], squareSize, squareSize)

        if (animationColors && animationColors[x][y] && currentAnimations.length > 0 && currentAnimations[0].data.type !== 'fadein' && currentAnimations[0].data.type !== 'fadeout' && currentAnimations[0].data.type !== 'fadein_long') {
            ctx.fillStyle = animationColors[x][y]
            ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y], squareSize, squareSize)
        }
    })
}

export function classicRenderSelection({ ctx, accentColor, colors, game, squareSize, colorBorderLineWidth, boxBorderWidth, rendererState }: RendererProps) {
    //Selection
    for (const c of game.selectedCells) {
        ctx.fillStyle = ctx.strokeStyle = colors[accentColor]

        const padding = 0
        const left = rendererState.cellPositions[c.x] + padding
        const right = rendererState.cellPositions[c.x] + squareSize - padding - colorBorderLineWidth
        const top = rendererState.cellPositions[c.y] + padding
        const bottom = rendererState.cellPositions[c.y] + squareSize - padding - colorBorderLineWidth

        const lineLength = squareSize - padding * 2

        //Top
        if (c.y === 0 || (indexOfCoordsInArray(game.selectedCells, { x: c.x, y: c.y - 1 }) === -1)) ctx.fillRect(left, top, lineLength, colorBorderLineWidth)

        //Right
        if (c.x === (game.nSquares - 1) || (indexOfCoordsInArray(game.selectedCells, { x: c.x + 1, y: c.y }) === -1)) ctx.fillRect(right, top, colorBorderLineWidth, lineLength)
        else {
            //Right bridges
            if (!(c.y > 0 && (indexOfCoordsInArray(game.selectedCells, { x: c.x + 1, y: c.y - 1 }) >= 0) && (indexOfCoordsInArray(game.selectedCells, { x: c.x, y: c.y - 1 }) >= 0))) ctx.fillRect(right, top, padding * 2 + boxBorderWidth, colorBorderLineWidth)
            if (!(c.y < (game.nSquares - 1) && (indexOfCoordsInArray(game.selectedCells, { x: c.x + 1, y: c.y + 1 }) >= 0) && (indexOfCoordsInArray(game.selectedCells, { x: c.x, y: c.y + 1 }) >= 0))) ctx.fillRect(right, bottom, padding * 2 + boxBorderWidth, colorBorderLineWidth)
        }

        //Bottom
        if (c.y === (game.nSquares - 1) || (indexOfCoordsInArray(game.selectedCells, { x: c.x, y: c.y + 1 }) === -1)) ctx.fillRect(left, bottom, lineLength, colorBorderLineWidth)
        else {
            //Bottom bridges
            if (!(c.x > 0 && (indexOfCoordsInArray(game.selectedCells, { x: c.x - 1, y: c.y }) >= 0) && (indexOfCoordsInArray(game.selectedCells, { x: c.x - 1, y: c.y + 1 }) >= 0))) ctx.fillRect(left, bottom, colorBorderLineWidth, padding * 2 + boxBorderWidth)
            if (!(c.x < (game.nSquares - 1) && (indexOfCoordsInArray(game.selectedCells, { x: c.x + 1, y: c.y }) >= 0) && (indexOfCoordsInArray(game.selectedCells, { x: c.x + 1, y: c.y + 1 }) >= 0))) ctx.fillRect(right, bottom, colorBorderLineWidth, padding * 2 + boxBorderWidth)
        }

        //Left
        if (c.x === 0 || (indexOfCoordsInArray(game.selectedCells, { x: c.x - 1, y: c.y }) === -1)) ctx.fillRect(left, top, colorBorderLineWidth, lineLength)
    }
}

export function classicRenderLinks({ ctx, game, showLinks, lockedInput, selectedCellsValues, accentColor, linksLineWidth, squareSize, rendererState }: RendererProps) {
    //Links
    if (showLinks && (lockedInput > 0 || selectedCellsValues.length === 1)) {
        const target = lockedInput > 0 ? lockedInput : selectedCellsValues[0]
        let links = game.calculateLinks(target)
        ctx.fillStyle = ctx.strokeStyle = accentColor === 'red' ? '#c298eb' : '#ff5252'
        ctx.lineWidth = linksLineWidth
        links.forEach(link => {
            const noteDelta = rendererState.noteDeltas[target - 1]
            link.forEach(cell => {
                ctx.beginPath()
                ctx.arc(rendererState.cellPositions[cell.x] + noteDelta.x, rendererState.cellPositions[cell.y] + noteDelta.y, squareSize / 8, 0, 2 * Math.PI, false)
                ctx.fill()
            })
            if (link.length === 2) {
                ctx.beginPath()
                ctx.moveTo(rendererState.cellPositions[link[0].x] + noteDelta.x, rendererState.cellPositions[link[0].y] + noteDelta.y)
                ctx.lineTo(rendererState.cellPositions[link[1].x] + noteDelta.x, rendererState.cellPositions[link[1].y] + noteDelta.y)
                ctx.stroke()
            }
        })
    }
}

export function classicRenderFadeAnimations({ ctx, game, animationColors, animationGammas, currentAnimations, squareSize, themes, theme, boxBorderWidth, cellBorderWidth, rendererState }: RendererProps) {
    //Fade animations
    if (animationColors && animationGammas && ['fadein', 'fadein_long', 'fadeout'].includes(currentAnimations[0]?.data.type)) {
        game.iterateAllCells((cell, { x, y }) => {
            ctx.fillStyle = animationColors[x][y]
            ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y], squareSize, squareSize)

            //Right border
            ctx.fillStyle = `rgba(${x % 3 === 2 ? themes[theme].canvasBoxBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas[y]})`
            ctx.fillRect(rendererState.cellPositions[x] + squareSize, rendererState.cellPositions[y], x % 3 === 2 ? boxBorderWidth : cellBorderWidth, squareSize)

            //Bottom border
            ctx.fillStyle = `rgba(${y % 3 === 2 ? themes[theme].canvasBoxBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas[y]})`
            ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y] + squareSize, squareSize, y % 3 === 2 ? boxBorderWidth : cellBorderWidth)
        })
    }
}

export function classicRenderPaused({ ctx, game, darkColors, squareSize, rendererState }: RendererProps) {
    //Paused
    game.iterateAllCells((cell, { x, y }) => {
        ctx.strokeStyle = ctx.fillStyle = darkColors.default
        ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y], squareSize, squareSize)
    })
}

export function classicRenderBorders({ ctx, game, themes, theme, boxBorderWidth, logicalSize, squareSize, rendererState }: RendererProps) {
    //Borders
    if (theme === 'light') {
        ctx.fillStyle = themes[theme].canvasBoxBorderColor
        ctx.fillRect(0, 0, boxBorderWidth, logicalSize)
        ctx.fillRect(0, 0, logicalSize, boxBorderWidth)
        for (let i = 2; i < game.nSquares; i += 3) {
            ctx.fillRect(rendererState.cellPositions[i] + squareSize, 0, boxBorderWidth, logicalSize)
            ctx.fillRect(0, rendererState.cellPositions[i] + squareSize, logicalSize, boxBorderWidth)
        }
    } else if (SettingsHandler.settings.highContrastGrid) {
        ctx.fillStyle = 'white'
        for (let i = 2; i < game.nSquares - 1; i += 3) {
            ctx.fillRect(rendererState.cellPositions[i] + squareSize, boxBorderWidth, boxBorderWidth, logicalSize - boxBorderWidth * 2)
            ctx.fillRect(boxBorderWidth, rendererState.cellPositions[i] + squareSize, logicalSize - boxBorderWidth * 2, boxBorderWidth)
        }
    }
}

export function classicInitGameData({ game, data }: InitGameProps) {
    game.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier)
    game.clues = decodeMissionString(data.m)
    game.mission = data.m
    game.solution = Solver.solve(game.clues)
}

export function classicGetBoxCellsCoordinates(c: CellCoordinates): CellCoordinates[] {
    let boxCells = []
    const boxX = Math.floor(c.x / 3)
    const boxY = Math.floor(c.y / 3)
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) boxCells.push({ x: boxX * 3 + x, y: boxY * 3 + y })
    return boxCells
}

export function classicGetVisibleCells(game: Board, c: CellCoordinates): CellCoordinates[] {
    let visibleCells: CellCoordinates[] = []
    const boxX = Math.floor(c.x / 3)
    const boxY = Math.floor(c.y / 3)
    visibleCells = visibleCells.concat(game.ruleset.game.getBoxCellsCoordinates(c))
    for (let i = 0; i < game.nSquares; i++) {
        if (i < boxX * 3 || i >= boxX * 3 + 3) visibleCells.push({ x: i, y: c.y })
        if (i < boxY * 3 || i >= boxY * 3 + 3) visibleCells.push({ x: c.x, y: i })
    }
    return visibleCells
}

export function classicCheckRowAnimation(game: Board, c: CellCoordinates) {
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: i, y: c.y }).value === 0) return []
    }
    game.animations.push({ type: 'row', center: c })
}

export function classicCheckColumnAnimation(game: Board, c: CellCoordinates) {
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: c.x, y: i }).value === 0) return []
    }
    game.animations.push({ type: 'col', center: c })
}

export function classicCheckBoxAnimation(game: Board, c: CellCoordinates) {
    for (const cell of game.ruleset.game.getBoxCellsCoordinates(c)) {
        if (game.get(cell).value === 0) return []
    }
    game.animations.push({ type: 'box', boxX: Math.floor(c.x / 3), boxY: Math.floor(c.y / 3) })
}

export function classicGetBoxes(game: Board): CellCoordinates[][] {
    let boxes = []
    for (let boxX = 0; boxX < 3; boxX++) {
        for (let boxY = 0; boxY < 3; boxY++) {
            let box = []
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    box.push({ x: boxX * 3 + x, y: boxY * 3 + y })
                }
            }
            boxes.push(box)
        }
    }
    return boxes
}

export function classicResize({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth }: StateProps) {
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

    const notePaddingH = squareSize.current * 0.2
    const notePaddingTop = squareSize.current * 0.17
    const notePaddingBottom = squareSize.current * 0.17

    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) newNoteDeltas.push({ x: notePaddingH + x * (squareSize.current - 2 * notePaddingH) / 2, y: notePaddingTop + y * (squareSize.current - notePaddingTop - notePaddingBottom) / 2 })

    rendererState.current.noteDeltas = newNoteDeltas
    rendererState.current.cellPositions = newCellPositions
    rendererState.current.valuePositions = newValuePositions
}

export function classicScreenCoordsToBoardCoords(clickX: number, clickY: number, { game, rendererState, squareSize }: StateProps): CellCoordinates | undefined {
    for (let x = 0; x < game.nSquares; x++) {
        if (clickX <= rendererState.current.cellPositions[x] + squareSize.current) {
            for (let y = 0; y < game.nSquares; y++) {
                if (clickY <= rendererState.current.cellPositions[y] + squareSize.current) return { x, y }
            }
        }
    }
    return undefined
}

export function classicCalculatePossibleValues(game: Board) {
    for (let x = 0; x <= game.nSquares - 1; x++) {
        for (let y = 0; y <= game.nSquares - 1; y++) {
            const cell = game.get({ x, y })
            cell.possibleValues = []
            for (let k = 1; k <= game.nSquares; k++) {
                cell.possibleValues.push(k)
            }
        }
    }

    for (let x = 0; x <= game.nSquares - 1; x++) {
        for (let y = 0; y <= game.nSquares - 1; y++) {
            const cell = game.get({ x, y })
            for (const c of game.ruleset.game.getVisibleCells(game, { x, y })) {
                game.get(c).possibleValues = game.get(c).possibleValues.filter(n => n !== cell.value)
                if (SettingsHandler.settings.showPossibleValues) game.setNote([c], cell.value, false)
            }
        }
    }

    if (SettingsHandler.settings.lockCellsWithColor) {
        game.iterateAllCells(cell => {
            if (cell.color !== 'default') {
                cell.possibleValues = [...cell.notes]
            }
        })

        for (let cgi = 0; cgi < game.colorGroups.length; cgi++) {
            const cg = game.colorGroups[cgi]
            let notes: number[] = game.get(cg.cells[0]).notes
            let unsolvedCount = (game.get(cg.cells[0]).value === 0 ? 1 : 0)
            for (let i = 1; i < cg.cells.length; i++) {
                notes = notes.concat(game.get(cg.cells[i]).notes)
                if (game.get(cg.cells[i]).value === 0) unsolvedCount++
            }

            const uniqueNotes = new Set(notes)

            if (uniqueNotes.size === unsolvedCount) {
                // Remove possible values and notes from all the visible cells not in the group
                for (const vc of cg.visibleCells) {
                    if (game.get(vc).colorGroupIndex !== cgi) {
                        game.get(vc).possibleValues = game.get(vc).possibleValues.filter(pv => !notes.includes(pv))
                        if (SettingsHandler.settings.showPossibleValues) for (const note of notes) game.setNote([vc], note, false)
                    }
                }
            }
        }
    }

    return []
}

export function classicIterateAllCells(game: Board, func: (cell: Cell, coords: CellCoordinates, exit: () => void) => void) {
    let shouldBreak = false
    const setShouldBreakTrue = () => { shouldBreak = true }
    for (let x = 0; x < game.nSquares; x++) {
        for (let y = 0; y < game.nSquares; y++) {
            func(game.get({ x, y }), { x, y }, setShouldBreakTrue)
            if (shouldBreak) return
        }
    }
}

export function classicGetCellUnits(game: Board, coords: CellCoordinates) {
    let units: CellCoordinates[][] = []

    // Row
    let row: CellCoordinates[] = []
    for (let x = 0; x < game.nSquares; x++) row.push({ x, y: coords.y })
    units.push(row)

    // Col
    let col: CellCoordinates[] = []
    for (let y = 0; y < game.nSquares; y++) col.push({ x: coords.x, y })
    units.push(col)

    // Box
    let box: CellCoordinates[] = []
    const x0 = Math.floor(coords.x / 3) * 3
    const y0 = Math.floor(coords.y / 3) * 3
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            box.push({ x: x0 + x, y: y0 + y })
        }
    }
    units.push(box)

    return units
}

export function classicGetAllUnits(game: Board): CellCoordinates[][] {
    let units: CellCoordinates[][] = []
    let currentUnit: CellCoordinates[] = []
    for (let row = 0; row < game.nSquares; row++) {
        currentUnit = []
        for (let y = 0; y < game.nSquares; y++) {
            currentUnit.push({ x: row, y })
        }
        units.push([...currentUnit])
    }

    currentUnit = []
    for (let col = 0; col < game.nSquares; col++) {
        currentUnit = []
        for (let x = 0; x < game.nSquares; x++) {
            currentUnit.push({ x, y: col })
        }
        units.push([...currentUnit])
    }

    units = units.concat(classicGetBoxes(game))

    return units
}
