import React, { useState, useEffect, useRef } from 'react'
import ThemeHandler from '../utils/ThemeHandler'
import SettingsHandler from '../utils/SettingsHandler'
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

const Canvas = ({lockedInput = 0, game, showLinks = false, setAnimationCallback = () => {}, onClick = () => {}, nSquares = 9, autoSize = true, size = null, showSelectedCell = true, canvasSize = 500}) => {
	const canvasRef = useRef(null)
	const lastMouseCell = useRef(null)
	const mouseButton = useRef(null)
	const [, setRender] = useState(0)

	function resizeCanvas(){
		if (!canvasRef.current) return
		const val = autoSize ?
		//`${window.visualViewport.width > 880 ? Math.min(window.visualViewport.width, canvasSize) : Math.min(Math.min(window.visualViewport.height - 350, window.visualViewport.width - 6), canvasSize)}px`
		`${Math.min(window.visualViewport.height - 340, window.visualViewport.width, canvasSize)}px`
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
		const canvas = canvasRef.current
		let touchStartEvent = canvas.addEventListener('touchstart', onTouchStart, {passive: false}); 
		let touchMoveEvent = canvas.addEventListener('touchmove', onTouchMove, {passive: false})

		return () => {
			window.removeEventListener('resize', resizeEvent)
			o9n.orientation.removeEventListener('change', rotateEvent)
			canvas.removeEventListener('touchstart', touchStartEvent)
			canvas.removeEventListener('touchmove', touchMoveEvent)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	function renderFrame(){
		if (canvasRef.current === null) return
		const colors = {
			default: ThemeHandler.theme.canvasLightDefaultCellColor,
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
			default: ThemeHandler.theme.canvasDarkDefaultCellColor,
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
		let highlitedCells = game.calculateHighlightedCells(game.selectedCell, lockedInput)

		//Background
		ctx.fillStyle = ThemeHandler.theme.canvasCellBorderColor
    	ctx.fillRect(0, 0, canvas.width, canvas.height)

		//Borders
		ctx.fillStyle = ThemeHandler.theme.canvasQuadrantBorderColor
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
				const hasSameValueAsSelected = ((lockedInput > 0 && lockedInput === cell.value) || (lockedInput === 0 && selectedCell.value > 0 && selectedCell.value === cell.value))
				const hasColor = cell.color !== 'default'
				//Cell background
				ctx.setLineDash([])

				if (hasColor){
					ctx.fillStyle = colors[cell.color]
					ctx.fillRect(cellPositions[x][y].x + 1, cellPositions[x][y].y + 1, squareSize - 2, squareSize - 2)
				}

				ctx.fillStyle =
					!showSelectedCell ? colors.default :
					isSelectedCell ? ThemeHandler.theme.canvasSelectedCellBackground :
					hasSameValueAsSelected ? ThemeHandler.theme.canvasSameValueCellBackground : //Cell has same value as selected cell
					highlitedCells[x][y] ? darkColors.default : //Cell in same row or column as any cell with the same value as the selected cell
					colors.default //Default

				if (hasColor){
					ctx.fillRect(cellPositions[x][y].x + (game.mode === 'classic' ? 3 : 2), cellPositions[x][y].y + (game.mode === 'classic' ? 3 : 2), squareSize - (game.mode === 'classic' ? 6 : 4), squareSize - (game.mode === 'classic' ? 6 : 4))
				} else {
					ctx.fillRect(cellPositions[x][y].x, cellPositions[x][y].y, squareSize, squareSize)
				}

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
					ctx.strokeStyle = ThemeHandler.theme.canvasKillerCageColor
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
						//ctx.font = '13px Arial'
						ctx.font = `${squareSize * 0.24}px Arial`
						ctx.fillStyle = ThemeHandler.theme.canvasKillerCageColor
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
						isError ? 'red' :
						cell.clue ? ThemeHandler.theme.canvasClueColor :
						ThemeHandler.theme.canvasSolutionColor
					if (isError && hasColor) ctx.strokeStyle = 'white'
					else ctx.strokeStyle = ctx.fillStyle
					ctx.fillText(cell.value, valuePositions[x][y].x, valuePositions[x][y].y)
				} else {
					//Candidates
					for (const n of cell.notes){
						ctx.fillStyle = 
						(lockedInput === 0 && selectedCell.value === n) || lockedInput === n ? ThemeHandler.theme.canvasNoteHighlightColor :
						'#75747c'
						
						ctx.textAlign = "center"
						ctx.textBaseline = "middle"
						ctx.font = `${squareSize * (game.mode === 'classic' ? 0.3 : 0.22)}px Arial`
						
						ctx.fillText(n, cellPositions[x][y].x + noteDeltas[n-1].x, cellPositions[x][y].y + noteDeltas[n-1].y)
					}
				}
			}
		}

		if (showLinks && (lockedInput > 0 || selectedCell.value > 0)){
			//Draw links
			const target = lockedInput > 0 ? lockedInput : selectedCell.value
			let links = game.calculateLinks(target)
			ctx.fillStyle = 'red'
			ctx.strokeStyle = 'red'
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
							animationColors[x][animation.data.center.y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.x - x), progress, 8, 4)})`
						}
						break
					case 'col':
						for (let y = 0; y < nSquares; y++){
							animationColors[animation.data.center.x][y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(Math.abs(animation.data.center.y - y), progress, 8, 4)})`
						}
						break
					case 'quadrant':
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								animationColors[animation.data.quadrantX*3+x][animation.data.quadrantY*3+y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(y*3+x, progress, 8, 8)})`
							}
						}
						break
					case 'board':
						for (let x = 0; x < nSquares; x++){
							for (let y = 0; y < nSquares; y++){
								animationColors[x][y] = `rgba(${ThemeHandler.theme.canvasAnimationBaseColor}, ${brightness(Math.max(Math.abs(animation.data.center.x - x), Math.abs(animation.data.center.y - y)), progress, 8, 8)})`
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
		setAnimationCallback((data) => {
			return new Promise((resolve, reject) => {
				data.forEach(animation => {
					currentAnimations.push({
						data: animation,
						startTime: -1
					})
				})
				requestAnimationFrame((timestamp) => {doAnimation(timestamp)})
				resolve()
			})
		})
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
					if (clickY <= cellPositions[0][y].y + squareSize){
						return {
							x: x,
							y: y
						}
					}
				}
			}
		}
		return null
	}

	function handleInputStart(coords, button){
		if (coords){
			lastMouseCell.current = coords
			mouseButton.current = button
			onClick(coords.x, coords.y, button)
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function onMouseDown(e){
		e.stopPropagation()
		e.preventDefault()
		handleInputStart(screenCoordsToBoardCoords(e.clientX, e.clientY), e.button)
	}

	function onTouchStart(e){
		e.stopPropagation()
		e.preventDefault()
		handleInputStart(screenCoordsToBoardCoords(e.targetTouches[0].clientX, e.targetTouches[0].clientY), 0)
	}

	function handleInputMove(coords){
		if (coords && lastMouseCell.current && (lastMouseCell.current.x !== coords.x || lastMouseCell.current.y !== coords.y)){
			lastMouseCell.current = coords
			onClick(coords.x, coords.y, mouseButton.current, true)
			setRender(r => r === 100 ? 0 : r+1)
		}
	}

	function onMouseMove(e){
		e.stopPropagation()
		e.preventDefault()
		handleInputMove(screenCoordsToBoardCoords(e.clientX, e.clientY))
	}

	function onTouchMove(e){
		e.stopPropagation()
		e.preventDefault()
		handleInputMove(screenCoordsToBoardCoords(e.targetTouches[0].clientX, e.targetTouches[0].clientY))
	}

	function onMouseUp(e){
		e.stopPropagation()
		e.preventDefault()
		lastMouseCell.current = null
	}

	function onContextMenu(e){
		e.stopPropagation()
		e.preventDefault()
	}

	function onMouseLeave(e){
		e.stopPropagation()
		e.preventDefault()
		lastMouseCell.current = null
		mouseButton.current = null
	}

	function onTouchEnd(e){
		e.stopPropagation()
		e.preventDefault()
	}

	return (
		<canvas
			style={{touchAction: 'none'}}
			ref={canvasRef}
			width={canvasSize}
			height={canvasSize}
			onContextMenu={onContextMenu}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onTouchEnd={onTouchEnd}
			onMouseLeave={onMouseLeave}
		/>
	)
}

export default Canvas