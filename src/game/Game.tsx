import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import GameHandler from "../utils/GameHandler"
import Numpad from "../components/numpad/Numpad"
import Canvas from "./Canvas"
import { CanvasRef, Cell, CellCoordinates, ColorGroup, KillerCage, MouseButtonType, Ruleset } from "../utils/DataTypes"
import { Navigate } from "react-router"
import { AccentColor, ColorDefinitions, ColorName, colorNames } from "../utils/Colors"
import SettingsHandler from "../utils/SettingsHandler"
import { isTouchDevice } from "../utils/isTouchDevice"
import MagicWandSVG from "../svg/magic_wand"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import ColorCircleSVG from "../svg/color_circle"
import brightness, { union } from "../utils/Utils"
import Board from "./Board"
import { ThemeName } from './Themes'

type Props = {
	theme: ThemeName
	accentColor: AccentColor
	paused: boolean
	handleComplete: () => void
	ruleset: Ruleset,
	boardAnimationDuration: number
	game: Board
}

function Game({ theme, accentColor, paused, handleComplete, ruleset, boardAnimationDuration, game }: Props) {
	const [noteMode, setNoteMode] = useState(isTouchDevice) //If it's a touch device, start with notes on, otherwise off
	const [showLinks, setShowLinks] = useState(false)
	const [lockedInput, setLockedInput] = useState(0)
	const [colorMode, setColorMode] = useState(false)
	const [lockedColor, setLockedColor] = useState<ColorName | null>(null)

	const [dragMode, setDragMode] = useState<boolean | null>(null)

	const [magicWandMode, setMagicWandMode] = useState<'disabled' | 'links' | 'setColor' | 'clearColors'>()
	const [magicWandColor, setMagicWandColor] = useState<ColorName | null>(null)
	const [calculatorValue, setCalculatorValue] = useState<number>(0)

	const [selectMode, setSelectMode] = useState(game ? game.selectedCells.length > 1 : false)
	const [selectedCellBeforeSelectMode, setSelectedCellBeforeSelectMode] = useState<Cell | null>(null)

	const [possibleValues, setPossibleValues] = useState<number[]>([])
	const [completedNumbers, setCompletedNumbers] = useState<number[]>([])

	const [render, setRender] = useState(0)

	const canvasRef = useRef<CanvasRef>(null)

	const updateCalculatorValue = useCallback(() => {
		if (!game) return

		if (game.selectedCells.length < 2) {
			setCalculatorValue(0)
			return
		}

		if (game.mode === 'killer') {
			let selectedCages: KillerCage[] = []

			function selectedCellsMatchCagesExactly(): boolean {
				if (!game) return false

				for (const cell of game.selectedCells) {
					if (cell.value === 0 && cell.cache.cage && !selectedCages.includes(cell.cache.cage)) selectedCages.push(cell.cache.cage)
				}

				for (const cage of selectedCages) {
					for (const cell of cage.members) {
						if (!game.selectedCells.includes(cell)) {
							return false
						}
					}
				}

				return true
			}

			if (selectedCellsMatchCagesExactly()) {
				let sum = 0
				for (const cage of selectedCages) {
					sum += cage.sum
				}
				for (const cell of game.selectedCells) {
					if (cell.value > 0 && cell.cache.cage && !selectedCages.includes(cell.cache.cage)) {
						sum += cell.value
					}
				}
				setCalculatorValue(sum)
			} else {
				setCalculatorValue(0)
			}
		} else if (game.mode === 'sandwich') {
			let shareSameColumn = true
			let shareSameRow = true
			let sum = 0
			for (const cell of game.selectedCells) {
				if (cell.cache.coords.x !== game.selectedCells[0].cache.coords.x) shareSameColumn = false
				if (cell.cache.coords.y !== game.selectedCells[0].cache.coords.y) shareSameRow = false
				sum += cell.value
			}
			if (shareSameRow || shareSameColumn) {
				setCalculatorValue(sum)
			} else {
				setCalculatorValue(0)
			}
		}
	}, [game])

	const updatePossibleValues = useCallback(() => {
		if (!game) return

		let newPossibleValues: number[] = []

		if (SettingsHandler.settings.showPossibleValues) {
			for (const cell of game.selectedCells) {
				for (const v of cell.cache.possibleValues) {
					if (!newPossibleValues.includes(v)) newPossibleValues = newPossibleValues.concat(v)
				}
			}
		} else {
			for (let i = 0; i < game.nSquares; i++) newPossibleValues.push(i + 1)
		}

		setPossibleValues(newPossibleValues)
		setCompletedNumbers(game.getCompletedNumbers())
	}, [game])

	const shuffleMagicWandColor = useCallback(() => {
		if (!game) return

		let selectedColors: ColorName[] = []
		for (const cell of game.selectedCells) {
			if (cell.color !== 'default' && !selectedColors.includes(cell.color)) {
				selectedColors.push(cell.color)
			}

		}

		if (selectedColors.length > 2) {
			setMagicWandMode('disabled')
			setMagicWandColor(accentColor)
		} else {
			if (selectedColors.length === 1) {
				setMagicWandColor(selectedColors[0])
			} else {
				let possibleColorNames: ColorName[] = colorNames.filter(cn => cn !== 'default')
				const orthogonalCells = union(game.selectedCells.map(c => game!.ruleset.game.getOrthogonalCells(game!, c)))
				for (const cell of orthogonalCells) {
					if (cell.color !== 'default') possibleColorNames = possibleColorNames.filter(cn => cn !== cell.color)
				}
				if (magicWandColor === null || !possibleColorNames.includes(magicWandColor)) {
					if (possibleColorNames.length > 0) setMagicWandColor(possibleColorNames[Math.floor(Math.random() * possibleColorNames.length)])
					else setMagicWandColor(accentColor)
				}
			}
		}
	}, [accentColor, magicWandColor, game])

	const updateMagicWandMode = useCallback(() => {
		if (!game) return

		if (colorMode) {
			setMagicWandMode('clearColors')
		} else if (game.selectedCells.length === 1 && (lockedInput !== 0 || game.selectedCells[0].value > 0)) {
			setMagicWandMode('links')
		} else {
			let selectedColors: ColorName[] = []
			for (const cell of game.selectedCells) {
				if (cell.color !== 'default' && !selectedColors.includes(cell.color)) {
					selectedColors.push(cell.color)
				}

			}
			const length = game.selectedCells.length
			if (length === 0 || (length === 1 && game.selectedCells[0].color !== 'default') || selectedColors.length > 1) {
				setMagicWandMode("disabled")
				setMagicWandColor(null)
			} else {
				setMagicWandMode('setColor')
				shuffleMagicWandColor()
			}
		}
		updateCalculatorValue()
	}, [colorMode, lockedInput, updateCalculatorValue, shuffleMagicWandColor, game])

	const handleUserInteraction = useCallback((func: () => void, lastInteractedCell: Cell | null) => {
		if (GameHandler.complete || !game || !canvasRef.current) return

		game.stashBoard()

		func()

		if (game.hasChanged) {
			game.pushBoard()

			do {
				game.hasChanged = false
				for (const func of game.ruleset.game.afterValuesChanged) func(game)
			} while (game.hasChanged)

			game.checkFullNotation()

			if (game.isComplete()) {
				const center: CellCoordinates = lastInteractedCell?.cache.coords || { x: Math.floor(game.nSquares / 2), y: Math.floor(game.nSquares / 2) }
				game.animations = [{
					type: 'board',
					startTime: null,
					duration: boardAnimationDuration,
					func: ({ themes, theme, progress, animationColors }) => {
						if (!game) return
						game.iterateAllCells(cell => { animationColors[cell.cache.coords.x][cell.cache.coords.y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.max(Math.abs(center.x - cell.cache.coords.x), Math.abs(center.y - cell.cache.coords.y)), progress, 8, 8)})` })
					}
				}]
				GameHandler.setComplete()
				handleComplete()
			}

			if (game.animations.length > 0) {
				canvasRef.current?.doAnimations(game.animations)
				game.animations = []
			}
		}

		updatePossibleValues()
		updateMagicWandMode()

		setRender(r => r === 100 ? 0 : r + 1)
	}, [handleComplete, updateMagicWandMode, updatePossibleValues, boardAnimationDuration, game])

	const handleSelect = useCallback((withState: boolean | null) => {
		if (!game) return
		const newState = (withState === null) ? !selectMode : withState
		if (newState) {
			if (game.selectedCells.length > 0) setSelectedCellBeforeSelectMode(game.selectedCells[0])
			else setSelectedCellBeforeSelectMode(null)
			game.selectedCells = []
		} else {
			if (selectedCellBeforeSelectMode) game.selectedCells = [selectedCellBeforeSelectMode]
			else game.selectedCells = []
		}

		setSelectMode(newState)
		updateMagicWandMode()
	}, [selectMode, selectedCellBeforeSelectMode, updateMagicWandMode, game])

	const handleSetColor = useCallback((selectedCells: Cell[], color: ColorName = accentColor) => {
		if (!game || GameHandler.complete || !canvasRef.current || selectedCells.length === 0) return

		let selectedGroups: ColorGroup[] = []
		for (const cell of selectedCells) {
			for (const cg of cell.cache.colorGroups) {
				if (!selectedGroups.includes(cg)) selectedGroups.push(cg)
			}
		}

		for (const cg of selectedGroups) {
			if (cg.members.every(cell => !selectedCells.includes(cell)) || (color !== cg.members[0].color)) {
				// Coincidence is full or coincidence is partial and color is different: remove the group
				game.remove([cg])
			}
		}

		if (color !== 'default' && selectedCells.length > 1) {
			game.createColorGroup(selectedCells, color)
			handleSelect(false)
			setColorMode(false)
		} else game.setColor(selectedCells[0], color)
	}, [accentColor, handleSelect, game])

	const onCanvasClick = useCallback((cells: Cell[], type: MouseButtonType, hold: boolean) => {
		if (!game || GameHandler.complete || !canvasRef.current) return

		if (cells.length === 2) {
			//Select rectangular area
			setSelectMode(true)
			game.selectBox(cells[0], cells[1])
		} else if (cells.length === 1) {
			const cellPossibleValues = cells[0].cache.possibleValues

			if (selectMode) {
				if (hold) {
					game.select(cells[0], dragMode)
				} else {
					setDragMode(game.select(cells[0]))
				}
			} else if (type === 'tertiary') {
				// Middle mouse button, set color
				handleUserInteraction(() => { handleSetColor(cells) }, cells[0])
			} else {
				if (colorMode) {
					if (lockedColor) {
						if (hold) {
							if ((cells[0].color === lockedColor) !== dragMode) {
								handleUserInteraction(() => { handleSetColor(cells, lockedColor) }, cells[0])
							}
						} else {
							setDragMode(cells[0].color !== lockedColor)
							handleUserInteraction(() => { handleSetColor(cells, lockedColor) }, cells[0])
							game.selectedCells = cells
						}
					} else {
						game.selectedCells = cells
					}
				} else {
					if (lockedInput === 0) {
						// No locked input, so select this cell (or its color group) and set the locked input if applicable
						if (hold) {
							game.select(cells[0])
							setDragMode(true)
							setSelectMode(true)
						} else {
							game.selectedCells = cells

							if (cells[0].value > 0 && SettingsHandler.settings.autoChangeInputLock) setLockedInput(cells[0].value)
						}
					} else {
						if (hold) {
							// If the user is dragging the cursor...
							if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
								if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
									// If we're in note mode and the cell has more than one possible value or the user doesn't want to auto solve single possibility cells, set a note
									if (game.onlyAvailableInAnyUnit(cells[0], lockedInput)) {
										game.setNote(lockedInput, cells, true)
									} else {
										game.setNote(lockedInput, cells, dragMode)
									}

								} else {
									// If we're not in note mode or the cell has only one possible value, set the value if the cell doesn't already have a value (this helps with dragging)
									if (cells[0].value === 0) {
										game.setValue([cells[0]], lockedInput)
									}
								}
							}
						} else {
							// The user is not dragging, select the cell and lock the input
							game.selectedCells = cells
							if (cells[0].value > 0) {
								setLockedInput(li => cells[0].value === li ? 0 : cells[0].value)
							} else {
								if ((noteMode || type === 'secondary')) {
									if (SettingsHandler.settings.autoSolveNakedSingles && cellPossibleValues.length === 1) {
										if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
											game.setValue(cells, lockedInput)
										}
									} else {
										if (!SettingsHandler.settings.showPossibleValues || cells[0].notes.includes(lockedInput) || cellPossibleValues.includes(lockedInput)) {
											setDragMode(game.setNote(lockedInput, cells))
										}
									}
								} else {
									if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
										game.setValue(cells, lockedInput)
									}
								}
							}
						}
					}
				}
			}
		}
	}, [dragMode, colorMode, handleSetColor, lockedColor, lockedInput, noteMode, selectMode, handleUserInteraction, game])

	const onNote = useCallback(() => {
		setNoteMode(n => !n)
	}, [])

	const onHint = useCallback(() => {
		if (GameHandler.complete || !game) return
		game.giveHint(game.selectedCells)
	}, [game])

	const onMagicWand = useCallback(() => {
		if (GameHandler.complete || !game) return
		switch (magicWandMode) {
			case 'links':
				setShowLinks(l => !l)
				break
			case 'clearColors':
				handleUserInteraction(() => {
					if (game && !GameHandler.complete) game.clearColors()
				}, null)
				break
			case 'setColor':
				handleUserInteraction(() => {
					if (!game) return

					handleSetColor(game.selectedCells, magicWandColor || accentColor)
					shuffleMagicWandColor()
				}, game.selectedCells[0])
				break
		}
	}, [magicWandMode, handleUserInteraction, accentColor, handleSetColor, magicWandColor, shuffleMagicWandColor, game])

	const onColor = useCallback(() => {
		if (colorMode) {
			setColorMode(false)
		} else {
			setColorMode(true)
		}
	}, [colorMode])

	const onColorButtonClick = useCallback((color: ColorName, type: "primary" | "secondary") => {
		if (type === 'primary') {
			handleUserInteraction(() => { if (game) handleSetColor(game.selectedCells, color) }, (game ? (game.selectedCells.length > 0 ? game.selectedCells[0] : null) : null))
		} else {
			setLockedColor(lc => lc === color ? null : color)
		}
	}, [handleSetColor, handleUserInteraction, game])

	const onUndo = useCallback(() => {
		if (GameHandler.complete || !game || !canvasRef.current) return

		game.popBoard()
		canvasRef.current.stopAnimations()
	}, [game])

	const onErase = useCallback(() => {
		if (GameHandler.complete || !game || !canvasRef.current) return

		game.erase(game.selectedCells)
		canvasRef.current.stopAnimations()
	}, [game])

	const onNumpadButtonClick = useCallback((number: number, type: MouseButtonType) => {
		if (GameHandler.complete || !game || !canvasRef.current) return

		if (type === 'primary') {
			if (possibleValues.includes(number)) {
				if (noteMode && (possibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
					game.setNote(number, game.selectedCells)
				} else {
					if (lockedInput > 0) setLockedInput(number)
					game.setValue(game.selectedCells, number)
				}
			}
		} else setLockedInput(li => li === number ? 0 : number)
	}, [noteMode, possibleValues, lockedInput, game])

	useEffect(() => {
		if (magicWandMode !== 'links') setShowLinks(false)
	}, [magicWandMode])

	useEffect(() => {
		updatePossibleValues()
	}, [updatePossibleValues])

	useEffect(() => {
		canvasRef.current?.renderFrame()
	}, [render, lockedInput, showLinks, selectMode])

	const magicWandIcon = useMemo(() => {
		if (magicWandMode === 'links') {
			return <FontAwesomeIcon icon={faLink} fontSize={30} color="var(--primaryIconColor)" />
		} else if (magicWandMode === 'clearColors') {
			return <ColorCircleSVG />
		} else {
			return <MagicWandSVG fill={magicWandMode === 'setColor' ? ColorDefinitions[magicWandColor || accentColor] : 'var(--primaryIconColor)'} />
		}
	}, [magicWandMode, magicWandColor, accentColor])

	useEffect(() => {
		updateMagicWandMode()
	}, [updateMagicWandMode])

	useEffect(() => {
		if (completedNumbers.includes(lockedInput)) setLockedInput(0)
	}, [lockedInput, completedNumbers])

	if (!game) return <Navigate to="/"></Navigate>

	return (
		<div className="game">
			<div className="sudoku">
				<Canvas
					ref={canvasRef}
					onClick={(coords, type, hold) => { handleUserInteraction(() => { onCanvasClick(coords, type, hold) }, coords[0]) }}
					showLinks={showLinks}
					game={game}
					lockedInput={lockedInput}
					theme={theme}
					accentColor={accentColor}
					paused={paused}
					ruleset={ruleset}
				/>
			</div>
			<Numpad
				onUndo={() => { handleUserInteraction(onUndo, null) }}
				onErase={() => { handleUserInteraction(onErase, null) }}
				onNote={onNote}
				onHint={() => { handleUserInteraction(onHint, null) }}
				onMagicWand={onMagicWand}
				onSelect={() => { handleSelect(null) }}
				onColor={onColor}
				onColorButtonClick={onColorButtonClick}
				onNumpadButtonClick={(number, type) => { handleUserInteraction(() => { onNumpadButtonClick(number, type) }, null) }}

				noteHighlighted={noteMode}
				magicWandHighlighted={showLinks}
				magicWandIcon={magicWandIcon}
				magicWandDisabled={magicWandMode === 'disabled'}
				selectHighlighted={selectMode}

				undoDisabled={GameHandler.complete || game.history.length === 0}
				eraseDisabled={
					GameHandler.complete ||
					game.selectedCells.length === 0 ||
					game.selectedCells.every(cell => {
						return cell.cache.clue || (cell.value === 0 && cell.notes.length === 0 && cell.color === 'default')
					})
				}
				hintDisabled={GameHandler.complete || game.selectedCells.length === 0 || game.selectedCells.every(cell => cell.cache.clue || cell.cache.solution === 0)}
				colorDisabled={false}

				colorMode={colorMode}
				lockedColor={lockedColor}

				lockedInput={lockedInput}
				possibleValues={possibleValues}
				completedNumbers={completedNumbers}

				calculatorValue={calculatorValue}
			/>
		</div>
	)
}

export default Game
