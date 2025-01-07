import { Ref, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import ClassicBoard from "./ClassicBoard";
import { BoardAnimation, CanvasRef, CellCoordinates, Coordinates, DigitChar, MouseButtonType, ThemeName } from "../../utils/DataTypes";
import { AccentColor } from "../../utils/Colors";
import SettingsHandler from "../../utils/SettingsHandler";
//@ts-ignore
import o9n from 'o9n';
import { isTouchDevice } from "../../utils/isTouchDevice";
import { indexOfCoordsInArray } from "../../utils/CoordsUtils";

const animationLengths = {
	row: 750,
	col: 750,
	box: 750,
	board: 1350, //Must be equal to the timeout delay on Sudoku.js,
	fadein_long: 1350,
	fadein: 500,
	fadeout: 500
}

const roundedRatio = Math.round(window.devicePixelRatio)

const cellBorderWidth = roundedRatio === 1 ? 2 : 3
const linksLineWidth = roundedRatio === 1 ? 4 : 8
const colorBorderLineWidth = roundedRatio === 1 ? 1 : 3

const themes = {
	light: {
		canvasLightDefaultCellColor: 'white',
		canvasDarkDefaultCellColor: '#e2ebf3',
		canvasCellBorderColor: '#bec6d4',
		canvasCellBorderColorRGBA: '190, 198, 212',
		canvasBoxBorderColor: '#344861',
		canvasBoxBorderColorRGBA: '52, 72, 97',
		canvasClueColor: '#344861',
		canvasSelectedCellClueColor: '#344861',
		canvasSelectedCellCandidateColor: '#75747c',
		canvasSameValueCellBackground: '#c3d7ea',
		canvasNoteHighlightColor: 'black',
		canvasAnimationBaseColor: '0, 0, 0',
		canvasAnimationDarkColor: '255, 255, 255',
		canvasAnimationFadeBaseColor: '226, 235, 243',
		canvasKillerCageColor: '#344861',
		canvasKillerHighlightedCageColor: 'black',
	},
	dark: {
		canvasLightDefaultCellColor: '#25242c',
		canvasDarkDefaultCellColor: '#161620',
		canvasCellBorderColor: 'black',
		canvasCellBorderColorRGBA: '0, 0, 0',
		canvasBoxBorderColor: 'black',
		canvasBoxBorderColorRGBA: '0, 0, 0',
		canvasClueColor: '#75747c',
		canvasSelectedCellClueColor: 'black',
		canvasSelectedCellCandidateColor: 'black',
		canvasSameValueCellBackground: '#0f0e12',
		canvasNoteHighlightColor: 'white',
		canvasAnimationBaseColor: '255, 255, 255',
		canvasAnimationDarkColor: '0, 0, 0',
		canvasAnimationFadeBaseColor: '22, 22, 32',
		canvasKillerCageColor: '#75747c',
		canvasKillerHighlightedCageColor: 'white',
	}
}

function updateColors(theme: ThemeName){
	const newColors = {
		default: themes[theme].canvasLightDefaultCellColor,
		red: '#fc5c65',
		orange: '#fd9644',
		yellow: '#fed330',
		green: '#26de81',
		blueGreen: '#2bcbba',
		lightBlue: '#45aaf2',
		darkBlue: '#2e69f2',
		purple: '#a55eea'
	};

	const newDarkColors = {
		default: themes[theme].canvasDarkDefaultCellColor,
		red: '#99393d',
		orange: '#995c29',
		yellow: '#997e1d',
		green: '#1a995a',
		blueGreen: '#1d877d',
		lightBlue: '#2c6c99',
		darkBlue: '#315099',
		purple: '#6b3d99'
	};

	const newSelectedCellColors = theme === 'light' ? {
		red: '#fcbdc0',
		orange: '#fcdabd',
		yellow: '#ffe999',
		green: '#a6dec2',
		blueGreen: '#8fccc6',
		lightBlue: '#b6d9f2',
		darkBlue: '#b2c4ed',
		purple: '#d3bceb'
	} : newDarkColors;

	return [newColors, newDarkColors, newSelectedCellColors];
}

const solutionColors = {
	red: '#fc7e84',
	orange: '#fcb77e',
	yellow: '#ffe173',
	green: '#6fdea7',
	blueGreen: '#66ccc2',
	lightBlue: '#79c0f2',
	darkBlue: '#6f90c3',
	purple: '#c298eb'
}

const k = 0.2

function brightness(x: number, p: number, q: number, l: number) {
	let t = (-q - l) * p + l
	return Math.max(0, k * (1 - Math.abs(2 / l * (x + t) - 1)))
}

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

const SVGHeight = 30
const SVGWidth = 20
const spaceBetweenDigits = 5

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

type Props = {
    onClick?: (coords: CellCoordinates[], type: MouseButtonType, hold: boolean) => void;
    showLinks?: boolean;
    game: ClassicBoard;
    lockedInput?: number;
    theme: ThemeName;
    accentColor: AccentColor;
    paused?: boolean;
    notPlayable?: boolean;
    nSquares: number;
    showSelectedCell?: boolean;
    style?: React.CSSProperties;
    boxBorderWidthFactor?: number;
}

const ClassicCanvas = forwardRef(({onClick = () => {}, showLinks = false, game, lockedInput = 0, theme, accentColor, paused = false, notPlayable = false, nSquares, showSelectedCell = true, style, boxBorderWidthFactor = 0.01}: Props, ref: Ref<CanvasRef>) => {
    const logicalSize = useRef(0);
	const canvasPadding = useRef(0);
	const squareSize = useRef(0);
	const cellPositions = useRef<number[]>([]);
	const valuePositions = useRef<number[]>([]);
	const noteDeltas = useRef<Coordinates[]>([]);
	const animationColors = useRef<string[][] | null>(null);
	const animationGammas = useRef<number[] | null>(null);
	const currentAnimations = useRef<{data: BoardAnimation, startTime: number | null}[]>([]);
	const lastMouseCell = useRef<CellCoordinates>();
	const lastMouseButton = useRef<MouseButtonType | null>(null);
	const colors = useRef<Record<string, string>>();
	const darkColors = useRef<Record<string, string>>();
	const selectedCellColors = useRef<Record<string, string>>();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
		renderFrame() {
            renderFrame();
		},
		doAnimations(data: BoardAnimation[]) {
            addAnimations(data);
		},
		stopAnimations() {
            currentAnimations.current = [];
		}
	}));

	function renderFrame(){
		if (canvasRef.current === null) return;

		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;
		const highlitedCells = game.calculateHighlightedCells(game.selectedCells, lockedInput);
		const boxBorderWidth = logicalSize.current * boxBorderWidthFactor;

		let selectedCellValue = game.selectedCells.length === 1 ? game.get(game.selectedCells[0]).value : 0;

		// Background
		ctx.fillStyle = themes[theme].canvasCellBorderColor;
		ctx.fillRect(0, 0, logicalSize.current, logicalSize.current);

		if (!paused || (currentAnimations.current.length > 0 && ['fadein', 'fadeout'].includes(currentAnimations.current[0].data.type))) {
			//Cell background, value, candidates and cage value
			for (let x = 0; x < nSquares; x++) {
				for (let y = 0; y < nSquares; y++) {
					const cell = game.get({ x, y })
					const hasSameValueAsSelected = ((lockedInput > 0 && lockedInput === cell.value) || (lockedInput === 0 && selectedCellValue > 0 && selectedCellValue === cell.value))

					//Background
					ctx.fillStyle =
					!showSelectedCell ? colors.current!.default :
					(hasSameValueAsSelected || highlitedCells[x][y]) ? darkColors.current![cell.color] : //Cell has same value as selected cell or is in same row or column as any cell with the same value as the selected cell
					(colors.current![cell.color]); //Cell color

					ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)

					if (animationColors.current && animationColors.current[x][y] && currentAnimations.current.length > 0 && currentAnimations.current[0].data.type !== 'fadein' && currentAnimations.current[0].data.type !== 'fadeout' && currentAnimations.current[0].data.type !== 'fadein_long') {
						ctx.fillStyle = animationColors.current[x][y]
						ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)
					}

					if (cell.value > 0) {
						//Value
						const isError = SettingsHandler.settings.checkMistakes && cell.value !== cell.solution && cell.solution > 0
						ctx.strokeStyle = ctx.fillStyle =
						isError ? (accentColor === 'red' ? '#ffe173' : '#fc5c65') :
						cell.clue ? (cell.color === 'default' ? themes[theme].canvasClueColor : 'black') :
						solutionColors[accentColor]
						if (isError && cell.color !== 'default') ctx.strokeStyle = ctx.fillStyle = 'white'
						drawSVGNumber(ctx, cell.value, valuePositions.current[x], valuePositions.current[y], squareSize.current * 0.55, true, null)
					} else {
						//Candidates
						for (const n of cell.notes) {
							const highlightCandidate = (lockedInput === 0 && selectedCellValue === n) || lockedInput === n

							ctx.strokeStyle = ctx.fillStyle = highlightCandidate ? (SettingsHandler.settings.highlightCandidatesWithColor ? 'white' : themes[theme].canvasNoteHighlightColor) : (cell.color === 'default' ? '#75747c' : 'black')

							drawSVGNumber(ctx, n, cellPositions.current[x] + noteDeltas.current[n - 1].x, cellPositions.current[y] + noteDeltas.current[n - 1].y, squareSize.current * (game.mode === 'classic' ? 0.2 : 0.16), true, highlightCandidate && SettingsHandler.settings.highlightCandidatesWithColor ? colors.current![accentColor] : null)
						}
					}
				}
			}

			//Selection
			for (const c of game.selectedCells){
				ctx.fillStyle = ctx.strokeStyle = 'white';

				const padding = 1;
				const left = cellPositions.current[c.x] + padding;
				const right = cellPositions.current[c.x] + squareSize.current - padding - colorBorderLineWidth;
				const top = cellPositions.current[c.y] + padding;
				const bottom = cellPositions.current[c.y] + squareSize.current - padding - colorBorderLineWidth;

				const lineLength = squareSize.current - padding * 2;

				//Top
				if (c.y === 0 || (indexOfCoordsInArray(game.selectedCells, {x: c.x, y: c.y - 1}) === -1)) ctx.fillRect(left, top, lineLength, colorBorderLineWidth);

				//Right
				if (c.x === (nSquares - 1) || (indexOfCoordsInArray(game.selectedCells, {x: c.x + 1, y: c.y}) === -1)) ctx.fillRect(right, top, colorBorderLineWidth, lineLength);
				else {
					//Right bridges
					if (!(c.y > 0 && (indexOfCoordsInArray(game.selectedCells, {x: c.x + 1, y: c.y - 1}) >= 0) && (indexOfCoordsInArray(game.selectedCells, {x: c.x, y: c.y - 1}) >= 0))) ctx.fillRect(right, top, padding * 2 + boxBorderWidth, colorBorderLineWidth);
					if (!(c.y < (nSquares - 1) && (indexOfCoordsInArray(game.selectedCells, {x: c.x + 1, y: c.y + 1}) >= 0) && (indexOfCoordsInArray(game.selectedCells, {x: c.x, y: c.y + 1}) >= 0))) ctx.fillRect(right, bottom, padding * 2 + boxBorderWidth, colorBorderLineWidth);
				}

				//Bottom
				if (c.y === (nSquares - 1) || (indexOfCoordsInArray(game.selectedCells, {x: c.x, y: c.y + 1}) === -1)) ctx.fillRect(left, bottom, lineLength, colorBorderLineWidth);
				else {
					//Bottom bridges
					if (!(c.x > 0 && (indexOfCoordsInArray(game.selectedCells, {x: c.x - 1, y: c.y}) >= 0) && (indexOfCoordsInArray(game.selectedCells, {x: c.x - 1, y: c.y + 1}) >= 0))) ctx.fillRect(left, bottom, colorBorderLineWidth, padding * 2 + boxBorderWidth);
					if (!(c.x < (nSquares - 1) && (indexOfCoordsInArray(game.selectedCells, {x: c.x + 1, y: c.y}) >= 0) && (indexOfCoordsInArray(game.selectedCells, {x: c.x + 1, y: c.y + 1}) >= 0))) ctx.fillRect(right, bottom, colorBorderLineWidth, padding * 2 + boxBorderWidth);
				}

				//Left
				if (c.x === 0 || (indexOfCoordsInArray(game.selectedCells, {x: c.x - 1, y: c.y}) === -1)) ctx.fillRect(left, top, colorBorderLineWidth, lineLength);
			}

			//Links
			if (showLinks && (lockedInput > 0 || selectedCellValue > 0)) {
				const target = lockedInput > 0 ? lockedInput : selectedCellValue
				let links = game.calculateLinks(target)
				ctx.fillStyle = ctx.strokeStyle = accentColor === 'red' ? '#c298eb' : '#ff5252'
				ctx.lineWidth = linksLineWidth
				links.forEach(link => {
					const noteDelta = noteDeltas.current[target - 1]
					link.forEach(cell => {
						ctx.beginPath()
						ctx.arc(cellPositions.current[cell.x] + noteDelta.x, cellPositions.current[cell.y] + noteDelta.y, squareSize.current / 8, 0, 2 * Math.PI, false)
						ctx.fill()
					})
					if (link.length === 2) {
						ctx.beginPath()
						ctx.moveTo(cellPositions.current[link[0].x] + noteDelta.x, cellPositions.current[link[0].y] + noteDelta.y)
						ctx.lineTo(cellPositions.current[link[1].x] + noteDelta.x, cellPositions.current[link[1].y] + noteDelta.y)
						ctx.stroke()
					}
				})
			}

			//Fade animations
			if (animationColors.current && animationGammas.current && ['fadein', 'fadein_long', 'fadeout'].includes(currentAnimations.current[0]?.data.type)) {
				for (let y = 0; y < nSquares; y++) {
					for (let x = 0; x < nSquares; x++) {
						ctx.fillStyle = animationColors.current[x][y]
						ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)

						//Right border
						ctx.fillStyle = `rgba(${x % 3 === 2 ? themes[theme].canvasBoxBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas.current[y]})`
						ctx.fillRect(cellPositions.current[x] + squareSize.current, cellPositions.current[y], x % 3 === 2 ? boxBorderWidth : cellBorderWidth, squareSize.current)

						//Bottom border
						ctx.fillStyle = `rgba(${y % 3 === 2 ? themes[theme].canvasBoxBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas.current[y]})`
						ctx.fillRect(cellPositions.current[x], cellPositions.current[y] + squareSize.current, squareSize.current, y % 3 === 2 ? boxBorderWidth : cellBorderWidth)
					}
				}
			}
		} else {
			//Paused
			for (let x = 0; x < nSquares; x++) {
				for (let y = 0; y < nSquares; y++) {
					ctx.strokeStyle = ctx.fillStyle = darkColors.current!.default
					ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)
				}
			}
		}

		//Borders
		if (theme === 'light') {
			ctx.fillStyle = themes[theme].canvasBoxBorderColor
			ctx.fillRect(0, 0, boxBorderWidth, logicalSize.current)
			ctx.fillRect(0, 0, logicalSize.current, boxBorderWidth)
			for (let i = 2; i < nSquares; i += 3) {
				ctx.fillRect(cellPositions.current[i] + squareSize.current, 0, boxBorderWidth, logicalSize.current)
				ctx.fillRect(0, cellPositions.current[i] + squareSize.current, logicalSize.current, boxBorderWidth)
			}
		} else if (SettingsHandler.settings.highContrastGrid) {
			ctx.fillStyle = 'white'
			for (let i = 2; i < nSquares - 1; i += 3) {
				ctx.fillRect(cellPositions.current[i] + squareSize.current, boxBorderWidth, boxBorderWidth, logicalSize.current - boxBorderWidth * 2)
				ctx.fillRect(boxBorderWidth, cellPositions.current[i] + squareSize.current, logicalSize.current - boxBorderWidth * 2, boxBorderWidth)
			}
		}
    }

	function doAnimation(timestamp: number){
		//Init colors.current
		animationColors.current = []
		for (let x = 0; x < nSquares; x++) {
			animationColors.current.push(Array(nSquares).fill(''))
		}

		let i = 0

		while (i < currentAnimations.current.length) {
			const animation = currentAnimations.current[i]
			if (animation.startTime === null) animation.startTime = timestamp
			const progress = (timestamp - animation.startTime) / animationLengths[animation.data.type]

			if (progress < 1) {
				switch (animation.data.type) {
					case 'row':
						for (let x = 0; x < nSquares; x++) animationColors.current[x][animation.data.center.y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.x - x), progress, 8, 4)})`
						break
					case 'col':
						for (let y = 0; y < nSquares; y++) animationColors.current[animation.data.center.x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.y - y), progress, 8, 4)})`
						break
					case 'box':
						for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) animationColors.current[animation.data.boxX * 3 + x][animation.data.boxY * 3 + y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(y * 3 + x, progress, 8, 8)})`
						break
					case 'board':
						for (let x = 0; x < nSquares; x++) for (let y = 0; y < nSquares; y++) animationColors.current[x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.max(Math.abs(animation.data.center.x - x), Math.abs(animation.data.center.y - y)), progress, 8, 8)})`
						break
					case 'fadein':
					case 'fadein_long':
						animationGammas.current = []
                        for (let y = 0; y < nSquares; y++) {
                            const gamma = Math.min(Math.max((y - 2 * progress * (nSquares - 1)) / (nSquares - 1) + 1, 0), 1)
                            for (let x = 0; x < nSquares; x++) animationColors.current[x][y] = `rgba(${themes[theme].canvasAnimationFadeBaseColor}, ${gamma})`
                            animationGammas.current.push(gamma)
                        }
						break
					case 'fadeout':
						animationGammas.current = []
						for (let y = 0; y < nSquares; y++) {
							const gamma = Math.min(Math.max((y - 2 * progress * (nSquares - 1)) / (-nSquares + 1), 0), 1)
							for (let x = 0; x < nSquares; x++) animationColors.current[x][y] = `rgba(${themes[theme].canvasAnimationFadeBaseColor}, ${gamma})`
							animationGammas.current.push(gamma)
						}
						break
					default:
						break
				}
				i++
			} else {
				currentAnimations.current.splice(i, 1)
			}
		}

		renderFrame()

		if (currentAnimations.current.length > 0) {
			requestAnimationFrame((ts) => { doAnimation(ts) })
		} else {
			animationColors.current = null
			animationGammas.current = null
			renderFrame()
		}
	}

    function addAnimations(data: BoardAnimation[]){
		data.forEach(animation => {
			currentAnimations.current.push({
				data: animation,
				startTime: null
			})
		})
		requestAnimationFrame((timestamp) => { doAnimation(timestamp) })
	}

	function resizeCanvas(){
		if (!canvasRef.current) return

		logicalSize.current = canvasRef.current.offsetWidth * roundedRatio
		canvasRef.current.width = logicalSize.current
		canvasRef.current.height = logicalSize.current

		const boxBorderWidth = logicalSize.current * boxBorderWidthFactor
		const numberOfBoxBorders = (Math.floor(nSquares / 3) + 1)
		const numberOfCellBorders = nSquares + 1 - numberOfBoxBorders
		const totalBorderThickness = numberOfBoxBorders * boxBorderWidth + numberOfCellBorders * cellBorderWidth
		squareSize.current = Math.floor((logicalSize.current - totalBorderThickness) / nSquares)
		const previousLogicalSize = logicalSize.current
		logicalSize.current = squareSize.current * nSquares + totalBorderThickness
		canvasPadding.current = Math.floor((previousLogicalSize - logicalSize.current) / 2)

		//Cell and value positions

		let newCellPositions = []
		let newValuePositions = []

		let pos = boxBorderWidth
		for (let i = 0; i < nSquares; i++) {
			newCellPositions.push(pos)
			newValuePositions.push(pos + squareSize.current / 2)
			pos += squareSize.current + cellBorderWidth
			if ((i + 1) % 3 === 0) pos += boxBorderWidth - cellBorderWidth
		}

		//Candidate positions
		let newNoteDeltas = []

		const notePaddingH = game.mode === 'classic' ? squareSize.current * 0.2 : squareSize.current * 0.28
		const notePaddingTop = game.mode === 'classic' ? squareSize.current * 0.17 : squareSize.current * 0.34
		const notePaddingBottom = game.mode === 'classic' ? squareSize.current * 0.17 : squareSize.current * 0.22

		for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) newNoteDeltas.push({ x: notePaddingH + x * (squareSize.current - 2 * notePaddingH) / 2, y: notePaddingTop + y * (squareSize.current - notePaddingTop - notePaddingBottom) / 2 })

		cellPositions.current = newCellPositions
		valuePositions.current = newValuePositions
		noteDeltas.current = newNoteDeltas

		renderFrame()
	}

    function screenCoordsToBoardCoords(clientX: number, clientY: number) {
		if (!canvasRef.current) return undefined;
        const rect = canvasRef.current.getBoundingClientRect();
		const clickX = (clientX - rect.left) / canvasRef.current.offsetWidth * logicalSize.current;
		const clickY = (clientY - rect.top) / canvasRef.current.offsetHeight * logicalSize.current;
		for (let x = 0; x < nSquares; x++) {
			if (clickX <= cellPositions.current[x] + squareSize.current) {
				for (let y = 0; y < nSquares; y++) {
					if (clickY <= cellPositions.current[y] + squareSize.current) return { x, y };
				}
			}
		}
		return undefined;
	}

    function handleInputStart(coords: CellCoordinates[], type: MouseButtonType) {
        if (coords.length === 1) lastMouseCell.current = coords[0];
		onClick(coords, type, false);
	}

	function onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
		if (!notPlayable && !paused) {
			e.stopPropagation()
			let coords: CellCoordinates[] = [];
			for (let i = 0; i < e.targetTouches.length; i++) {
				const newCoord = screenCoordsToBoardCoords(e.targetTouches[i].clientX, e.targetTouches[i].clientY);
				if (newCoord !== undefined) coords.push(newCoord);
			}
			if (coords.length > 0) {
				if (coords.length === 1) lastMouseCell.current = coords[0];
				onClick(coords, 'primary', false)
			}
		}
	}

	function onMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
		e.stopPropagation();
		e.preventDefault();
		if (!notPlayable && !isTouchDevice && !paused) {
			lastMouseButton.current = e.button === 0 ? 'primary' : (e.button === 2 ? 'secondary' : 'tertiary')
			const coords = screenCoordsToBoardCoords(e.clientX, e.clientY);
			if (coords) handleInputStart([coords], lastMouseButton.current);
		}
	}

	function handleInputMove(coords: CellCoordinates[], type: MouseButtonType) {
		if (coords.length === 2) onClick(coords, type, false);
		else if (lastMouseCell.current && coords.length === 1 && (lastMouseCell.current.x !== coords[0].x || lastMouseCell.current.y !== coords[0].y)) {
			lastMouseCell.current = coords[0]
			onClick(coords, type, true)
		}
	}

	function onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
		if (!notPlayable && !paused) {
			e.stopPropagation();
			let coords: CellCoordinates[] = [];
			for (let i = 0; i < e.targetTouches.length; i++) {
				const newCoord = screenCoordsToBoardCoords(e.targetTouches[i].clientX, e.targetTouches[i].clientY);
				if (newCoord !== undefined) coords.push(newCoord);
			}
			if (!notPlayable && !paused && coords.length > 0) handleInputMove(coords, 'primary');
		}
	}

	function onMouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
		e.stopPropagation();
		if (!notPlayable && !isTouchDevice && !paused && lastMouseCell.current && lastMouseButton.current) {
			const coords = screenCoordsToBoardCoords(e.clientX, e.clientY);
			if (coords) handleInputMove([coords], lastMouseButton.current);
		}
	}

	function onContextMenu(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
		e.preventDefault();
		e.stopPropagation();
	}

    useEffect(() => {
		[colors.current, darkColors.current, selectedCellColors.current] = updateColors(theme);
		if (canvasRef.current) {
			resizeCanvas();

			const resizeObserver = new ResizeObserver(() => {
				resizeCanvas();
			})

			resizeObserver.observe(canvasRef.current);

			return () => {
				resizeObserver.disconnect();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		[colors.current, darkColors.current, selectedCellColors.current] = updateColors(theme);
		if (!notPlayable) addAnimations([{ type: 'fadein_long' }]);

		window.addEventListener('resize', resizeCanvas, false)
		o9n.orientation.addEventListener('change', resizeCanvas)

		return () => {
			window.removeEventListener('resize', resizeCanvas)
			o9n.orientation.removeEventListener('change', resizeCanvas)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (paused){
			addAnimations([{type: 'fadeout'}])
		} else {
			if (currentAnimations.current.length === 0) addAnimations([{type: 'fadein'}])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paused]);

	useEffect(() => {
		[colors.current, darkColors.current, selectedCellColors.current] = updateColors(theme);
		renderFrame();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theme]);

    return <canvas
        ref={canvasRef}
        className='sudoku-canvas'
        style={{ ...style, touchAction: (notPlayable || paused) ? 'auto' : 'none', boxSizing: 'border-box' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={() => { lastMouseCell.current = {x: 0, y: 0}; lastMouseButton.current = null; }}
    />;
});

export default ClassicCanvas;
