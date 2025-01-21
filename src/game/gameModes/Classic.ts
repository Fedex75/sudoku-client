import brightness from "../../utils/Utils"
import { Cell, CellCoordinates, InitGameProps, RendererProps, StateProps } from "../../utils/DataTypes"
import { decodeMissionString } from "../../utils/Decoder"
import { DifficultyIdentifier, getDifficulty } from "../../utils/Difficulties"
import SettingsHandler from "../../utils/SettingsHandler"
import Solver from "../../utils/Solver"
import Board from "../Board"

export function classicRenderBackground({ ctx, themes, theme, logicalSize }: RendererProps) {
    //Board background
    ctx.fillStyle = themes[theme].canvasCellBorderColor
    ctx.fillRect(0, 0, logicalSize, logicalSize)
}

export function classicRenderCellBackground({ ctx, game, lockedInput, notPlayable, colors, darkColors, selectedCellsValues, squareSize, currentAnimations, animationColors, rendererState }: RendererProps) {
    game.iterateAllCells(cell => {
        const hasSameValueAsSelected = ((lockedInput > 0 && lockedInput === cell.value) || (lockedInput === 0 && selectedCellsValues.length > 0 && selectedCellsValues.includes(cell.value)))

        //Background
        ctx.fillStyle =
            notPlayable ? colors.default :
                (hasSameValueAsSelected || cell.cache.highlighted) ? darkColors[cell.color] : //Cell has same value as selected cell or is in same row or column as any cell with the same value as the selected cell
                    (colors[cell.color]) //Cell color

        ctx.fillRect(rendererState.cellPositions[cell.cache.coords.x], rendererState.cellPositions[cell.cache.coords.y], squareSize, squareSize)

        if (animationColors && animationColors[cell.cache.coords.x][cell.cache.coords.y] && currentAnimations.length > 0 && currentAnimations[0].type !== 'fadein' && currentAnimations[0].type !== 'fadeout' && currentAnimations[0].type !== 'fadein') {
            ctx.fillStyle = animationColors[cell.cache.coords.x][cell.cache.coords.y]
            ctx.fillRect(rendererState.cellPositions[cell.cache.coords.x], rendererState.cellPositions[cell.cache.coords.y], squareSize, squareSize)
        }
    })
}

export function classicRenderSelection({ ctx, accentColor, colors, game, squareSize, colorBorderLineWidth, rendererState }: RendererProps) {
    //Selection
    for (const cell of game.selectedCells) {
        ctx.fillStyle = ctx.strokeStyle = colors[accentColor]

        const left = rendererState.cellPositions[cell.cache.coords.x]
        const right = rendererState.cellPositions[cell.cache.coords.x] + squareSize - colorBorderLineWidth
        const top = rendererState.cellPositions[cell.cache.coords.y]
        const bottom = rendererState.cellPositions[cell.cache.coords.y] + squareSize - colorBorderLineWidth

        const lineLength = squareSize

        const topCellIsSelected = cell.cache.coords.y > 0 && game.selectedCells.includes(game.get({ x: cell.cache.coords.x, y: cell.cache.coords.y - 1 }))
        const rightCellIsSelected = cell.cache.coords.x < (game.nSquares - 1) && game.selectedCells.includes(game.get({ x: cell.cache.coords.x + 1, y: cell.cache.coords.y }))
        const topRightCellIsSelected = cell.cache.coords.y > 0 && cell.cache.coords.x < (game.nSquares - 1) && game.selectedCells.includes(game.get({ x: cell.cache.coords.x + 1, y: cell.cache.coords.y - 1 }))
        const bottomRightCellIsSelected = cell.cache.coords.y < (game.nSquares - 1) && cell.cache.coords.x < (game.nSquares - 1) && game.selectedCells.includes(game.get({ x: cell.cache.coords.x + 1, y: cell.cache.coords.y + 1 }))
        const bottomCellIsSelected = cell.cache.coords.y < (game.nSquares - 1) && game.selectedCells.includes(game.get({ x: cell.cache.coords.x, y: cell.cache.coords.y + 1 }))
        const leftCellIsSelected = cell.cache.coords.x > 0 && game.selectedCells.includes(game.get({ x: cell.cache.coords.x - 1, y: cell.cache.coords.y }))
        const bottomLeftCellIsSelected = cell.cache.coords.x > 0 && cell.cache.coords.y < (game.nSquares - 1) && game.selectedCells.includes(game.get({ x: cell.cache.coords.x - 1, y: cell.cache.coords.y + 1 }))

        const rightCellLeft = cell.cache.coords.x < (game.nSquares - 1) ? rendererState.cellPositions[cell.cache.coords.x + 1][cell.cache.coords.y] : 0
        const bottomCellTop = cell.cache.coords.y < (game.nSquares - 1) ? rendererState.cellPositions[cell.cache.coords.x][cell.cache.coords.y + 1] : 0

        //Top
        if (!topCellIsSelected) ctx.fillRect(left, top, lineLength, colorBorderLineWidth)

        //Right
        if (!rightCellIsSelected) ctx.fillRect(right, top, colorBorderLineWidth, lineLength)
        else {
            //Right bridges
            if (!topCellIsSelected || !topRightCellIsSelected) ctx.fillRect(right, top, rightCellLeft - right + colorBorderLineWidth, colorBorderLineWidth)
            if (!bottomRightCellIsSelected || !bottomCellIsSelected) ctx.fillRect(right, bottom, rightCellLeft - right + colorBorderLineWidth, colorBorderLineWidth)
        }

        //Bottom
        if (!bottomCellIsSelected) ctx.fillRect(left, bottom, lineLength, colorBorderLineWidth)
        else {
            //Bottom bridges
            if (!leftCellIsSelected || !bottomLeftCellIsSelected) ctx.fillRect(left, bottom, colorBorderLineWidth, bottomCellTop - bottom + colorBorderLineWidth)
            if (!rightCellIsSelected || !bottomRightCellIsSelected) ctx.fillRect(right, bottom, colorBorderLineWidth, bottomCellTop - bottom + colorBorderLineWidth)
        }

        //Left
        if (!leftCellIsSelected) ctx.fillRect(left, top, colorBorderLineWidth, lineLength)
    }
}

export function classicRenderLinks({ ctx, game, showLinks, lockedInput, selectedCellsValues, accentColor, linksLineWidth, squareSize, rendererState }: RendererProps) {
    //Links
    if (showLinks && (lockedInput > 0 || selectedCellsValues.length === 1)) {
        const target = lockedInput > 0 ? lockedInput : selectedCellsValues[0]
        let links = game.getLinks(target)
        ctx.fillStyle = ctx.strokeStyle = accentColor === 'red' ? '#c298eb' : '#ff5252'
        ctx.lineWidth = linksLineWidth
        links.forEach(link => {
            const noteDelta = rendererState.noteDeltas[target - 1]
            link.forEach(cell => {
                ctx.beginPath()
                ctx.arc(rendererState.cellPositions[cell.cache.coords.x] + noteDelta.x, rendererState.cellPositions[cell.cache.coords.y] + noteDelta.y, squareSize / 8, 0, 2 * Math.PI, false)
                ctx.fill()
            })
            if (link.length === 2) {
                ctx.beginPath()
                ctx.moveTo(rendererState.cellPositions[link[0].cache.coords.x] + noteDelta.x, rendererState.cellPositions[link[0].cache.coords.y] + noteDelta.y)
                ctx.lineTo(rendererState.cellPositions[link[1].cache.coords.x] + noteDelta.x, rendererState.cellPositions[link[1].cache.coords.y] + noteDelta.y)
                ctx.stroke()
            }
        })
    }
}

export function classicRenderFadeAnimations({ ctx, game, animationColors, animationGammas, currentAnimations, squareSize, themes, theme, boxBorderWidth, cellBorderWidth, rendererState }: RendererProps) {
    //Fade animations
    if (animationColors && animationGammas && ['fadein', 'fadein', 'fadeout'].includes(currentAnimations[0]?.type)) {
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
    game.difficulty = getDifficulty(data.id[1] as DifficultyIdentifier)
    game.clues = decodeMissionString(data.m)
    game.mission = data.m
    game.solution = Solver.solve(game.clues)
}

export function classicGetBoxCellsCoordinates(game: Board, c: Cell): Cell[] {
    let boxCells = []
    const boxX = Math.floor(c.cache.coords.x / 3)
    const boxY = Math.floor(c.cache.coords.y / 3)
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (x !== c.cache.coords.x || y !== c.cache.coords.y) boxCells.push(game.get({ x: boxX * 3 + x, y: boxY * 3 + y }))
    return boxCells
}

export function classicGetVisibleCells(game: Board, c: Cell): Cell[] {
    let visibleCells: Cell[] = []
    const boxX = Math.floor(c.cache.coords.x / 3)
    const boxY = Math.floor(c.cache.coords.y / 3)
    visibleCells = visibleCells.concat(game.ruleset.game.getBoxCellsCoordinates(game, c))
    for (let i = 0; i < game.nSquares; i++) {
        if (i < boxX * 3 || i >= boxX * 3 + 3) visibleCells.push(game.get({ x: i, y: c.cache.coords.y }))
        if (i < boxY * 3 || i >= boxY * 3 + 3) visibleCells.push(game.get({ x: c.cache.coords.x, y: i }))
    }
    return visibleCells
}

export function classicCheckRowAnimation(game: Board, center: Cell) {
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: i, y: center.cache.coords.y }).value === 0) return
    }

    game.animations.push({
        type: 'col',
        startTime: null,
        duration: 750,
        func: ({ themes, theme, progress, animationColors }) => {
            for (let x = 0; x < game.nSquares; x++) animationColors[x][center.cache.coords.y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(center.cache.coords.x - x), progress, 8, 4)})`
        }
    })
}

export function classicCheckColumnAnimation(game: Board, center: Cell) {
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: center.cache.coords.x, y: i }).value === 0) return
    }

    game.animations.push({
        type: 'col',
        startTime: null,
        duration: 750,
        func: ({ themes, theme, progress, animationColors }) => {
            for (let y = 0; y < game.nSquares; y++) animationColors[center.cache.coords.x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(center.cache.coords.y - y), progress, 8, 4)})`
        }
    })
}

export function classicCheckBoxAnimation(game: Board, center: Cell) {
    for (const cell of game.ruleset.game.getBoxCellsCoordinates(game, center)) {
        if (cell.value === 0) return
    }

    const boxX = Math.floor(center.cache.coords.x / 3)
    const boxY = Math.floor(center.cache.coords.y / 3)
    game.animations.push({
        type: 'box',
        startTime: null,
        duration: 750,
        func: ({ themes, theme, progress, animationColors }) => {
            for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) animationColors[boxX * 3 + x][boxY * 3 + y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(y * 3 + x, progress, 8, 8)})`
        }
    })
}

export function classicGetBoxes(game: Board): Cell[][] {
    let boxes: Cell[][] = []
    for (let boxX = 0; boxX < game.nSquares; boxX += 3) {
        for (let boxY = 0; boxY < game.nSquares; boxY += 3) {
            let box: Cell[] = []
            for (let dX = 0; dX < 3; dX++) {
                for (let dY = 0; dY < 3; dY++) {
                    box.push(game.get({ x: boxX + dX, y: boxY + dY }))
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

export function classicScreenCoordsToBoardCoords(clickX: number, clickY: number, { game, rendererState, squareSize }: StateProps): Cell | undefined {
    for (let x = 0; x < game.nSquares; x++) {
        if (clickX <= rendererState.current.cellPositions[x] + squareSize.current) {
            for (let y = 0; y < game.nSquares; y++) {
                if (clickY <= rendererState.current.cellPositions[y] + squareSize.current) return game.get({ x, y })
            }
        }
    }
    return undefined
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

export function classicGetCellUnits(game: Board, cell: Cell) {
    let units: Cell[][] = []

    // Row
    let row: Cell[] = []
    for (let x = 0; x < game.nSquares; x++) row.push(game.get({ x, y: cell.cache.coords.y }))
    units.push(row)

    // Col
    let col: Cell[] = []
    for (let y = 0; y < game.nSquares; y++) col.push(game.get({ x: cell.cache.coords.x, y }))
    units.push(col)

    // Box
    let box: Cell[] = []
    const x0 = Math.floor(cell.cache.coords.x / 3) * 3
    const y0 = Math.floor(cell.cache.coords.y / 3) * 3
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            box.push(game.get({ x: x0 + x, y: y0 + y }))
        }
    }
    units.push(box)

    return units
}

export function classicGetAllUnits(game: Board): Cell[][] {
    let units: Cell[][] = []
    let currentUnit: Cell[] = []
    for (let row = 0; row < game.nSquares; row++) {
        currentUnit = []
        for (let y = 0; y < game.nSquares; y++) {
            currentUnit.push(game.get({ x: row, y }))
        }
        units.push([...currentUnit])
    }

    currentUnit = []
    for (let col = 0; col < game.nSquares; col++) {
        currentUnit = []
        for (let x = 0; x < game.nSquares; x++) {
            currentUnit.push(game.get({ x, y: col }))
        }
        units.push([...currentUnit])
    }

    units = units.concat(classicGetBoxes(game))

    return units
}
