import { AccentColor } from "../utils/Colors"
import { BoardAnimation, CellCoordinates, DigitChar, RawGameData, ThemeName } from "../utils/DataTypes"
import SettingsHandler from "../utils/SettingsHandler"
import CommonBoard from "./CommonBoard"
import { indexOfCoordsInArray } from "../utils/CoordsUtils"
import { decodeDifficulty, DifficultyIdentifier, GameModeName } from "../utils/Difficulties"
import { MutableRefObject } from "react"
import Solver from "../utils/Solver"
import { decodeMissionString } from "../utils/Decoder"

export interface RendererProps {
    ctx: CanvasRenderingContext2D
    themes: any
    theme: ThemeName
    logicalSize: number
    game: CommonBoard
    lockedInput: number
    notPlayable: boolean
    colors: Record<string, string>
    darkColors: Record<string, string>
    highlightedCells: boolean[][]
    selectedCellValue: number
    squareSize: number
    animationColors: string[][] | null
    currentAnimations: { data: BoardAnimation, startTime: number | null }[]
    accentColor: AccentColor
    solutionColors: any
    colorBorderLineWidth: number
    boxBorderWidth: number
    showLinks: boolean
    linksLineWidth: number
    animationGammas: number[] | null
    cellBorderWidth: number
    rendererState: any
    cageLineWidth: number
}

export interface StateProps {
    game: CommonBoard
    rendererState: MutableRefObject<any>
    squareSize: MutableRefObject<number>
    logicalSize: MutableRefObject<number>
    boxBorderWidthFactor: number
    cellBorderWidth: number
    cageLineWidth: number
}

export interface InitGameProps {
    game: CommonBoard
    data: RawGameData
}

const SVGHeight = 30
const SVGWidth = 20
const spaceBetweenDigits = 5

// COMMON

const numberPaths: Record<DigitChar, string> = {
    '1': 'M 12.3909,30 V 3.174442 H 12.158774 C 11.47168,3.580121 5.93779,7.890466 5,8.549695 V 5.547667 C 5.584958,5.141988 11.276694,0.730223 12.400186,0 H 15 v 30 h -2.599814 z',
    '2': 'M 0,8.7189672 C 0.04162331,3.6544191 4.0998959,0 9.6670135,0 c 5.4110305,0 9.5629555,3.5451837 9.5629555,8.1727905 0,3.0486595 -1.477628,5.4319765 -6.53486,10.5858985 l -8.3246615,8.470705 v 0.248262 H 20 V 30 H 0.16649324 V 28.043694 L 10.926119,16.94141 c 4.2872,-4.399205 5.379812,-6.146971 5.379812,-8.6693147 0,-3.2770605 -2.924037,-5.8291956 -6.7013524,-5.8291956 -3.9750261,0 -6.7221644,2.571996 -6.7637878,6.2760675 v 0.019861 H 0 Z',
    '3': 'm 6.1470588,15.710578 v -2.355614 h 3.3921569 c 3.7450983,0 6.3333333,-2.277741 6.3333333,-5.5678128 0,-3.1343284 -2.588235,-5.3926022 -6.186274,-5.3926022 -3.5980397,0 -6.1372554,2.1219987 -6.4117652,5.3926022 H 0.5980392 C 0.9215686,3.0759247 4.5196078,0 9.784314,0 c 4.941176,0 8.882353,3.3095393 8.882353,7.4659312 0,3.4750158 -2.009804,6.0058408 -5.392157,6.7456198 v 0.262816 C 17.421569,14.931862 20,17.667099 20,21.619079 20,26.349773 15.588235,30 9.901961,30 4.2941176,30 0.17647059,26.690461 0,22.037638 h 2.6470588 c 0.2450981,3.241402 3.254902,5.567813 7.2352942,5.567813 4.205882,0 7.284314,-2.56976 7.284314,-6.044776 0,-3.611291 -2.862745,-5.840364 -7.5,-5.840364 H 6.1372549 Z',
    '4': 'M 13.505904,30 V 23.22646 H 0 V 20.634492 C 2.3978202,16.108674 5.7220708,10.357746 12.325159,0 h 3.651226 V 20.674992 H 20 V 23.22646 H 15.976385 V 30 H 13.496821 Z M 2.6612171,20.512994 v 0.182247 H 13.505904 V 2.7134661 H 13.333333 A 187.42961,208.93689 0 0 0 2.6612171,20.512994 Z',
    '5': 'M 9.760479,30 C 4.4011976,30 0.30938124,26.583913 0,21.797418 h 2.744511 c 0.2994012,3.296922 3.3133732,5.739821 7.0359281,5.739821 4.3213569,0 7.4151699,-3.078451 7.4151699,-7.388282 0,-4.319761 -3.093813,-7.398212 -7.3453096,-7.398212 -2.9141717,0 -5.489022,1.410129 -6.7365269,3.67428 H 0.4491018 L 2.0459082,0 H 18.153693 V 2.5024826 H 4.261477 L 3.2734531,13.217478 h 0.2694611 c 1.4071856,-1.83714 3.8622754,-2.899702 6.7564868,-2.899702 5.668663,0 9.700599,4.051638 9.700599,9.731876 0,5.829196 -4.241517,9.940418 -10.239521,9.940418 z',
    '6': 'M 10.359158,30 C 6.5784433,30 3.6011301,28.05258 1.8525494,24.498539 0.61436521,22.24927 -9.9086488e-7,19.269718 -9.9086488e-7,15.628043 -0.00945278,5.8130477 3.9035874,0 10.557646,0 c 4.631376,0 8.137989,2.8821811 8.931939,7.3709834 H 16.776922 C 16.07749,4.3719572 13.638929,2.4537488 10.519839,2.4537488 c -5.0188995,0 -7.892243,4.8393379 -7.9489537,13.3787732 H 2.80718 c 1.2192806,-3.232717 4.3005634,-5.306719 7.967857,-5.306719 5.302453,0 9.224945,4.070107 9.224945,9.581305 0,5.735151 -4.054817,9.883155 -9.640824,9.883155 z m -0.03781,-2.424537 c 3.969751,0 6.994323,-3.193769 6.994323,-7.361247 0,-4.255112 -2.930054,-7.312561 -6.975419,-7.312561 a 6.8714497,7.0788705 0 0 0 -7.0699374,7.108082 c 0,4.29406 3.0623792,7.565726 7.0510334,7.565726 z',
    '7': 'M 2.8319502,30 17.022822,2.7881041 V 2.5549172 H 0 V 0 H 20 V 2.6563028 L 5.9232365,30 Z',
    '8': 'm 9.9953305,29.990269 c -5.9033649,0 -9.99471143457,-3.415504 -9.99471143457,-8.358741 A 7.2003886,7.3467402 0 0 1 6.1614813,14.265326 V 14.031787 A 6.3229902,6.4515083 0 0 1 1.1069039,7.6289329 C 1.097367,3.1722348 4.7881622,0 9.9857935,0 c 5.2071685,0 8.8979635,3.1527733 8.8979635,7.6289329 0,3.1333121 -1.974146,5.6438531 -5.04504,6.4028541 v 0.233539 a 7.2194624,7.3662018 0 0 1 6.160862,7.366202 C 19.999579,26.584496 15.917769,30 9.9857935,30 Z m 0,-2.354849 c 4.3297705,0 7.3148315,-2.530003 7.3148315,-6.179046 0,-3.571197 -2.965988,-6.003893 -7.3148315,-6.003893 -4.3202331,0 -7.2957579,2.452157 -7.2957579,6.003893 0,3.649043 2.9755248,6.188777 7.2957579,6.188777 z m 0,-14.547519 c 3.7194055,0 6.2657685,-2.111579 6.2657685,-5.2448909 0,-3.2500811 -2.546363,-5.4881609 -6.2657685,-5.4881609 -3.7194059,0 -6.2562316,2.2380798 -6.2562316,5.4881609 0,3.1138499 2.5463626,5.2546219 6.2562316,5.2546219 z',
    '9': 'M 9.442344,30 C 4.7258979,30 1.294896,27.099286 0.50094518,22.650876 H 3.2136106 c 0.6805293,2.929916 3.0434782,4.905905 6.2665406,4.905905 4.9432888,0 7.7504728,-4.652823 7.9395088,-12.712524 0.02836,-0.194679 -0.09452,-0.457495 -0.113422,-0.661908 H 17.192817 C 15.992439,17.355613 12.89225,19.477612 9.2249527,19.477612 3.8752363,19.477612 0,15.418559 0,9.9383517 0,4.2050616 4.026465,0 9.6408318,0 13.42155,0 16.398866,1.9565217 18.147448,5.5288774 19.376181,7.7676833 20,10.717067 20,14.386762 20,24.159637 16.124764,29.980532 9.442344,29.980532 Z M 9.6502836,17.102531 c 4.0170134,0 7.0793954,-3.114861 7.0793954,-7.086308 0,-4.2829329 -3.043479,-7.5924722 -7.0604919,-7.5924722 -3.9886578,0 -6.9943289,3.2121999 -6.9943289,7.4269955 0,4.1758597 2.873346,7.2517847 6.9754254,7.2517847 z',
    '0': 'M -2.6077032e-8,15.336214 Q -2.6077032e-8,10.012562 1.085206,6.7774198 2.1908876,3.5218018 4.340824,1.7609015 6.511236,1.1920929e-6 9.7873296,1.1920929e-6 q 2.4161194,0 4.2384464,0.9828280779071 1.822327,0.96235253 3.009911,2.80515513 1.187584,1.8223271 1.863278,4.4636776 0.675694,2.620875 0.675694,7.084552 0,5.282701 -1.085206,8.538319 -1.085206,3.235143 -3.255618,5.016519 -2.149936,1.7609 -5.4465054,1.7609 -4.340824,0 -6.8183698,-3.112289 Q -2.6077032e-8,23.792631 -2.6077032e-8,15.336214 Z m 3.787983226077032,0 q 0,7.391687 1.7199491,9.848757 1.7404248,2.436594 4.2793973,2.436594 2.5389724,0 4.2589214,-2.45707 1.740425,-2.45707 1.740425,-9.828281 0,-7.4121614 -1.740425,-9.848756 -1.719949,-2.4365946 -4.2998726,-2.4365946 -2.5389725,0 -4.0541658,2.1499364 Q 3.7879832,7.9445282 3.7879832,15.336214 Z'
}

function drawSVGNumber(ctx: CanvasRenderingContext2D, n: number, x: number, y: number, size: number, center: boolean, background: string | null) {
    const scale = size / SVGHeight

    if (background !== null) {
        const prevFillStyle = ctx.fillStyle
        const backgroundScaleFactor = 1.4

        ctx.translate(x, y)
        ctx.scale(scale, scale)

        ctx.fillStyle = background
        ctx.fillRect(0 - (SVGWidth / 2) * backgroundScaleFactor, 0 - (SVGHeight / 2) * backgroundScaleFactor, SVGWidth * backgroundScaleFactor, SVGHeight * backgroundScaleFactor)

        ctx.fillStyle = prevFillStyle

        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    String(n).split('').map((digit, i) => {
        ctx.translate(x + scale * (i * (SVGWidth + spaceBetweenDigits) - (center ? SVGWidth / 2 : 0)) - (digit === '1' ? size * 0.05 : 0), y - (center ? SVGHeight * scale / 2 : 0))
        ctx.scale(scale, scale)

        ctx.lineWidth = 1

        const p = new Path2D(numberPaths[digit as DigitChar])

        ctx.stroke(p)
        ctx.fill(p)

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        return null
    })
}

function dashedLine(ctx: CanvasRenderingContext2D, c1: CellCoordinates, c2: CellCoordinates, ratio: number, cageLineWidth: number) {
    const segmentCount = Math.round(Math.max(Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y))) / ratio
    if (c1.x === c2.x) for (let i = 0; i < segmentCount; i += 2) ctx.fillRect(c1.x, c1.y + ratio * i, cageLineWidth, ratio)
    else for (let i = 0; i < segmentCount; i += 2) ctx.fillRect(c1.x + ratio * i, c1.y, ratio, cageLineWidth)
}

// CLASSIC

function classicRenderBackground({ ctx, themes, theme, logicalSize }: RendererProps) {
    //Board background
    ctx.fillStyle = themes[theme].canvasCellBorderColor
    ctx.fillRect(0, 0, logicalSize, logicalSize)
}

function classicRenderCellBackground({ ctx, game, lockedInput, notPlayable, colors, darkColors, highlightedCells, selectedCellValue, squareSize, animationColors, currentAnimations, rendererState }: RendererProps) {
    for (let x = 0; x < game.nSquares; x++) {
        for (let y = 0; y < game.nSquares; y++) {
            const cell = game.get({ x, y })
            const hasSameValueAsSelected = ((lockedInput > 0 && lockedInput === cell.value) || (lockedInput === 0 && selectedCellValue > 0 && selectedCellValue === cell.value))

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
        }
    }
}

function classicRenderCellValueCandidates({ ctx, themes, theme, game, lockedInput, colors, selectedCellValue, squareSize, accentColor, solutionColors, rendererState }: RendererProps) {
    for (let x = 0; x < game.nSquares; x++) {
        for (let y = 0; y < game.nSquares; y++) {
            const cell = game.get({ x, y })

            if (cell.value > 0) {
                //Value
                ctx.strokeStyle = ctx.fillStyle =
                    cell.isError ? (accentColor === 'red' ? '#ffe173' : '#fc5c65') :
                        cell.clue ? (cell.color === 'default' ? themes[theme].canvasClueColor : 'black') :
                            solutionColors[accentColor]
                if (cell.isError && cell.color !== 'default') ctx.strokeStyle = ctx.fillStyle = 'white'
                drawSVGNumber(ctx, cell.value, rendererState.valuePositions[x], rendererState.valuePositions[y], squareSize * 0.55, true, null)
            } else {
                //Candidates
                for (const n of cell.notes) {
                    const highlightCandidate = (lockedInput === 0 && selectedCellValue === n) || lockedInput === n

                    ctx.strokeStyle = ctx.fillStyle = highlightCandidate ? (SettingsHandler.settings.highlightCandidatesWithColor ? 'white' : themes[theme].canvasNoteHighlightColor) : (cell.color === 'default' ? '#75747c' : 'black')

                    drawSVGNumber(ctx, n, rendererState.cellPositions[x] + rendererState.noteDeltas[n - 1].x, rendererState.cellPositions[y] + rendererState.noteDeltas[n - 1].y, squareSize * (game.mode === 'killer' ? 0.16 : 0.2), true, highlightCandidate && SettingsHandler.settings.highlightCandidatesWithColor ? colors[accentColor] : null)
                }
            }
        }
    }
}

function classicRenderSelection({ ctx, accentColor, colors, game, squareSize, colorBorderLineWidth, boxBorderWidth, rendererState }: RendererProps) {
    //Selection
    for (const c of game.selectedCells) {
        ctx.fillStyle = ctx.strokeStyle = colors[accentColor]

        const padding = 1
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

function classicRenderLinks({ ctx, game, showLinks, lockedInput, selectedCellValue, accentColor, linksLineWidth, squareSize, rendererState }: RendererProps) {
    //Links
    if (showLinks && (lockedInput > 0 || selectedCellValue > 0)) {
        const target = lockedInput > 0 ? lockedInput : selectedCellValue
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

function classicRenderFadeAnimations({ ctx, game, animationColors, animationGammas, currentAnimations, squareSize, themes, theme, boxBorderWidth, cellBorderWidth, rendererState }: RendererProps) {
    //Fade animations
    if (animationColors && animationGammas && ['fadein', 'fadein_long', 'fadeout'].includes(currentAnimations[0]?.data.type)) {
        for (let y = 0; y < game.nSquares; y++) {
            for (let x = 0; x < game.nSquares; x++) {
                ctx.fillStyle = animationColors[x][y]
                ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y], squareSize, squareSize)

                //Right border
                ctx.fillStyle = `rgba(${x % 3 === 2 ? themes[theme].canvasBoxBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas[y]})`
                ctx.fillRect(rendererState.cellPositions[x] + squareSize, rendererState.cellPositions[y], x % 3 === 2 ? boxBorderWidth : cellBorderWidth, squareSize)

                //Bottom border
                ctx.fillStyle = `rgba(${y % 3 === 2 ? themes[theme].canvasBoxBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas[y]})`
                ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y] + squareSize, squareSize, y % 3 === 2 ? boxBorderWidth : cellBorderWidth)
            }
        }
    }
}

function classicRenderPaused({ ctx, game, darkColors, squareSize, rendererState }: RendererProps) {
    //Paused
    for (let x = 0; x < game.nSquares; x++) {
        for (let y = 0; y < game.nSquares; y++) {
            ctx.strokeStyle = ctx.fillStyle = darkColors.default
            ctx.fillRect(rendererState.cellPositions[x], rendererState.cellPositions[y], squareSize, squareSize)
        }
    }
}

function classicRenderBorders({ ctx, game, themes, theme, boxBorderWidth, logicalSize, squareSize, rendererState }: RendererProps) {
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

function classicInitGameData({ game, data }: InitGameProps) {
    game.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier)
    game.clues = decodeMissionString(data.m)
    game.mission = data.m
    game.solution = Solver.solve(game.clues)
}

function classicGetBoxCellsCoordinates(c: CellCoordinates): CellCoordinates[] {
    let boxCells = []
    const boxX = Math.floor(c.x / 3)
    const boxY = Math.floor(c.y / 3)
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) boxCells.push({ x: boxX * 3 + x, y: boxY * 3 + y })
    return boxCells
}

function classicGetVisibleCells(game: CommonBoard, c: CellCoordinates): CellCoordinates[] {
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

function classicCheckRowAnimation(game: CommonBoard, c: CellCoordinates): BoardAnimation[] {
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: i, y: c.y }).value === 0) return []
    }
    return [{ type: 'row', center: c }]
}

function classicCheckColumnAnimation(game: CommonBoard, c: CellCoordinates): BoardAnimation[] {
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: c.x, y: i }).value === 0) return []
    }
    return [{ type: 'col', center: c }]
}

function classicCheckBoxAnimation(game: CommonBoard, c: CellCoordinates): BoardAnimation[] {
    for (const cell of game.ruleset.game.getBoxCellsCoordinates(c)) {
        if (game.get(cell).value === 0) return []
    }
    return [{ type: 'box', boxX: Math.floor(c.x / 3), boxY: Math.floor(c.y / 3) }]
}

function classicGetBoxes(game: CommonBoard): CellCoordinates[][] {
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

function classicFindLinksRow(game: CommonBoard, n: number): CellCoordinates[][] {
    let links: CellCoordinates[][] = []
    for (let r = 0; r < game.nSquares; r++) {
        let newLink = []
        for (let i = 0; i < game.nSquares; i++) {
            if (game.get({ x: i, y: r }).notes.includes(n)) {
                newLink.push({ x: i, y: r })
            }
        }
        if (newLink.length <= 2) {
            links.push(newLink)
        }
    }
    return links
}

function classicFindLinksColumn(game: CommonBoard, n: number): CellCoordinates[][] {
    let links: CellCoordinates[][] = []
    for (let c = 0; c < game.nSquares; c++) {
        let newLink = []
        for (let i = 0; i < game.nSquares; i++) {
            if (game.get({ x: c, y: i }).notes.includes(n)) {
                newLink.push({ x: c, y: i })
            }
        }
        if (newLink.length <= 2) {
            links.push(newLink)
        }
    }
    return links
}

function classicFindLinksBox(game: CommonBoard, n: number): CellCoordinates[][] {
    let links: CellCoordinates[][] = []
    for (let boxX = 0; boxX < 3; boxX++) {
        for (let boxY = 0; boxY < 3; boxY++) {
            let newLink = []
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if (game.get({ x: boxX * 3 + x, y: boxY * 3 + y }).notes.includes(n)) {
                        newLink.push({ x: boxX * 3 + x, y: boxY * 3 + y })
                    }
                }
            }
            if (newLink.length <= 2) {
                links.push(newLink)
            }
        }
    }
    return links
}

function classicResize({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth }: StateProps) {
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

function classicScreenCoordsToBoardCoords(clickX: number, clickY: number, { game, rendererState, squareSize }: StateProps): CellCoordinates | undefined {
    for (let x = 0; x < game.nSquares; x++) {
        if (clickX <= rendererState.current.cellPositions[x] + squareSize.current) {
            for (let y = 0; y < game.nSquares; y++) {
                if (clickY <= rendererState.current.cellPositions[y] + squareSize.current) return { x, y }
            }
        }
    }
    return undefined
}

function classicCalculatePossibleValues(game: CommonBoard) {
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
            }
        }
    }

    if (SettingsHandler.settings.lockCellsWithColor) {
        for (let x = 0; x <= game.nSquares - 1; x++) {
            for (let y = 0; y <= game.nSquares - 1; y++) {
                const cell = game.get({ x, y })
                if (cell.color !== 'default') {
                    cell.possibleValues = [...cell.notes]
                }
            }
        }
    }

    return []
}

function classicDetectErrorsFromSolution(game: CommonBoard) {
    if (!SettingsHandler.settings.checkMistakes) return []

    for (let x = 0; x <= game.nSquares - 1; x++) {
        for (let y = 0; y <= game.nSquares - 1; y++) {
            const cell = game.get({ x, y })
            cell.isError = cell.solution > 0 && cell.value > 0 && cell.value !== cell.solution
        }
    }

    return []
}

function classicCheckComplete(game: CommonBoard) {
    game.ruleset.game.checkErrors(game)

    for (let x = 0; x <= game.nSquares - 1; x++) {
        for (let y = 0; y <= game.nSquares - 1; y++) {
            const cell = game.get({ x, y })
            if (cell.value === 0 || cell.isError) return false
        }
    }
    return true
}

// Killer

function killerRenderCagesAndCageValues({ ctx, game, cageLineWidth, rendererState, themes, theme, squareSize }: RendererProps) {
    ctx.lineWidth = cageLineWidth

    //Borders
    rendererState.cageVectors.forEach((vector: CageVector) => {
        ctx.fillStyle = ctx.strokeStyle = (game.selectedCells.some(selectedCell => vector[2] === game.get(selectedCell).cageIndex)) ? themes[theme].canvasKillerHighlightedCageColor : themes[theme].canvasKillerCageColor
        dashedLine(ctx, vector[0], vector[1], vector[3], cageLineWidth)
    })

    for (let x = 0; x < game.nSquares; x++) {
        for (let y = 0; y < game.nSquares; y++) {
            const cell = game.get({ x, y })
            if (cell.cageValue! > 0) {
                ctx.strokeStyle = ctx.fillStyle = game.selectedCells.some(selectedCell => cell.cageIndex === game.get(selectedCell).cageIndex) && game.nSquares > 3 ? themes[theme].canvasKillerHighlightedCageColor : themes[theme].canvasKillerCageColor
                drawSVGNumber(ctx, cell.cageValue!, rendererState.cellPositions[x] + rendererState.cagePadding + squareSize * 0.05, rendererState.cellPositions[y] + rendererState.cagePadding + squareSize * 0.08, squareSize * 0.15, true, null)
            }
        }
    }
}

function killerInitGameData({ game, data }: InitGameProps) {
    game.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier)
    const [clues, solution, cages] = data.m.split(' ')
    game.clues = decodeMissionString(clues)
    game.mission = data.m
    game.solution = solution
    game.cages = []
    for (const cage of cages.split(',')) {
        let newCage: number[][] = []
        for (let i = 0; i < cage.length; i += 2) {
            newCage.push([Number(cage[i]), Number(cage[i + 1])])
        }
        game.cages.push(newCage)
    }
}

function killerSolveLastInCages(game: CommonBoard) {
    let animations: BoardAnimation[] = []
    if (SettingsHandler.settings.killerAutoSolveLastInCage && game.nSquares > 3) {
        for (let cageIndex = 0; cageIndex < game.cages.length; cageIndex++) {
            let remaining = game.cages[cageIndex].length
            let sum = 0
            let realSum = 0
            game.cages[cageIndex].forEach(coords => {
                let x = coords[0]
                let y = coords[1]
                const cell = game.get({ x, y })
                if (cell.value > 0) remaining--
                sum += cell.value
                if (cell.cageValue! > 0) realSum = cell.cageValue!
            })
            if (remaining === 1 && realSum - sum <= 9) {
                game.cages[cageIndex].forEach(coords => {
                    let x = coords[0]
                    let y = coords[1]
                    if (game.get({ x, y }).value === 0) {
                        animations.concat(game.setValue([{ x, y }], realSum - sum))
                    }
                })
            }
        }
    }

    return animations
}

function killerInitCageIndex(game: CommonBoard) {
    for (let cageIndex = 0; cageIndex < game.cages.length; cageIndex++) {
        game.cages[cageIndex].forEach((cell, cellIndex) => {
            let x = cell[0]
            let y = cell[1]
            game.board[x][y].cageIndex = cageIndex
            if (SettingsHandler.settings.killerAutoSolveLastInCage && game.cages[cageIndex].length === 1 && game.nSquares > 3) game.board[x][y].value = game.board[x][y].solution
            if (cellIndex === 0) {
                let sum = 0
                for (const cell2 of game.cages[cageIndex]) sum += game.board[cell2[0]][cell2[1]].solution
                game.board[x][y].cageValue = sum
            } else {
                game.board[x][y].cageValue = 0
            }
        })
    }

    if (SettingsHandler.settings.killerAutoSolveLastInCage && game.nSquares > 3) {
        for (let cageIndex = 0; cageIndex < game.cages.length; cageIndex++) {
            killerSolveLastInCages(game)
        }
    }
}

function killerGetVisibleCells(game: CommonBoard, c: CellCoordinates): CellCoordinates[] {
    let visibleCells = classicGetVisibleCells(game, c)

    for (const cell of game.cages[game.get(c).cageIndex!]) {
        const coords = { x: cell[0], y: cell[1] }
        if (indexOfCoordsInArray(visibleCells, coords) === -1) visibleCells.push(coords)
    }

    return visibleCells
}

function killerResize({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth }: StateProps) {
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

type CageVector = [CellCoordinates, CellCoordinates, number, number]

function killerCalculateCageVectors({ game, rendererState, squareSize, cageLineWidth }: StateProps) {
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

// Sudoku X

function sudokuXInitGameData({ game, data }: InitGameProps) {
    game.difficulty = decodeDifficulty(data.id[1] as DifficultyIdentifier)
    game.clues = decodeMissionString(data.m)
    game.mission = data.m
    game.solution = '000000000000000000000000000000000000000000000000000000000000000000000000000000000'
}

function sudokuXGetVisibleCells(game: CommonBoard, c: CellCoordinates): CellCoordinates[] {
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
    if (c.y === 8 - c.x) {
        for (let i = 0; i < game.nSquares; i++) {
            if (i !== c.x && indexOfCoordsInArray(visibleCells, { x: i, y: 8 - i }) === -1) {
                visibleCells.push({ x: i, y: 8 - i })
            }
        }
    }

    return visibleCells
}

function sudokuXDetectErrors(game: CommonBoard) {
    if (!SettingsHandler.settings.checkMistakes) return []

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

    return []
}

function sudokuXDiagonals({ ctx, theme, game, rendererState, squareSize }: RendererProps) {
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

function sudokuXFindLinksDiagonals(game: CommonBoard, n: number): CellCoordinates[][] {
    let links: CellCoordinates[][] = []

    let newLink = []
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: i, y: i }).notes.includes(n)) {
            newLink.push({ x: i, y: i })
        }
    }

    if (newLink.length <= 2) {
        links.push(newLink)
    }

    newLink = []
    for (let i = 0; i < game.nSquares; i++) {
        if (game.get({ x: i, y: 8 - i }).notes.includes(n)) {
            newLink.push({ x: i, y: 8 - i })
        }
    }

    if (newLink.length <= 2) {
        links.push(newLink)
    }

    return links
}

export interface Ruleset {
    render: {
        init: ((props: StateProps) => void)[]
        onResize: ((props: StateProps) => void)[]
        screenCoordsToBoardCoords: (clickX: number, clickY: number, state: StateProps) => CellCoordinates | undefined
        before: ((props: RendererProps) => void)[]
        unpaused: ((props: RendererProps) => void)[]
        paused: ((props: RendererProps) => void)[]
        after: ((props: RendererProps) => void)[]
    }
    game: {
        initGameData: (props: InitGameProps) => void
        initBoardMatrix: ((game: CommonBoard) => void)[]
        getVisibleCells: (game: CommonBoard, c: CellCoordinates) => CellCoordinates[]
        getBoxCellsCoordinates: (c: CellCoordinates) => CellCoordinates[]
        checkAnimations: ((game: CommonBoard, c: CellCoordinates) => BoardAnimation[])[]
        getBoxes: (game: CommonBoard) => CellCoordinates[][]
        findLinks: ((game: CommonBoard, n: number) => CellCoordinates[][])[]
        afterValuesChanged: ((game: CommonBoard) => BoardAnimation[])[]
        checkComplete: (game: CommonBoard) => boolean
        checkErrors: (game: CommonBoard) => void
    }
}

export const rulesets: { [key in GameModeName]: Ruleset } = {
    classic: {
        render: {
            init: [],
            onResize: [classicResize],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [classicRenderBackground],
            unpaused: [classicRenderCellBackground, classicRenderCellValueCandidates, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations],
            paused: [classicRenderPaused],
            after: [classicRenderBorders],
        },
        game: {
            initGameData: classicInitGameData,
            initBoardMatrix: [],
            getVisibleCells: classicGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            findLinks: [classicFindLinksRow, classicFindLinksColumn, classicFindLinksBox],
            afterValuesChanged: [classicCalculatePossibleValues,],
            checkComplete: classicCheckComplete,
            checkErrors: classicDetectErrorsFromSolution,
        },
    },
    killer: {
        render: {
            init: [killerCalculateCageVectors],
            onResize: [killerResize, killerCalculateCageVectors],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [classicRenderBackground],
            unpaused: [classicRenderCellBackground, classicRenderCellValueCandidates, killerRenderCagesAndCageValues, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations],
            paused: [classicRenderPaused],
            after: [classicRenderBorders],
        },
        game: {
            initGameData: killerInitGameData,
            initBoardMatrix: [killerInitCageIndex],
            getVisibleCells: killerGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            findLinks: [classicFindLinksRow, classicFindLinksColumn, classicFindLinksBox],
            afterValuesChanged: [killerSolveLastInCages, classicCalculatePossibleValues],
            checkComplete: classicCheckComplete,
            checkErrors: classicDetectErrorsFromSolution,
        },
    },
    sudokuX: {
        render: {
            init: [],
            onResize: [classicResize],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [classicRenderBackground],
            unpaused: [classicRenderCellBackground, sudokuXDiagonals, classicRenderCellValueCandidates, classicRenderSelection, classicRenderLinks, classicRenderFadeAnimations],
            paused: [classicRenderPaused],
            after: [classicRenderBorders],
        },
        game: {
            initGameData: sudokuXInitGameData,
            initBoardMatrix: [],
            getVisibleCells: sudokuXGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            findLinks: [classicFindLinksRow, classicFindLinksColumn, classicFindLinksBox, sudokuXFindLinksDiagonals],
            afterValuesChanged: [classicCalculatePossibleValues],
            checkComplete: classicCheckComplete,
            checkErrors: sudokuXDetectErrors,
        },
    },
    sandwich: {
        render: {
            init: [],
            onResize: [],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [() => { }],
            unpaused: [],
            paused: [],
            after: [() => { }],
        },
        game: {
            initGameData: () => { },
            initBoardMatrix: [],
            getVisibleCells: classicGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            findLinks: [classicFindLinksRow, classicFindLinksColumn, classicFindLinksBox],
            afterValuesChanged: [classicCalculatePossibleValues, classicDetectErrorsFromSolution],
            checkComplete: () => false,
            checkErrors: () => { },
        },
    },
    thermo: {
        render: {
            init: [],
            onResize: [],
            screenCoordsToBoardCoords: classicScreenCoordsToBoardCoords,
            before: [() => { }],
            unpaused: [],
            paused: [],
            after: [() => { }],
        },
        game: {
            initGameData: () => { },
            initBoardMatrix: [],
            getVisibleCells: classicGetVisibleCells,
            getBoxCellsCoordinates: classicGetBoxCellsCoordinates,
            checkAnimations: [classicCheckRowAnimation, classicCheckColumnAnimation, classicCheckBoxAnimation],
            getBoxes: classicGetBoxes,
            findLinks: [classicFindLinksRow, classicFindLinksColumn, classicFindLinksBox],
            afterValuesChanged: [classicCalculatePossibleValues, classicDetectErrorsFromSolution],
            checkComplete: () => false,
            checkErrors: () => { }
        },
    },
}
