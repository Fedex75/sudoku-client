import { Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"
import Board from "./Board"
import { BoardAnimation, CanvasRef, Cell, MouseButtonType, Ruleset } from "../utils/DataTypes"
import { AccentColor, ColorName } from "../utils/Colors"
//@ts-ignore
import o9n from 'o9n'
import { isTouchDevice } from "../utils/isTouchDevice"
import { ThemeName, themes } from './Themes'

const roundedRatio = Math.round(window.devicePixelRatio)

const cellBorderWidth = roundedRatio === 1 ? 2 : 3
const linksLineWidth = roundedRatio === 1 ? 4 : 8
const colorBorderLineWidth = roundedRatio === 1 ? 3 : 6
const cageLineWidth = roundedRatio === 1 ? 2 : 2

function updateColors(theme: ThemeName): Record<ColorName, string>[] {
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
	}

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
	}

	const newSelectedCellColors = theme === 'light' ? {
		default: '#000',
		red: '#fcbdc0',
		orange: '#fcdabd',
		yellow: '#ffe999',
		green: '#a6dec2',
		blueGreen: '#8fccc6',
		lightBlue: '#b6d9f2',
		darkBlue: '#b2c4ed',
		purple: '#d3bceb'
	} : newDarkColors

	return [newColors, newDarkColors, newSelectedCellColors]
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

type Props = {
	onClick?: (coords: Cell[], type: MouseButtonType, hold: boolean) => void
	showLinks?: boolean
	game: Board
	lockedInput?: number
	theme: ThemeName
	accentColor: AccentColor
	paused?: boolean
	notPlayable?: boolean
	style?: React.CSSProperties
	boxBorderWidthFactor?: number
	ruleset: Ruleset
}

const Canvas = forwardRef(({ onClick = () => { }, showLinks = false, game, lockedInput = 0, theme, accentColor, paused = false, notPlayable = false, style, boxBorderWidthFactor = 0.01, ruleset }: Props, ref: Ref<CanvasRef>) => {
	const logicalSize = useRef(0)
	const squareSize = useRef(0)
	const rendererState = useRef<any>({})
	const animationColors = useRef<string[][] | null>(null)
	const animationGammas = useRef<number[] | null>(null)
	const currentAnimations = useRef<BoardAnimation[]>([])
	const hasAddedFadeInAnimation = useRef(false)
	const lastMouseCell = useRef<Cell | null>()
	const lastMouseButton = useRef<MouseButtonType | null>(null)
	const colors = useRef<Record<string, string>>()
	const darkColors = useRef<Record<string, string>>()
	const selectedCellColors = useRef<Record<string, string>>()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const savedRenderFrame = useRef(() => { })

	useImperativeHandle(ref, () => ({
		renderFrame() {
			renderFrame()
		},
		doAnimations(callbacks: BoardAnimation[]) {
			addAnimations(callbacks)
		},
		stopAnimations() {
			currentAnimations.current = []
		}
	}))

	const renderFrame = useCallback(() => {
		if (canvasRef.current === null) return

		const ctx = canvasRef.current.getContext('2d')
		if (!ctx) return
		game.calculateHighlightedCells(lockedInput)
		const boxBorderWidth = logicalSize.current * boxBorderWidthFactor

		let selectedCellsValues = []
		for (const cell of game.selectedCells) {
			if (cell.value > 0) selectedCellsValues.push(cell.value)
		}

		const props = { ctx, themes, theme, logicalSize: logicalSize.current, game, lockedInput, notPlayable, colors: colors.current!, darkColors: darkColors.current!, selectedCellsValues, squareSize: squareSize.current, animationColors: animationColors.current, currentAnimations: currentAnimations.current, accentColor, solutionColors, colorBorderLineWidth, boxBorderWidth, showLinks, linksLineWidth, animationGammas: animationGammas.current, cellBorderWidth, rendererState: rendererState.current, cageLineWidth }

		for (const func of ruleset.render.before) func(props)

		if (!paused || (currentAnimations.current.length > 0 && ['fadein', 'fadeout'].includes(currentAnimations.current[0].type))) for (const func of ruleset.render.unpaused) func(props)
		else for (const func of ruleset.render.paused) func(props)

		for (const func of ruleset.render.after) func(props)
	}, [accentColor, boxBorderWidthFactor, ruleset.render.after, ruleset.render.before, ruleset.render.paused, ruleset.render.unpaused, game, lockedInput, notPlayable, paused, showLinks, theme])

	const doAnimation = useCallback((timestamp: number) => {
		//Init colors.current
		animationColors.current = []
		for (let x = 0; x < game.nSquares; x++) {
			animationColors.current.push(Array(game.nSquares).fill(''))
		}

		let i = 0

		while (i < currentAnimations.current.length) {
			const animation = currentAnimations.current[i]
			if (animation.startTime === null) animation.startTime = timestamp
			const progress = (timestamp - animation.startTime) / animation.duration

			if (progress < 1) {
				animation.func({
					animationColors: animationColors.current,
					themes,
					theme,
					progress
				})
				i++
			} else {
				currentAnimations.current.splice(i, 1)
			}
		}

		savedRenderFrame.current()

		if (currentAnimations.current.length > 0) {
			requestAnimationFrame((ts) => { doAnimation(ts) })
		} else {
			animationColors.current = null
			animationGammas.current = null
			savedRenderFrame.current()
		}
	}, [game, theme])

	const addAnimations = useCallback((data: BoardAnimation[]) => {
		data.forEach(animation => {
			currentAnimations.current.push(animation)
		})
		requestAnimationFrame((ts) => { doAnimation(ts) })
	}, [doAnimation])

	const resizeCanvas = useCallback(() => {
		if (!canvasRef.current) return

		const newSize = canvasRef.current.offsetWidth * roundedRatio
		if (canvasRef.current.width !== newSize || canvasRef.current.height !== newSize) {
			logicalSize.current = canvasRef.current.offsetWidth * roundedRatio
			canvasRef.current.width = logicalSize.current
			canvasRef.current.height = logicalSize.current

			for (const func of ruleset.render.onResize) func({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth, cageLineWidth, themes, theme })

			renderFrame()
		}
	}, [boxBorderWidthFactor, ruleset.render.onResize, game, renderFrame, theme])

	const screenCoordsToBoardCoords = useCallback((clientX: number, clientY: number) => {
		if (!canvasRef.current) return undefined
		const rect = canvasRef.current.getBoundingClientRect()
		const clickX = (clientX - rect.left) / canvasRef.current.offsetWidth * logicalSize.current
		const clickY = (clientY - rect.top) / canvasRef.current.offsetHeight * logicalSize.current
		return ruleset.render.getCellFromScreenCoords(clickX, clickY, { game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth, cageLineWidth, themes, theme })
	}, [boxBorderWidthFactor, ruleset.render, game, theme])

	const handleInputStart = useCallback((cells: Cell[], type: MouseButtonType) => {
		if (cells.length === 1) lastMouseCell.current = cells[0]
		onClick(cells, type, false)
	}, [onClick])

	const onTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
		if (!notPlayable && !paused) {
			e.stopPropagation()
			let cells: Cell[] = []
			for (let i = 0; i < e.targetTouches.length; i++) {
				const newCell = screenCoordsToBoardCoords(e.targetTouches[i].clientX, e.targetTouches[i].clientY)
				if (newCell !== undefined) cells.push(newCell)
			}
			if (cells.length > 0) {
				if (cells.length === 1) lastMouseCell.current = cells[0]
				onClick(cells, 'primary', false)
			}
		}
	}, [notPlayable, onClick, paused, screenCoordsToBoardCoords])

	const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		e.stopPropagation()
		e.preventDefault()
		if (!notPlayable && !isTouchDevice && !paused) {
			lastMouseButton.current = e.button === 0 ? 'primary' : (e.button === 2 ? 'secondary' : 'tertiary')
			const coords = screenCoordsToBoardCoords(e.clientX, e.clientY)
			if (coords) handleInputStart([coords], lastMouseButton.current)
		}
	}, [handleInputStart, notPlayable, paused, screenCoordsToBoardCoords])

	const handleInputMove = useCallback((cells: Cell[], type: MouseButtonType) => {
		if (cells.length === 2) onClick(cells, type, false)
		else if (lastMouseCell.current && cells.length === 1 && lastMouseCell.current !== cells[0]) {
			lastMouseCell.current = cells[0]
			onClick(cells, type, true)
		}
	}, [onClick])

	const onTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
		if (!notPlayable && !paused) {
			e.stopPropagation()
			let cells: Cell[] = []
			for (let i = 0; i < e.targetTouches.length; i++) {
				const newCell = screenCoordsToBoardCoords(e.targetTouches[i].clientX, e.targetTouches[i].clientY)
				if (newCell !== undefined) cells.push(newCell)
			}
			if (!notPlayable && !paused && cells.length > 0) handleInputMove(cells, 'primary')
		}
	}, [handleInputMove, notPlayable, paused, screenCoordsToBoardCoords])

	const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		e.stopPropagation()
		if (!notPlayable && !isTouchDevice && !paused && lastMouseCell.current && lastMouseButton.current) {
			const coords = screenCoordsToBoardCoords(e.clientX, e.clientY)
			if (coords) handleInputMove([coords], lastMouseButton.current)
		}
	}, [handleInputMove, notPlayable, paused, screenCoordsToBoardCoords])

	const onContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		e.preventDefault()
		e.stopPropagation()
	}, [])

	useEffect(() => {
		[colors.current, darkColors.current, selectedCellColors.current] = updateColors(theme)
		if (canvasRef.current) {
			resizeCanvas()
			renderFrame()

			const resizeObserver = new ResizeObserver((entries) => {
				for (let i = 0; i < entries.length; i++) {
					resizeCanvas()
					renderFrame()
				}
			})

			resizeObserver.observe(canvasRef.current)

			return () => {
				resizeObserver.disconnect()
			}
		}
	}, [resizeCanvas, renderFrame, theme])

	useEffect(() => {
		if (!hasAddedFadeInAnimation.current && !notPlayable) {
			addAnimations([{
				type: 'fadein',
				startTime: null,
				duration: 1350,
				func: ({ animationColors, progress }) => {
					animationGammas.current = []
					for (let y = 0; y < game.nSquares; y++) {
						const gamma = Math.min(Math.max((y - 2 * progress * (game.nSquares - 1)) / (game.nSquares - 1) + 1, 0), 1)
						for (let x = 0; x < game.nSquares; x++) animationColors[x][y] = `rgba(${themes[theme].canvasAnimationFadeBaseColor}, ${gamma})`
						animationGammas.current.push(gamma)
					}
				}
			}])
			hasAddedFadeInAnimation.current = true
		}
	}, [addAnimations, notPlayable, game, theme])

	useEffect(() => {
		window.addEventListener('resize', resizeCanvas, false)
		o9n.orientation.addEventListener('change', resizeCanvas)

		return () => {
			window.removeEventListener('resize', resizeCanvas)
			o9n.orientation.removeEventListener('change', resizeCanvas)
		}
	}, [resizeCanvas])

	useEffect(() => {
		if (notPlayable) return

		if (paused) {
			addAnimations([{
				type: 'fadeout',
				startTime: null,
				duration: 500,
				func: ({ animationColors, progress }) => {
					animationGammas.current = []
					for (let y = 0; y < game.nSquares; y++) {
						const gamma = Math.min(Math.max((y - 2 * progress * (game.nSquares - 1)) / (-game.nSquares + 1), 0), 1)
						for (let x = 0; x < game.nSquares; x++) animationColors[x][y] = `rgba(${themes[theme].canvasAnimationFadeBaseColor}, ${gamma})`
						animationGammas.current.push(gamma)
					}
				}
			}])
		} else {
			if (currentAnimations.current.length === 0) addAnimations([{
				type: 'fadein',
				startTime: null,
				duration: 500,
				func: ({ animationColors, progress }) => {
					animationGammas.current = []
					for (let y = 0; y < game.nSquares; y++) {
						const gamma = Math.min(Math.max((y - 2 * progress * (game.nSquares - 1)) / (game.nSquares - 1) + 1, 0), 1)
						for (let x = 0; x < game.nSquares; x++) animationColors[x][y] = `rgba(${themes[theme].canvasAnimationFadeBaseColor}, ${gamma})`
						animationGammas.current.push(gamma)
					}
				}
			}])
		}
	}, [paused, addAnimations, notPlayable, game, theme])

	useEffect(() => {
		[colors.current, darkColors.current, selectedCellColors.current] = updateColors(theme)
		renderFrame()
	}, [theme, accentColor, renderFrame])

	useEffect(() => {
		for (const func of ruleset.render.init) func({ game, rendererState, squareSize, logicalSize, boxBorderWidthFactor, cellBorderWidth, cageLineWidth, themes, theme })
	}, [boxBorderWidthFactor, ruleset.render.init, game, theme])

	useEffect(() => {
		savedRenderFrame.current = renderFrame
	}, [renderFrame])

	return <canvas
		ref={canvasRef}
		className='sudoku-canvas'
		style={{ ...style, touchAction: (notPlayable || paused) ? 'auto' : 'none', boxSizing: 'border-box' }}
		onTouchStart={onTouchStart}
		onTouchMove={onTouchMove}
		onContextMenu={onContextMenu}
		onMouseDown={onMouseDown}
		onMouseMove={onMouseMove}
		onMouseUp={() => { lastMouseCell.current = null; lastMouseButton.current = null }}
	/>
})

export default Canvas
