import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import SettingsHandler from '../../utils/SettingsHandler'
import o9n from 'o9n'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)

const animationLengths = {
	row: 500,
	col: 500,
	quadrant: 500,
	board: 1350, //Must be equal to the timeout delay on Sudoku.js,
	fadein_long: 1350,
	fadein: 500,
	fadeout: 500
}

const roundedRatio = Math.round(window.devicePixelRatio)

const quadrantBorderWidth = roundedRatio === 1 ? 4 : 6
const cellBorderWidth = roundedRatio === 1 ? 2 : 3
const linksLineWidth = roundedRatio === 1 ? 4 : 8
const colorBorderLineWidth = roundedRatio === 1 ? 1 : 3
const cageLineWidth = roundedRatio === 1 ? 2 : 2

const themes = {
	light: {
		canvasLightDefaultCellColor: 'white',
		canvasDarkDefaultCellColor: '#e2ebf3',
		canvasCellBorderColor: '#bec6d4',
		canvasCellBorderColorRGBA: '190, 198, 212',
		canvasQuadrantBorderColor: '#344861',
		canvasQuadrantBorderColorRGBA: '52, 72, 97',
		canvasClueColor: '#344861',
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
		canvasQuadrantBorderColor: 'black',
		canvasQuadrantBorderColorRGBA: '0, 0, 0',
		canvasClueColor: '#75747c',
		canvasSameValueCellBackground: '#0f0e12',
		canvasNoteHighlightColor: 'white',
		canvasAnimationBaseColor: '255, 255, 255',
		canvasAnimationDarkColor: '0, 0, 0',
		canvasAnimationFadeBaseColor: '22, 22, 32',
		canvasKillerCageColor: '#75747c',
  	canvasKillerHighlightedCageColor: 'white',
	}
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

function brightness(x, p, q, l){
	let t = (-q-l)*p+l
	return Math.max(0, k*(1-Math.abs(2/l*(x+t)-1)))
}

function dashedLine(ctx, c1, c2, ratio){
	const segmentCount = Math.round(Math.max(Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y))) / ratio
	if (c1.x === c2.x) for (let i = 0; i < segmentCount; i += 2) ctx.fillRect(c1.x, c1.y + ratio * i, cageLineWidth, ratio)
	else for (let i = 0; i < segmentCount; i += 2) ctx.fillRect(c1.x + ratio * i, c1.y, ratio, cageLineWidth)
}

const numberPaths = {
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

function drawSVGNumber(ctx, n, x, y, size, center){
	const scale = size / SVGHeight
	String(n).split('').map((digit, i) => {
		ctx.translate(x + scale * (i * (SVGWidth + spaceBetweenDigits) - (center ? SVGWidth / 2 : 0)) - (digit === '1' ? size * 0.05 : 0), y - (center ? SVGHeight * scale / 2 : 0))
		ctx.scale(scale, scale)
	
		ctx.lineWidth = 1
	
		const p = new Path2D(numberPaths[digit])
	
		ctx.stroke(p)
		ctx.fill(p)
		
		ctx.setTransform(1, 0, 0, 1, 0, 0)
		return null
	})
}

const Canvas = forwardRef(({
		game,
		lockedInput = 0,
		showLinks = false,
		onClick = () => {},
		nSquares = 9,
		showSelectedCell = true,
		noTouch = false,
		theme,
		accentColor,
		style,
		paused
}, ref) => {

	function addAnimations(data){
		data.forEach(animation => {
			currentAnimations.current.push({
				data: animation,
				startTime: null
			})
		})
		requestAnimationFrame((timestamp) => {doAnimation(timestamp)})
	}

	useImperativeHandle(ref, () => ({
		renderFrame(){
			renderFrame()
		},
		doAnimation(data){
			addAnimations(data)
		},
		stopAnimations(){
			currentAnimations.current = []
		},
		clearCageVectors(){
			cageVectors.current = null
		}
	}))

	const logicalSize = useRef(null)
	const canvasPadding = useRef(0)
	const squareSize = useRef(0)
	const cellPositions = useRef([])
	const valuePositions = useRef([])
	const noteDeltas = useRef([])
	const cageVectors = useRef([])
	const animationColors = useRef(null)
	const animationGammas = useRef(null)
	const currentAnimations = useRef([])
	const lastMouseCell = useRef(null)
	const lastMouseButton = useRef(null)
	const lockedInputRef = useRef()
	const showLinksRef = useRef()
	const colors = useRef()
	const darkColors = useRef()
	const selectedCellColors = useRef()
	const pausedRef = useRef()

	const canvasRef = useRef(null)

	function calculateCageVectors(){
		if (game.mode === 'classic') return

		//Cage vectors
		
		const cagePadding = Math.floor(squareSize.current * 0.08)
		let cageLinePositions = Array(nSquares*2).fill(0)

		for (let i = 0; i < nSquares; i++){
			cageLinePositions[i*2] = cellPositions.current[i] + cagePadding
			cageLinePositions[i*2+1] = cellPositions.current[i] + squareSize.current - cagePadding - cageLineWidth
		}

		let newCageVectors = []

		let startA = null
		let startB = null

		const targetRatio = Math.floor(squareSize.current * 0.075) + 1

		function addVector(c1, c2, cageIndex){
			let i = 1
			let ratio = 0
			const delta = Math.max(Math.abs(c2.x - c1.x), Math.abs(c2.y - c1.y)) + cageLineWidth

			while (true){
				ratio = delta / i
				if (ratio <= targetRatio){
					if ( (targetRatio - ratio) > (delta / (i - 1) - targetRatio)) ratio = delta / (i - 2)
					break
				}
				i += 2
			}

			newCageVectors.push([c1, c2, cageIndex, ratio])
		}

		//Horizontal
		for (let y = 0; y < nSquares; y++){
			const top = cageLinePositions[y*2]
			const bottom = cageLinePositions[y*2+1]

			for (let x = 0; x < nSquares; x++){
				const cell = game.board[x][y]
				
				const hShift = cell.cageValue > 9 ? Math.ceil(squareSize.current * 0.28) : (cell.cageValue > 0 ? Math.ceil(squareSize.current * 0.15) : 0)

				const left = cageLinePositions[x*2]
				const right = cageLinePositions[x*2+1]

				//Top line
				if (y === 0 || game.board[x][y-1].cageIndex !== cell.cageIndex){
					if (startA === null) startA = {x: left + hShift, y: top}
				} else {
					if (startA !== null){
						addVector(startA, {x: left + hShift, y: top}, cell.cageIndex)
						startA = null
					}
				}

				//Top bridge
				if (!(x === (nSquares - 1) || game.board[x+1][y].cageIndex !== cell.cageIndex) && x < nSquares - 1 && !(y > 0 && game.board[x+1][y-1].cageIndex === cell.cageIndex && game.board[x][y-1].cageIndex === cell.cageIndex)
				){
					if (startA === null) startA = {x: right, y: top}
				} else {
					if (startA !== null){
						addVector(startA, {x: right, y: top}, cell.cageIndex)
						startA = null
					}
				}

				//Bottom line
				if (y === (nSquares - 1) || game.board[x][y+1].cageIndex !== cell.cageIndex){
					if (startB === null) startB = {x: left, y: bottom}
				} else {
					if (startB !== null){
						addVector(startB, {x: left + hShift, y: bottom}, cell.cageIndex)
						startB = null
					}
				}

				//Bottom bridge
				if (!(x === (nSquares - 1) || game.board[x+1][y].cageIndex !== cell.cageIndex) && x < nSquares - 1 && !(y < (nSquares - 1) && game.board[x+1][y+1].cageIndex === cell.cageIndex && game.board[x][y+1].cageIndex === cell.cageIndex)){
					if (startB === null) startB = {x: right, y: bottom}
				} else {
					if (startB !== null){
						addVector(startB, {x: right, y: bottom}, cell.cageIndex)
						startB = null
					}
				}
			}
		}

		//Vertical
		for (let x = 0; x < nSquares; x++){
			const left = cageLinePositions[x*2]
			const right = cageLinePositions[x*2+1]

			for (let y = 0; y < nSquares; y++){
				const cell = game.board[x][y]
				
				const vShift = cell.cageValue > 0 ? Math.ceil(squareSize.current * 0.20) : 0

				const top = cageLinePositions[y*2]
				const bottom = cageLinePositions[y*2+1]

				//Left line
				if (x === 0 || game.board[x-1][y].cageIndex !== cell.cageIndex){
					if (startA === null) startA = {x: left, y: top + vShift}
				} else {
					if (startA !== null){
						addVector(startA, {x: left, y: top + vShift}, cell.cageIndex)
						startA = null
					}
				}

				//Left bridge
				if (!(y === (nSquares - 1) || game.board[x][y+1].cageIndex !== cell.cageIndex) && !(x > 0 && game.board[x-1][y].cageIndex === cell.cageIndex && game.board[x-1][y+1].cageIndex === cell.cageIndex)){
					if (startA === null) startA = {x: left, y: bottom}
				} else {
					if (startA !== null){
						addVector(startA, {x: left, y: bottom}, cell.cageIndex)
						startA = null
					}
				}

				//Right line
				if (x === (nSquares - 1) || game.board[x+1][y].cageIndex !== cell.cageIndex){
					if (startB === null) startB = {x: right, y: top}
				} else {
					if (startB !== null){
						addVector(startB, {x: right, y: top}, cell.cageIndex)
						startB = null
					}
				}

				//Right bridge
				if (!(y === (nSquares - 1) || game.board[x][y+1].cageIndex !== cell.cageIndex) && !(x < (nSquares - 1) && game.board[x+1][y].cageIndex === cell.cageIndex && game.board[x+1][y+1].cageIndex === cell.cageIndex)){
					if (startB === null) startB = {x: right, y: bottom}
				} else {
					if (startB !== null){
						addVector(startB, {x: right, y: bottom}, cell.cageIndex)
						startB = null
					}
				}
			}
		}

		cageVectors.current = newCageVectors
	}

	function resizeCanvas(){
		if (!canvasRef.current) return

		logicalSize.current = canvasRef.current.offsetWidth * roundedRatio
		canvasRef.current.width = logicalSize.current
		canvasRef.current.height = logicalSize.current

		const numberOfQuadrantBorders = (Math.floor(nSquares / 3) + 1)
		const numberOfCellBorders = nSquares + 1 - numberOfQuadrantBorders
		const totalBorderThickness = numberOfQuadrantBorders * quadrantBorderWidth + numberOfCellBorders * cellBorderWidth
		squareSize.current = Math.floor((logicalSize.current - totalBorderThickness) / nSquares)
		const previousLogicalSize = logicalSize.current
		logicalSize.current = squareSize.current * nSquares + totalBorderThickness
		canvasPadding.current = Math.floor( (previousLogicalSize - logicalSize.current) / 2)

		//Cell and value positions

		let newCellPositions = []
		let newValuePositions = []

		let pos = quadrantBorderWidth
		for (let i = 0; i < nSquares; i++){
			newCellPositions.push(pos)
			newValuePositions.push(pos + squareSize.current / 2)
			pos += squareSize.current + cellBorderWidth
			if ((i + 1) % 3 === 0) pos += quadrantBorderWidth - cellBorderWidth
		}

		//Candidate positions
		let newNoteDeltas = []

		const notePaddingH = game.mode === 'classic' ? squareSize.current * 0.2 : squareSize.current * 0.28
		const notePaddingTop = game.mode === 'classic' ? squareSize.current * 0.17 : squareSize.current * 0.34
		const notePaddingBottom = game.mode === 'classic' ? squareSize.current * 0.17 : squareSize.current * 0.22

		for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) newNoteDeltas.push({x: notePaddingH + x * (squareSize.current - 2 * notePaddingH) / 2, y: notePaddingTop + y * (squareSize.current - notePaddingTop - notePaddingBottom) / 2})

		cellPositions.current = newCellPositions
		valuePositions.current = newValuePositions
		noteDeltas.current = newNoteDeltas

		calculateCageVectors()

		renderFrame()
	}

	function updateColors(){
		colors.current = {
			default: themes[theme].canvasLightDefaultCellColor,
			red: '#fc5c65',
			orange: '#fd9644',
			yellow: '#fed330',
			green: '#26de81',
			blueGreen: '#2bcbba',
			lightBlue: '#45aaf2',
			darkBlue: '#4b7bec',
			purple: '#a55eea'
		}
		
		darkColors.current = {
			default: themes[theme].canvasDarkDefaultCellColor,
			red: '#99393d',
			orange: '#995c29',
			yellow: '#997e1d',
			green: '#1a995a',
			blueGreen: '#2bcbba',
			lightBlue: '#2c6c99',
			darkBlue: '#315099',
			purple: '#6b3d99'
		}

		selectedCellColors.current = theme === 'light' ? {
			red: '#fcbdc0',
			orange: '#fcdabd',
			yellow: '#ffe999',
			green: '#a6dec2',
			blueGreen: '#8fccc6',
			lightBlue: '#b6d9f2',
			darkBlue: '#b2c4ed',
			purple: '#d3bceb'
		} : darkColors.current
	}

	function renderFrame(){
		if (canvasRef.current === null) return

		if (cageVectors.current === null) calculateCageVectors()

		const ctx = canvasRef.current.getContext('2d')
		const selectedCell = game.getSelectedCell()
		const highlitedCells = game.calculateHighlightedCells(game.selectedCell, lockedInputRef.current)

		//Background
		ctx.fillStyle = themes[theme].canvasCellBorderColor
		ctx.fillRect(0, 0, logicalSize.current, logicalSize.current)

		//Borders
		ctx.fillStyle = themes[theme].canvasQuadrantBorderColor
		ctx.fillRect(0, 0, quadrantBorderWidth, logicalSize.current)
		ctx.fillRect(0, 0, logicalSize.current, quadrantBorderWidth)
		for (let i = 2; i < nSquares; i += 3){
			ctx.fillRect(cellPositions.current[i] + squareSize.current, 0, quadrantBorderWidth, logicalSize.current)
			ctx.fillRect(0, cellPositions.current[i] + squareSize.current, logicalSize.current, quadrantBorderWidth)
		}

		if (!pausedRef.current || (currentAnimations.current.length > 0 && currentAnimations.current[0].data.type === 'fadeout')){
			//Cell background, value, candidates and cage value
			for (let x = 0; x < nSquares; x++){
				for (let y = 0; y < nSquares; y++){
					const cell = game.get({x, y})
					const isSelectedCell = game.selectedCell.x === x && game.selectedCell.y === y
					const hasSameValueAsSelected = ((lockedInputRef.current > 0 && lockedInputRef.current === cell.value) || (lockedInputRef.current === 0 && selectedCell.value > 0 && selectedCell.value === cell.value))

					//Background

					ctx.fillStyle =
					!showSelectedCell ? colors.current.default :
					isSelectedCell ? selectedCellColors.current[accentColor] /*themes[theme].canvasSelectedCellBackground*/ :
					hasSameValueAsSelected ? themes[theme].canvasSameValueCellBackground : //Cell has same value as selected cell
					highlitedCells[x][y] ? darkColors.current.default : //Cell in same row or column as any cell with the same value as the selected cell
					colors.current.default //Default

					ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)

					if (animationColors.current && animationColors.current[x][y] && currentAnimations.current[0].data.type !== 'fadein' && currentAnimations.current[0].data.type !== 'fadeout' && currentAnimations.current[0].data.type !== 'fadein_long'){
						ctx.fillStyle = animationColors.current[x][y]
						ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)
					}

					if (cell.value > 0){
						//Value
						const isError = SettingsHandler.settings.checkMistakes && cell.value !== cell.solution && cell.solution > 0
						ctx.strokeStyle = ctx.fillStyle = 
							isError ? (accentColor === 'red' ? '#ffe173' : '#fc5c65') :
							cell.clue ? themes[theme].canvasClueColor :
							solutionColors[accentColor] /*themes[theme].canvasSolutionColor*/
						if (isError && cell.color !== 'default') ctx.strokeStyle = 'white'
						else ctx.strokeStyle = ctx.fillStyle
						drawSVGNumber(ctx, cell.value, valuePositions.current[x], valuePositions.current[y], squareSize.current * 0.55, true)
					} else {
						//Candidates					
						for (const n of cell.notes){
							ctx.strokeStyle = ctx.fillStyle = 
							(lockedInputRef.current === 0 && selectedCell.value === n) || lockedInputRef.current === n ? themes[theme].canvasNoteHighlightColor :
							'#75747c'
							
							drawSVGNumber(ctx, n, cellPositions.current[x] + noteDeltas.current[n-1].x, cellPositions.current[y] + noteDeltas.current[n-1].y, squareSize.current * (game.mode === 'classic' ? 0.2 : 0.16), true)
						}
					}

					const cagePadding = Math.floor(squareSize.current * 0.08)
					
					if (game.mode === 'killer' && cell.cageValue > 0){
						ctx.strokeStyle = ctx.fillStyle = cell.cageIndex === selectedCell.cageIndex && game.nSquares > 3 ? themes[theme].canvasKillerHighlightedCageColor : themes[theme].canvasKillerCageColor
						drawSVGNumber(ctx, cell.cageValue, cellPositions.current[x] + cagePadding + squareSize.current * 0.05, cellPositions.current[y] + cagePadding + squareSize.current * 0.08, squareSize.current * 0.15, true)
					}
				}
			}

			//Cages
			if (game.mode === 'killer'){
				ctx.lineWidth = cageLineWidth

				//Borders
				cageVectors.current.forEach(vector => {
					ctx.fillStyle = ctx.strokeStyle = (vector[2] === selectedCell.cageIndex && game.nSquares > 3) ? themes[theme].canvasKillerHighlightedCageColor : themes[theme].canvasKillerCageColor
					dashedLine(ctx, vector[0], vector[1], vector[3])
				})
			}

			//Colors
			for (let x = 0; x < nSquares; x++){
				for (let y = 0; y < nSquares; y++) {
					const cell = game.get({x, y})

					//Color
					if (cell.color !== 'default'){
						ctx.fillStyle = ctx.strokeStyle = colors.current[cell.color]

						const padding = 1
						const left = cellPositions.current[x] + padding
						const right = cellPositions.current[x] + squareSize.current - padding - colorBorderLineWidth
						const top = cellPositions.current[y] + padding
						const bottom = cellPositions.current[y] + squareSize.current - padding - colorBorderLineWidth

						const lineLength = squareSize.current - padding * 2

						//Top
						if (y === 0 || game.board[x][y-1].color !== cell.color) ctx.fillRect(left, top, lineLength, colorBorderLineWidth)
						
						//Right
						if (x === (nSquares - 1) || game.board[x+1][y].color !== cell.color) ctx.fillRect(right, top, colorBorderLineWidth, lineLength)
						else {
							//Right bridges
							if (!(y > 0 && game.board[x+1][y-1].color === cell.color && game.board[x][y-1].color === cell.color)) ctx.fillRect(right, top, padding * 2 + quadrantBorderWidth, colorBorderLineWidth)
							if (!(y < (nSquares - 1) && game.board[x+1][y+1].color === cell.color && game.board[x][y+1].color === cell.color)) ctx.fillRect(right, bottom, padding * 2 + quadrantBorderWidth, colorBorderLineWidth)
						}

						//Bottom
						if (y === (nSquares - 1) || game.board[x][y+1].color !== cell.color) ctx.fillRect(left, bottom, lineLength, colorBorderLineWidth)
						else {
							//Bottom bridges
							if (!(x > 0 && game.board[x-1][y].color === cell.color && game.board[x-1][y+1].color === cell.color)) ctx.fillRect(left, bottom, colorBorderLineWidth, padding * 2 + quadrantBorderWidth)
							if (!(x < (nSquares - 1) && game.board[x+1][y].color === cell.color && game.board[x+1][y+1].color === cell.color)) ctx.fillRect(right, bottom, colorBorderLineWidth, padding * 2 + quadrantBorderWidth)
						}

						//Left
						if (x === 0 || game.board[x-1][y].color !== cell.color) ctx.fillRect(left, top, colorBorderLineWidth, lineLength)
					}
				}
			}

			//Links
			if (showLinksRef.current && (lockedInputRef.current > 0 || selectedCell.value > 0)){
				const target = lockedInputRef.current > 0 ? lockedInputRef.current : selectedCell.value
				let links = game.calculateLinks(target)
				ctx.fillStyle = ctx.strokeStyle = accentColor === 'red' ? '#c298eb' : '#ff5252'
				links.forEach(link => {
					const noteDelta = noteDeltas.current[target - 1]
					link.forEach(cell => {
						ctx.beginPath()
						ctx.arc(cellPositions.current[cell.x] + noteDelta.x, cellPositions.current[cell.y] + noteDelta.y, squareSize.current / 8, 0, 2 * Math.PI, false)
						ctx.fill()
					})
					if (link.length === 2){
						const correction = Math.floor(linksLineWidth / 2)
						let linkLength = Math.abs(cellPositions.current[link[1].x] - cellPositions.current[link[0].x]) + Math.abs(cellPositions.current[link[1].y] - cellPositions.current[link[0].y])
						//Right
						if (link[0].x < link[1].x) ctx.fillRect(cellPositions.current[link[0].x] + noteDelta.x, cellPositions.current[link[0].y] + noteDelta.y - correction, linkLength, linksLineWidth)
						//Left
						else if (link[0].x > link[1].x) ctx.fillRect(cellPositions.current[link[1].x] + noteDelta.x, cellPositions.current[link[1].y] + noteDelta.y - correction, linkLength, linksLineWidth)
						//Down
						else if (link[0].y < link[1].y) ctx.fillRect(cellPositions.current[link[0].x] + noteDelta.x - correction, cellPositions.current[link[0].y] + noteDelta.y, linksLineWidth, linkLength)
						//Up
						else ctx.fillRect(cellPositions.current[link[1].x] + noteDelta.x - correction, cellPositions.current[link[1].y] + noteDelta.y, linksLineWidth, linkLength)
					}
				})
			}

			//Fade animations
			if (animationColors.current && ['fadein', 'fadein_long', 'fadeout'].includes(currentAnimations.current[0]?.data.type)){
				for (let y = 0; y < nSquares; y++){
					for (let x = 0; x < nSquares; x++){
						ctx.fillStyle = animationColors.current[y]
						ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)

						//Right border
						ctx.fillStyle = `rgba(${x % 3 === 2 ? themes[theme].canvasQuadrantBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas.current[y]})`
						ctx.fillRect(cellPositions.current[x] + squareSize.current, cellPositions.current[y], x % 3 === 2 ? quadrantBorderWidth : cellBorderWidth, squareSize.current)

						//Bottom border
						ctx.fillStyle = `rgba(${y % 3 === 2 ? themes[theme].canvasQuadrantBorderColorRGBA : themes[theme].canvasCellBorderColorRGBA}, ${animationGammas.current[y]})`
						ctx.fillRect(cellPositions.current[x], cellPositions.current[y] + squareSize.current, squareSize.current, y % 3 === 2 ? quadrantBorderWidth : cellBorderWidth)
					}
				}
			}
		} else {
			//Paused
			for (let x = 0; x < nSquares; x++){
				for (let y = 0; y < nSquares; y++){
					ctx.strokeStyle = ctx.fillStyle = darkColors.current.default
					ctx.fillRect(cellPositions.current[x], cellPositions.current[y], squareSize.current, squareSize.current)
				}
			}
		}
	}

	function doAnimation(timestamp){
		//Init colors.current
		animationColors.current = []
		for (let x = 0; x < nSquares; x++){
			animationColors.current.push(Array(nSquares).fill(null))
		}

		let i = 0

		while (i < currentAnimations.current.length){
			const animation = currentAnimations.current[i]
			if (animation.startTime === null) animation.startTime = timestamp
			const progress = (timestamp - animation.startTime) / animationLengths[animation.data.type]

			if (progress < 1){
				switch(animation.data.type){
					case 'row':
						for (let x = 0; x < nSquares; x++) animationColors.current[x][animation.data.center.y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.x - x), progress, 8, 4)})`
						break
					case 'col':
						for (let y = 0; y < nSquares; y++) animationColors.current[animation.data.center.x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.y - y), progress, 8, 4)})`
						break
					case 'quadrant':
						for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) animationColors.current[animation.data.quadrantX*3+x][animation.data.quadrantY*3+y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(y*3+x, progress, 8, 8)})`
						break
					case 'board':
						for (let x = 0; x < nSquares; x++) for (let y = 0; y < nSquares; y++) animationColors.current[x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.max(Math.abs(animation.data.center.x - x), Math.abs(animation.data.center.y - y)), progress, 8, 8)})`
						break
					case 'fadein':
					case 'fadein_long':
							animationGammas.current = []
							for (let y = 0; y < nSquares; y++){
								const gamma = Math.min(Math.max((y - 2 * progress * (nSquares-1)) / (nSquares-1) + 1, 0), 1)
								animationColors.current[y] = `rgba(${themes[theme].canvasAnimationFadeBaseColor}, ${gamma})`
								animationGammas.current.push(gamma)
							}
						break
					case 'fadeout':
						animationGammas.current = []
						for (let y = 0; y < nSquares; y++){
							const gamma = Math.min(Math.max((y - 2 * progress * (nSquares-1)) / (-nSquares+1), 0), 1)
							animationColors.current[y] = `rgba(${themes[theme].canvasAnimationFadeBaseColor}, ${gamma})`
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

		if (currentAnimations.current.length > 0){
			requestAnimationFrame((ts) => {doAnimation(ts)})
		} else {
			animationColors.current = null
			animationGammas.current = null
			renderFrame()
		}
	}

	function screenCoordsToBoardCoords({clientX, clientY}){
		const rect = canvasRef.current.getBoundingClientRect()
		const clickX = (clientX - rect.left) / parseInt(canvasRef.current.offsetWidth, 10) * logicalSize.current
		const clickY = (clientY - rect.top) / parseInt(canvasRef.current.offsetHeight, 10) * logicalSize.current
		for (let x = 0; x < nSquares; x++){
			if (clickX <= cellPositions.current[x] + squareSize.current){
				for (let y = 0; y < nSquares; y++) {
					if (clickY <= cellPositions.current[y] + squareSize.current) return {x, y}
				}
			}
		}
		return null
	}

	function handleInputStart(coords, type){
		lastMouseCell.current = coords
		onClick(coords, type, false)
	}

	function onTouchStart(e){
		if (!noTouch && !paused){
			e.stopPropagation()
			const coords = screenCoordsToBoardCoords(e.targetTouches[0])
			if (coords){
				lastMouseCell.current = coords
				onClick(coords, 'primary', false)
			}
		}	
	}

	function onMouseDown(e){
		e.stopPropagation()
		e.preventDefault()
		if (!noTouch && !isTouchDevice && !paused){
			lastMouseButton.current = e.button === 0 ? 'primary' : (e.button === 2 ? 'secondary' : 'tertiary')
			const coords = screenCoordsToBoardCoords(e)
			if (coords) handleInputStart(coords, lastMouseButton.current)
		}
	}

	function handleInputMove(coords, type){
		if (lastMouseCell.current && (lastMouseCell.current.x !== coords.x || lastMouseCell.current.y !== coords.y)){
			lastMouseCell.current = coords
			onClick(coords, type, true)
		}
	}

	function onTouchMove(e){
		if (!noTouch && !paused){
			e.stopPropagation()
			const coords = screenCoordsToBoardCoords(e.targetTouches[0])
			if (!noTouch && !paused && coords) handleInputMove(coords, 'primary')
		}
	}

	function onMouseMove(e){
		e.stopPropagation()
		if (!noTouch && !isTouchDevice && !paused && lastMouseCell.current){
			const coords = screenCoordsToBoardCoords(e)
			if (coords) handleInputMove(coords, lastMouseButton.current)
		}
	}

	function onContextMenu(e){
		e.preventDefault()
		e.stopPropagation()
	}

	useEffect(() => {
		updateColors()
		resizeCanvas()
		if (nSquares > 3) addAnimations([{type: 'fadein_long'}])

		let resizeEvent = window.addEventListener('resize', resizeCanvas, false)
		let rotateEvent = o9n.orientation.addEventListener('change', resizeCanvas)

		return () => {
			window.removeEventListener('resize', resizeEvent)
			o9n.orientation.removeEventListener('change', rotateEvent)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		updateColors()
		renderFrame()
		// eslint-disable-next-line
	}, [theme])

	useEffect(() => {
		lockedInputRef.current = lockedInput
		showLinksRef.current = showLinks
		pausedRef.current = paused
		renderFrame()
	})

	return (
		<canvas
			style={{...style, touchAction: (noTouch || paused) ? 'auto' : 'none'}}
			ref={canvasRef}
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onContextMenu={onContextMenu}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={() => {lastMouseCell.current = null}}
		/>
	)
})

export default Canvas