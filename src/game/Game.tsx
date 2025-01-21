import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import GameHandler from "../utils/GameHandler"
import Numpad from "../components/numpad/Numpad"
import Canvas from "./Canvas"
import { CanvasRef, CellCoordinates, ColorGroup, KillerCage, MouseButtonType, Ruleset, ThemeName } from "../utils/DataTypes"
import { Navigate } from "react-router"
import { AccentColor, ColorDefinitions, ColorName, colorNames } from "../utils/Colors"
import SettingsHandler from "../utils/SettingsHandler"
import { isTouchDevice } from "../utils/isTouchDevice"
import MagicWandSVG from "../svg/magic_wand"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import ColorCircleSVG from "../svg/color_circle"
import brightness, { indexOf, union } from "../utils/Utils"
import Board from "./Board"

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
	const [selectedCellBeforeSelectMode, setSelectedCellBeforeSelectMode] = useState<CellCoordinates | null>(null)

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

				for (const c of game.selectedCells) {
					const cell = game.get(c)
					if (cell.value === 0 && cell.cache.cage && !selectedCages.includes(cell.cache.cage)) selectedCages.push(cell.cache.cage)
				}

				for (const cage of selectedCages) {
					for (const coords of cage.members) {
						if (indexOf(coords, game.selectedCells) === -1) {
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
				for (const c of game.selectedCells) {
					const cell = game.get(c)
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
			for (const c of game.selectedCells) {
				if (c.x !== game.selectedCells[0].x) shareSameColumn = false
				if (c.y !== game.selectedCells[0].y) shareSameRow = false
				sum += game.get(c).value
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
			for (const c of game.selectedCells) {
				for (const v of game.get(c).cache.possibleValues) {
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
		for (const c of game.selectedCells) {
			const cell = game.get(c)
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
				for (const c of orthogonalCells) {
					const cell = game.get(c)
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
		} else if (game.selectedCells.length === 1 && (lockedInput !== 0 || game.get(game.selectedCells[0]).value > 0)) {
			setMagicWandMode('links')
		} else {
			let selectedColors: ColorName[] = []
			for (const c of game.selectedCells) {
				const cell = game.get(c)
				if (cell.color !== 'default' && !selectedColors.includes(cell.color)) {
					selectedColors.push(cell.color)
				}

			}
			const length = game.selectedCells.length
			if (length === 0 || (length === 1 && game.get(game.selectedCells[0]).color !== 'default') || selectedColors.length > 1) {
				setMagicWandMode("disabled")
				setMagicWandColor(null)
			} else {
				setMagicWandMode('setColor')
				shuffleMagicWandColor()
			}
		}
		updateCalculatorValue()
	}, [colorMode, lockedInput, updateCalculatorValue, shuffleMagicWandColor, game])

	const handleUserInteraction = useCallback((func: () => void, lastInteractionCoords: CellCoordinates | null) => {
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
				const center = lastInteractionCoords || { x: Math.floor(game.nSquares / 2), y: Math.floor(game.nSquares / 2) }
				game.animations = [{
					type: 'board',
					startTime: null,
					duration: boardAnimationDuration,
					func: ({ animationColors, themes, theme, progress }) => {
						if (!game) return
						game.iterateAllCells((cell, { x, y }) => { animationColors[x][y] = `rgba(${themes[theme].canvasAnimationBaseColor}, ${brightness(Math.max(Math.abs(center.x - x), Math.abs(center.y - y)), progress, 8, 8)})` })
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

	const handleSetColor = useCallback((selectedCoords: CellCoordinates[], color: ColorName = accentColor) => {
		if (!game || GameHandler.complete || !canvasRef.current || selectedCoords.length === 0) return

		let selectedGroups: ColorGroup[] = []
		for (const c of selectedCoords) {
			const cell = game.get(c)
			for (const cg of cell.cache.colorGroups) {
				if (!selectedGroups.includes(cg)) selectedGroups.push(cg)
			}
		}

		for (const cg of selectedGroups) {
			if (cg.members.every(coords => indexOf(coords, selectedCoords) !== -1) || (color !== game.get(cg.members[0]).color)) {
				// Coincidence is full or coincidence is partial and color is different: remove the group
				game.remove([cg])
			}
		}

		if (color !== 'default' && selectedCoords.length > 1) {
			game.createColorGroup(selectedCoords, color)
			handleSelect(false)
			setColorMode(false)
		} else game.setColor(selectedCoords[0], color)
	}, [accentColor, handleSelect, game])

	const onCanvasClick = useCallback((coords: CellCoordinates[], type: MouseButtonType, hold: boolean) => {
		if (!game || GameHandler.complete || !canvasRef.current) return

		if (coords.length === 2) {
			//Select rectangular area
			setSelectMode(true)
			game.selectBox(coords[0], coords[1])
		} else if (coords.length === 1) {
			const cell = game.get(coords[0])
			const cellPossibleValues = game.get(coords[0]).cache.possibleValues

			if (selectMode) {
				if (hold) {
					game.select(coords[0], dragMode)
				} else {
					setDragMode(game.select(coords[0]))
				}
			} else if (type === 'tertiary') {
				// Middle mouse button, set color
				handleUserInteraction(() => { handleSetColor(coords) }, coords[0])
			} else {
				if (colorMode) {
					if (lockedColor) {
						if (hold) {
							if ((cell.color === lockedColor) !== dragMode) {
								handleUserInteraction(() => { handleSetColor(coords, lockedColor) }, coords[0])
							}
						} else {
							setDragMode(cell.color !== lockedColor)
							handleUserInteraction(() => { handleSetColor(coords, lockedColor) }, coords[0])
							game.selectedCells = coords
						}
					} else {
						game.selectedCells = coords
					}
				} else {
					if (lockedInput === 0) {
						// No locked input, so select this cell (or its color group) and set the locked input if applicable
						if (hold) {
							game.select(coords[0])
							setDragMode(true)
							setSelectMode(true)
						} else {
							game.selectedCells = coords

							if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock) setLockedInput(cell.value)
						}
					} else {
						if (hold) {
							// If the user is dragging the cursor...
							if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
								if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
									// If we're in note mode and the cell has more than one possible value or the user doesn't want to auto solve single possibility cells, set a note
									if (game.onlyAvailableInAnyUnit(coords[0], lockedInput)) {
										game.setNote(lockedInput, coords, true)
									} else {
										game.setNote(lockedInput, coords, dragMode)
									}

								} else {
									// If we're not in note mode or the cell has only one possible value, set the value if the cell doesn't already have a value (this helps with dragging)
									if (cell.value === 0) {
										game.setValue([coords[0]], lockedInput)
									}
								}
							}
						} else {
							// The user is not dragging, select the cell and lock the input
							game.selectedCells = coords
							if (cell.value > 0) {
								setLockedInput(li => cell.value === li ? 0 : cell.value)
							} else {
								if ((noteMode || type === 'secondary')) {
									if (SettingsHandler.settings.autoSolveNakedSingles && cellPossibleValues.length === 1) {
										if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
											game.setValue(coords, lockedInput)
										}
									} else {
										if (!SettingsHandler.settings.showPossibleValues || cell.notes.includes(lockedInput) || cellPossibleValues.includes(lockedInput)) {
											setDragMode(game.setNote(lockedInput, coords))
										}
									}
								} else {
									if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
										game.setValue(coords, lockedInput)
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
					game.selectedCells.every(c => {
						const cell = game!.get(c)
						return cell.cache.clue || (cell.value === 0 && cell.notes.length === 0 && cell.color === 'default')
					})
				}
				hintDisabled={GameHandler.complete || game.selectedCells.length === 0 || game.selectedCells.every((c: CellCoordinates) => game!.get(c).cache.clue || game!.get(c).cache.solution === 0)}
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
