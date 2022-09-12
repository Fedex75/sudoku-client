import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import SettingsHandler from '../../utils/SettingsHandler'
import o9n from 'o9n'

let squareSize
let cellPositions = []
let valuePositions = []
let noteDeltas = []
let animationColors = null
let currentAnimations = []
const borderWidth = 2

const animationLengths = {
	row: 500,
	col: 500,
	quadrant: 500,
	board: 1350, //Must be equal to the timeout delay on Sudoku.js
}

const k = 0.2

function brightness(x, p, q, l){
	let t = (-q-l)*p+l
	return Math.max(0, k*(1-Math.abs(2/l*(x+t)-1)))
}

const themes = {
	light: {
		canvasLightDefaultCellColor: 'white',
		canvasDarkDefaultCellColor: '#e2ebf3',
		canvasCellBorderColor: '#bec6d4',
		canvasQuadrantBorderColor: '#344861',
		canvasClueColor: '#344861',
		canvasSolutionColor: '#4b7bec',
		canvasSelectedCellBackground: '#bbdefb',
		canvasSameValueCellBackground: '#c3d7ea',
		canvasNoteHighlightColor: 'black',
		canvasAnimationBaseColor: '0, 0, 0',
		canvasKillerCageColor: '#344861',
		canvasKillerHighlightedCageColor: 'black',
	},
	dark: {
		canvasLightDefaultCellColor: '#25242c',
		canvasDarkDefaultCellColor: '#161620',
		canvasCellBorderColor: 'black',
		canvasQuadrantBorderColor: 'black',
		canvasClueColor: '#75747c',
		canvasSolutionColor: '#6f90c3',
		canvasSelectedCellBackground: '#153b79',
		canvasSameValueCellBackground: '#0f0e12',
		canvasNoteHighlightColor: 'white',
		canvasAnimationBaseColor: '255, 255, 255',
		canvasKillerCageColor: '#75747c',
  	canvasKillerHighlightedCageColor: 'white',
	}
}

const Canvas = forwardRef(({
		game,
		lockedInput = 0,
		showLinks = false,
		onClick = () => {},
		nSquares = 9,
		autoSize = true,
		size = null,
		showSelectedCell = true,
		canvasSize = 500,
		noTouch = false,
		theme
}, ref) => {	
	
	useImperativeHandle(ref, () => ({
		renderFrame(){
			renderFrame()
		},
		doAnimation(data){
			data.forEach(animation => {
				currentAnimations.push({
					data: animation,
					startTime: -1
				})
			})
			requestAnimationFrame((timestamp) => {doAnimation(timestamp)})
		},
		stopAnimations(){
			currentAnimations = []
		}
	}))

	const canvasRef = useRef(null)
	const wrapperRef = useRef(null)
	const lastMouseCell = useRef(null)

	const lockedInputRef = useRef()
	const showLinksRef = useRef()

	function resizeCanvas(){
		if (!canvasRef.current) return
		const val = autoSize ?
		//`${window.visualViewport.width > 880 ? Math.min(window.visualViewport.width, canvasSize) : Math.min(Math.min(window.visualViewport.height - 350, window.visualViewport.width - 6), canvasSize)}px`
		`${Math.min(window.visualViewport.height - 340, window.visualViewport.width - 4, canvasSize)}px`
		: size
		canvasRef.current.style.width = val
		canvasRef.current.style.height = val
	}

	useEffect(() => {
		resizeCanvas()
		const thickBorders = Math.floor(nSquares / 3) + 1
		squareSize = (canvasRef.current.width - (thickBorders * 2 + nSquares - thickBorders + 1)) / nSquares

		for (let i = 0; i < nSquares; i++){
			cellPositions.push([])
			valuePositions.push([])
		}

		let posY = 2
		for (let y = 0; y < nSquares; y++){
			let posX = 2
			for (let x = 0; x < nSquares; x++){
				//Cell positions
				cellPositions[x][y] = {x: posX, y: posY}
				posX += squareSize + 1
				if ((x + 1) % 3 === 0) posX += borderWidth - 1
				//Value positions
				valuePositions[x][y] = {
					x: cellPositions[x][y].x + squareSize / 2,
					y: cellPositions[x][y].y + squareSize / 2
				}
			}
			posY += squareSize + 1
			if ((y + 1) % 3 === 0) posY += borderWidth - 1
		}

		let resizeEvent = window.addEventListener('resize', resizeCanvas, false)
		let rotateEvent = o9n.orientation.addEventListener('change', resizeCanvas)

		const wrapper = wrapperRef.current
		let touchStartEvent
		if (!noTouch){
			touchStartEvent = wrapper.addEventListener('touchstart', (e) => {
				e.preventDefault()
			}, {passive: false})
		}

		return () => {
			window.removeEventListener('resize', resizeEvent)
			o9n.orientation.removeEventListener('change', rotateEvent)
			if (!noTouch) wrapper.removeEventListener('touchstart', touchStartEvent)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	function line(ctx, x1, y1, x2, y2){
		ctx.beginPath()
		ctx.moveTo(x1, y1)
		ctx.lineTo(x2, y2)
		ctx.stroke()
	}

	function renderFrame(){
		if (canvasRef.current === null) return
		const colors = {
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
	
		const darkColors = {
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
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		let selectedCell = game.getSelectedCell()
		let highlitedCells = game.calculateHighlightedCells(game.selectedCell, lockedInputRef.current)

		//Background
		ctx.fillStyle = themes[theme].canvasCellBorderColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

		//Borders
		ctx.fillStyle = themes[theme].canvasQuadrantBorderColor
		ctx.fillRect(0, 0, borderWidth, canvasSize)
		ctx.fillRect(0, 0, canvasSize, borderWidth)
		for (let i = 2; i < nSquares; i += 3){
			ctx.fillRect(cellPositions[i][0].x + squareSize, 0, borderWidth, canvasSize)
			ctx.fillRect(0, cellPositions[0][i].y + squareSize, canvasSize, borderWidth)
		}

		//Draw cells
		for (let x = 0; x < nSquares; x++){
			for (let y = 0; y < nSquares; y++) {
				const cell = game.get({x, y})
				const isSelectedCell = game.selectedCell.x === x && game.selectedCell.y === y
				const hasSameValueAsSelected = ((lockedInputRef.current > 0 && lockedInputRef.current === cell.value) || (lockedInputRef.current === 0 && selectedCell.value > 0 && selectedCell.value === cell.value))
				//Cell background
				ctx.setLineDash([])
				
				ctx.fillStyle =
					!showSelectedCell ? colors.default :
					isSelectedCell ? themes[theme].canvasSelectedCellBackground :
					hasSameValueAsSelected ? themes[theme].canvasSameValueCellBackground : //Cell has same value as selected cell
					highlitedCells[x][y] ? darkColors.default : //Cell in same row or column as any cell with the same value as the selected cell
					colors.default //Default

				ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize)

				if (animationColors && animationColors[x][y]){
					ctx.fillStyle = animationColors[x][y]
					ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize)
				}

				if (game.mode === 'killer'){
					//Cages
					const cagePadding = 2.5
					const hShift = cell.cageValue > 9 ? 16 : (cell.cageValue > 0 ? 8 : 2.5)
					const vShift = cell.cageValue > 0 ? 12 : 2.5
					//Borders
					ctx.strokeStyle = (cell.cageIndex === selectedCell.cageIndex && game.nSquares > 3) ? themes[theme].canvasKillerHighlightedCageColor : themes[theme].canvasKillerCageColor
					ctx.fillStyle = ctx.strokeStyle
					ctx.setLineDash([5, 5])
					ctx.lineWidth = 1
					//Top
					if (y === 0 || game.board[x][y-1].cageIndex !== cell.cageIndex){
						ctx.beginPath()
						ctx.moveTo(cellPositions[x][y].x + cagePadding + hShift, cellPositions[x][y].y + cagePadding); //Top left
						ctx.lineTo(cellPositions[x][y].x + squareSize - cagePadding, cellPositions[x][y].y + cagePadding); //Top right
						ctx.stroke()
					}
					//Right
					if (x === (nSquares - 1) || game.board[x+1][y].cageIndex !== cell.cageIndex){
						ctx.beginPath()
						ctx.moveTo(cellPositions[x][y].x + squareSize - cagePadding, cellPositions[x][y].y + cagePadding + 2.5); //Top right
						ctx.lineTo(cellPositions[x][y].x + squareSize - cagePadding, cellPositions[x][y].y + squareSize - cagePadding); //Bottom right
						ctx.stroke()
					} else {
						//Right bridges
						ctx.beginPath();						
						if (!(y > 0 && game.board[x+1][y-1].cageIndex === cell.cageIndex && game.board[x][y-1].cageIndex === cell.cageIndex)){
							ctx.moveTo(cellPositions[x][y].x + squareSize - cagePadding, cellPositions[x][y].y + cagePadding); //Top right
							ctx.lineTo(cellPositions[x+1][y].x + cagePadding, cellPositions[x+1][y].y + cagePadding); //Right cell's top left
						}
						if (!(y < (nSquares - 1) && game.board[x+1][y+1].cageIndex === cell.cageIndex && game.board[x][y+1].cageIndex === cell.cageIndex)){
							ctx.moveTo(cellPositions[x][y].x + squareSize - cagePadding, cellPositions[x][y].y + squareSize - cagePadding); //Bottom right
							ctx.lineTo(cellPositions[x+1][y].x + cagePadding, cellPositions[x+1][y].y + squareSize - cagePadding); //Right cell's bottom left
						}						
						ctx.stroke()
					}
					//Bottom
					if (y === (nSquares - 1) || game.board[x][y+1].cageIndex !== cell.cageIndex){
						ctx.beginPath()
						ctx.moveTo(cellPositions[x][y].x + squareSize - cagePadding - 2.5, cellPositions[x][y].y + squareSize - cagePadding); //Bottom right
						ctx.lineTo(cellPositions[x][y].x + cagePadding, cellPositions[x][y].y + squareSize - cagePadding); //Bottom left
						ctx.stroke()
					} else {
						//Bottom bridges
						ctx.beginPath()
						if (!(x > 0 && game.board[x-1][y].cageIndex === cell.cageIndex && game.board[x-1][y+1].cageIndex === cell.cageIndex)){
							ctx.moveTo(cellPositions[x][y].x + cagePadding, cellPositions[x][y].y + squareSize - cagePadding); //Bottom left
							ctx.lineTo(cellPositions[x][y+1].x + cagePadding, cellPositions[x][y+1].y + cagePadding); //Bottom cell's top left
						}
						if (!(x < (nSquares - 1) && game.board[x+1][y].cageIndex === cell.cageIndex && game.board[x+1][y+1].cageIndex === cell.cageIndex)){
							ctx.moveTo(cellPositions[x][y].x + squareSize - cagePadding, cellPositions[x][y].y + squareSize - cagePadding); //Bottom right
							ctx.lineTo(cellPositions[x][y+1].x + squareSize - cagePadding, cellPositions[x][y+1].y + cagePadding); //Bottom cell's top right
						}
						ctx.stroke()
					}
					//Left
					if (x === 0 || game.board[x-1][y].cageIndex !== cell.cageIndex){
						ctx.beginPath()
						ctx.moveTo(cellPositions[x][y].x + cagePadding, cellPositions[x][y].y + squareSize - cagePadding - 2.5); //Bottom left
						ctx.lineTo(cellPositions[x][y].x + cagePadding, cellPositions[x][y].y + cagePadding + vShift); //Top left
						ctx.stroke()
					}

					//Cage sum
					if (cell.cageValue > 0){
						ctx.textAlign = 'left'
						ctx.textBaseline = 'top'
						ctx.font = `${squareSize * 0.24}px Arial`
						ctx.fillText(cell.cageValue, cellPositions[x][y].x + 2, cellPositions[x][y].y + 2)
					}
				}

				if (cell.value > 0){
					//Number
					ctx.textAlign = "center"
					ctx.textBaseline = "middle"
					//ctx.font = '40px Arial'
					ctx.font = `${squareSize * 0.74}px Arial`
					const isError = SettingsHandler.settings.checkMistakes && cell.value !== cell.solution && cell.solution > 0
					ctx.fillStyle = 
						isError ? '#fc5c65' :
						cell.clue ? themes[theme].canvasClueColor :
						themes[theme].canvasSolutionColor
					if (isError && cell.color !== 'default') ctx.strokeStyle = 'white'
					else ctx.strokeStyle = ctx.fillStyle
					ctx.fillText(cell.value, valuePositions[x][y].x, valuePositions[x][y].y)
				} else {
					//Candidates
					for (const n of cell.notes){
						ctx.fillStyle = 
						(lockedInputRef.current === 0 && selectedCell.value === n) || lockedInputRef.current === n ? themes[theme].canvasNoteHighlightColor :
						'#75747c'
						
						ctx.textAlign = "center"
						ctx.textBaseline = "middle"
						ctx.font = `${squareSize * (game.mode === 'classic' ? 0.3 : 0.22)}px Arial`
						
						ctx.fillText(n, cellPositions[x][y].x + noteDeltas[n-1].x, cellPositions[x][y].y + noteDeltas[n-1].y)
					}
				}
			}
		}

		for (let x = 0; x < nSquares; x++){
			for (let y = 0; y < nSquares; y++) {
				const cell = game.get({x, y})

				//Color
				if (cell.color !== 'default'){
					ctx.strokeStyle = colors[cell.color]
					ctx.lineWidth = 2

					const left = cellPositions[x][y].x + 2
					const right = left + squareSize - 4
					const top = cellPositions[x][y].y + 2
					const bottom = top + squareSize - 4

					//Top
					if (y === 0 || game.board[x][y-1].color !== cell.color) line(ctx, left - 1, top, right + 1, top)
					
					//Right
					if (x === (nSquares - 1) || game.board[x+1][y].color !== cell.color) line(ctx, right, top, right, bottom)
					else {
						//Right bridges
						if (!(y > 0 && game.board[x+1][y-1].color === cell.color && game.board[x][y-1].color === cell.color)) line(ctx, right, top, right + 4, top)
						if (!(y < (nSquares - 1) && game.board[x+1][y+1].color === cell.color && game.board[x][y+1].color === cell.color)) line(ctx, right, bottom, right + 4, bottom)
					}

					//Bottom
					if (y === (nSquares - 1) || game.board[x][y+1].color !== cell.color) line(ctx, left - 1, bottom, right + 1, bottom)
					else {
						//Bottom bridges
						if (!(x > 0 && game.board[x-1][y].color === cell.color && game.board[x-1][y+1].color === cell.color)) line(ctx, left, bottom - 1, left, bottom + 5)
						if (!(x < (nSquares - 1) && game.board[x+1][y].color === cell.color && game.board[x+1][y+1].color === cell.color)) line(ctx, right, bottom - 1, right, bottom + 5)
					}

					//Left
					if (x === 0 || game.board[x-1][y].color !== cell.color) line(ctx, left, top, left, bottom)
				}
			}
		}

		if (showLinksRef.current && (lockedInputRef.current > 0 || selectedCell.value > 0)){
			//Draw links
			const target = lockedInputRef.current > 0 ? lockedInputRef.current : selectedCell.value
			let links = game.calculateLinks(target)
			ctx.fillStyle = '#ff5252'
			ctx.strokeStyle = '#ff5252'
			ctx.setLineDash([])
			links.forEach(link => {
				link.forEach(cell => {
					ctx.beginPath()
					ctx.arc(cellPositions[cell.x][cell.y].x + noteDeltas[target - 1].x, cellPositions[cell.x][cell.y].y + noteDeltas[target - 1].y, squareSize / 8, 0, 2 * Math.PI, false)
					ctx.fill()
				})
				if (link.length === 2){
					ctx.beginPath()
					ctx.moveTo(cellPositions[link[0].x][link[0].y].x + noteDeltas[target - 1].x, cellPositions[link[0].x][link[0].y].y + noteDeltas[target - 1].y)
					ctx.lineWidth = 4
					ctx.lineTo(cellPositions[link[1].x][link[1].y].x + noteDeltas[target - 1].x, cellPositions[link[1].x][link[1].y].y + noteDeltas[target - 1].y)
					ctx.stroke()
				}
			})
		}
	}

	function doAnimation(timestamp){
		//Init colors
		animationColors = []
		for (let x = 0; x < nSquares; x++){
			animationColors.push(Array(nSquares).fill(null))
		}

		let i = 0

		while (i < currentAnimations.length){
			let animation = currentAnimations[i]
			if (animation.startTime < 0) animation.startTime = timestamp
			let progress = (timestamp - animation.startTime) / animationLengths[animation.data.type]

			if (progress < 1){
				switch(animation.data.type){
					case 'row':
						for (let x = 0; x < nSquares; x++){
							animationColors[x][animation.data.center.y] = `rgba(${themes[theme].canvasAnimationBaseColor}), ${brightness(Math.abs(animation.data.center.x - x), progress, 8, 4)})`
						}
						break
					case 'col':
						for (let y = 0; y < nSquares; y++){
							animationColors[animation.data.center.x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.y - y), progress, 8, 4)})`
						}
						break
					case 'quadrant':
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								animationColors[animation.data.quadrantX*3+x][animation.data.quadrantY*3+y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(y*3+x, progress, 8, 8)})`
							}
						}
						break
					case 'board':
						for (let x = 0; x < nSquares; x++){
							for (let y = 0; y < nSquares; y++){
								animationColors[x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.max(Math.abs(animation.data.center.x - x), Math.abs(animation.data.center.y - y)), progress, 8, 8)})`
							}
						}
						break
					default:
						break
				}
				i++
			} else {
				currentAnimations.splice(i, 1)
			}
		}

		renderFrame()

		if (currentAnimations.length > 0){
			requestAnimationFrame((ts) => {doAnimation(ts)})
		} else {
			animationColors = null
			renderFrame()
		}
	}

	useEffect(() => {
		lockedInputRef.current = lockedInput
		showLinksRef.current = showLinks

		//Candidate positions
		noteDeltas = []
		for (let n = 0; n < nSquares; n++){
			if (game.mode === 'classic'){
				noteDeltas.push({
					x: squareSize * ((n % 3 + 1) * 0.25),
					y: squareSize * ((Math.floor(n / 3) + 1) * 0.3 - 0.08)
				})
			} else {
				noteDeltas.push({
					x: squareSize * ((n % 3 + 1.5) * 0.2),
					y: squareSize * ((Math.floor(n / 3) + 2) * 0.22 - 0.08)
				})
			}
		}
		
		renderFrame()
	})

	function screenCoordsToBoardCoords(clientX, clientY){
		const rect = canvasRef.current.getBoundingClientRect()
		const clickX = (clientX - rect.left) / parseInt(canvasRef.current.style.width, 10) * canvasSize
		const clickY = (clientY - rect.top) / parseInt(canvasRef.current.style.height, 10) * canvasSize
		for (let x = 0; x < nSquares; x++){
			if (clickX <= cellPositions[x][0].x + squareSize){
				for (let y = 0; y < nSquares; y++) {
					if (clickY <= cellPositions[0][y].y + squareSize) return {x, y}
				}
			}
		}
		return null
	}

	function onTouchStart(e){
		if (!noTouch){
			e.stopPropagation()
			
			const coords = screenCoordsToBoardCoords(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
			if (coords){
				lastMouseCell.current = coords
				onClick(coords, false)
			}
		}	
	}

	function onTouchMove(e){
		if (!noTouch){
			e.stopPropagation()
			
			const coords = screenCoordsToBoardCoords(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
			if (!noTouch && coords && lastMouseCell.current && (lastMouseCell.current.x !== coords.x || lastMouseCell.current.y !== coords.y)){
				lastMouseCell.current = coords
				onClick(coords, true)
			}
		}
	}

	function onContextMenu(e){
		if (!noTouch){
			e.stopPropagation()
			e.preventDefault()
		}
	}

	return (
		<div className='canvas__wrapper' ref={wrapperRef}>
			<canvas
				style={{touchAction: noTouch ? 'auto' : 'none'}}
				ref={canvasRef}
				width={canvasSize}
				height={canvasSize}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onContextMenu={onContextMenu}
			/>
		</div>
	)
})

export default Canvas