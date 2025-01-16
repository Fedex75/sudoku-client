import { CellCoordinates, DigitChar, RendererProps } from "../../utils/DataTypes"
import SettingsHandler from "../../utils/SettingsHandler"
import Board from "../Board"

const SVGHeight = 30
const SVGWidth = 20
const spaceBetweenDigits = 5

// M -2.6077032e-8,15.336214 Q -2.6077032e-8,10.012562 1.085206,6.7774198 2.1908876,3.5218018 4.340824,1.7609015 6.511236,1.1920929e-6 9.7873296,1.1920929e-6 q 2.4161194,0 4.2384464,0.9828280779071 1.822327,0.96235253 3.009911,2.80515513 1.187584,1.8223271 1.863278,4.4636776 0.675694,2.620875 0.675694,7.084552 0,5.282701 -1.085206,8.538319 -1.085206,3.235143 -3.255618,5.016519 -2.149936,1.7609 -5.4465054,1.7609 -4.340824,0 -6.8183698,-3.112289 Q -2.6077032e-8,23.792631 -2.6077032e-8,15.336214 Z m 3.787983226077032,0 q 0,7.391687 1.7199491,9.848757 1.7404248,2.436594 4.2793973,2.436594 2.5389724,0 4.2589214,-2.45707 1.740425,-2.45707 1.740425,-9.828281 0,-7.4121614 -1.740425,-9.848756 -1.719949,-2.4365946 -4.2998726,-2.4365946 -2.5389725,0 -4.0541658,2.1499364 Q 3.7879832,7.9445282 3.7879832,15.336214 Z

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
    '0': 'M 9.78754,0 C 7.603465,0 5.787642,0.586939 4.34069,1.760883 2.907393,2.934822 1.822163,4.606987 1.08504,6.777411 0.36156,8.934184 0,11.787174 0,15.336295 c 0,5.637647 0.989626,9.705638 2.968944,12.203671 1.651709,2.074871 3.924699,3.112032 6.818596,3.112032 2.19773,0 4.013027,-0.58694 5.446324,-1.760881 1.446952,-1.18759 2.532174,-2.859755 3.25565,-5.016528 0.723472,-2.170424 1.08504,-5.016471 1.08504,-8.538294 0,-2.975802 -0.224826,-5.337448 -0.675313,-7.084707 C 18.448777,6.490674 17.827655,5.002766 17.035928,3.787873 16.244201,2.559333 15.240692,1.624183 14.025799,0.982609 12.81091,0.327388 11.3983,0 9.78754,0 Z M 9.7395,2.7588 c 2.015007,0 3.694312,0.831008 5.037652,2.492692 1.359334,1.661684 2.039135,5.019907 2.039135,10.074771 0,5.026943 -0.679801,8.378011 -2.039135,10.053655 -1.34334,1.675648 -3.006047,2.513807 -4.989076,2.513807 -1.983022,0 -3.654557,-0.831004 -5.013891,-2.492688 C 3.430845,23.725389 2.75881,20.36717 2.75881,15.326263 2.75881,10.285363 3.502869,6.82959 4.990137,4.958449 6.173553,3.492262 7.756471,2.7588 9.7395,2.7588 Z',
}

export function drawSVGNumber(ctx: CanvasRenderingContext2D, n: number, x: number, y: number, size: number, hJustify: 'left' | 'center' | 'right', vJustify: 'top' | 'center' | 'bottom', background: string | null) {
    const scale = size / SVGHeight
    const digits = String(n).split('')

    let totalWidth = 0
    for (let i = 0; i < digits.length; i++) {
        totalWidth += SVGWidth
        if (i > 0) totalWidth += spaceBetweenDigits
    }

    if (background !== null) {
        const prevFillStyle = ctx.fillStyle
        const backgroundScaleFactor = 1.4
        const backgroundWidth = totalWidth + SVGWidth * (backgroundScaleFactor - 1)
        const horizontalCorrection = (hJustify === 'center' ? 0 : (hJustify === 'left' ? 0 - totalWidth / 2 : totalWidth / 2))

        ctx.translate(x + horizontalCorrection, y + ((vJustify === 'center') ? 0 : SVGHeight / 2))
        ctx.scale(scale, scale)

        ctx.fillStyle = background
        ctx.fillRect(0 - backgroundWidth / 2, 0 - SVGHeight * backgroundScaleFactor / 2, backgroundWidth, SVGHeight * backgroundScaleFactor)

        ctx.fillStyle = prevFillStyle

        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    const horizontalCorrection = (hJustify === 'left' ? totalWidth : (hJustify === 'center' ? totalWidth / 2 : 0))
    const verticalCorrection = (vJustify === 'top' ? SVGHeight * scale : (vJustify === 'center' ? SVGHeight * scale / 2 : 0))
    digits.forEach((digit, i) => {
        ctx.translate(x + scale * (i * (SVGWidth + spaceBetweenDigits) - horizontalCorrection) - (digit === '1' ? size * 0.05 : 0), y - verticalCorrection)
        ctx.scale(scale, scale)

        ctx.lineWidth = 1

        const p = new Path2D(numberPaths[digit as DigitChar])

        ctx.stroke(p)
        ctx.fill(p)

        ctx.setTransform(1, 0, 0, 1, 0, 0)
    })
}

export function dashedLine(ctx: CanvasRenderingContext2D, c1: CellCoordinates, c2: CellCoordinates, ratio: number, cageLineWidth: number) {
    const segmentCount = Math.round(Math.max(Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y))) / ratio
    if (c1.x === c2.x) for (let i = 0; i < segmentCount; i += 2) ctx.fillRect(c1.x, c1.y + ratio * i, cageLineWidth, ratio)
    else for (let i = 0; i < segmentCount; i += 2) ctx.fillRect(c1.x + ratio * i, c1.y, ratio, cageLineWidth)
}

export function commonRenderCellValueAndCandidates({ ctx, themes, theme, game, lockedInput, colors, selectedCellsValues, squareSize, accentColor, solutionColors, rendererState }: RendererProps) {
    game.iterateAllCells((cell, { x, y }) => {
        if (cell.value > 0) {
            //Value
            const highlightValue = (lockedInput === 0 && selectedCellsValues.includes(cell.value)) || lockedInput === cell.value
            ctx.strokeStyle = ctx.fillStyle =
                cell.isError ? (accentColor === 'red' ? '#ffe173' : '#fc5c65') :
                    highlightValue ? (cell.color === 'default' ? themes[theme].canvasNoteHighlightColor : 'white') :
                        cell.clue ? (cell.color === 'default' ? themes[theme].canvasClueColor : 'black') :
                            solutionColors[accentColor]
            if (cell.isError && cell.color !== 'default') ctx.strokeStyle = ctx.fillStyle = 'white'
            drawSVGNumber(ctx, cell.value, rendererState.valuePositions[x], rendererState.valuePositions[y], squareSize * 0.55, 'center', 'center', null)
        } else {
            //Candidates
            for (const n of cell.notes) {
                const highlightCandidate = (lockedInput === 0 && selectedCellsValues.includes(n)) || lockedInput === n

                ctx.strokeStyle = ctx.fillStyle = highlightCandidate ? (SettingsHandler.settings.highlightCandidatesWithColor ? 'white' : (cell.color === 'default' ? themes[theme].canvasNoteHighlightColor : 'white')) : (cell.color === 'default' ? '#75747c' : 'black')

                drawSVGNumber(ctx, n, rendererState.cellPositions[x] + rendererState.noteDeltas[n - 1].x, rendererState.cellPositions[y] + rendererState.noteDeltas[n - 1].y, squareSize * (game.mode === 'killer' ? 0.16 : 0.2), 'center', 'center', highlightCandidate && SettingsHandler.settings.highlightCandidatesWithColor ? colors[accentColor] : null)
            }
        }
    })
}

export function commonDetectErrorsFromSolution(game: Board) {
    if (!SettingsHandler.settings.checkMistakes) return []

    game.iterateAllCells(cell => { cell.isError = cell.solution > 0 && cell.value > 0 && cell.value !== cell.solution })

    return []
}

export function commonDetectErrorsByVisibility(game: Board) {
    game.iterateAllCells(cell => { cell.isError = false })

    game.iterateAllCells((cell, { x, y }) => {
        for (const vc of game.ruleset.game.getVisibleCells(game, { x, y })) {
            if ((vc.x !== x || vc.y !== y) && game.get(vc).value === cell.value) {
                cell.isError = true
            }
        }
    })

    return []
}
