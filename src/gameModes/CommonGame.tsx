import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import GameHandler from "../utils/GameHandler"
import Numpad from "../components/numpad/Numpad"
import CommonCanvas from "./CommonCanvas"
import { BoardAnimation, CanvasRef, CellCoordinates, MouseButtonType, ThemeName } from "../utils/DataTypes"
import { Navigate } from "react-router"
import { AccentColor, ColorName } from "../utils/Colors"
import SettingsHandler from "../utils/SettingsHandler"
import { isTouchDevice } from "../utils/isTouchDevice"
import MagicWandSVG from "../svg/magic_wand"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import ColorCircleSVG from "../svg/color_circle"
import { Ruleset } from "./Rulesets"
import { indexOfCoordsInArray } from "../utils/CoordsUtils"

type Props = {
	theme: ThemeName
	accentColor: AccentColor
	paused: boolean
	handleComplete: () => void
	ruleset: Ruleset
}

function CommonGame({ theme, accentColor, paused, handleComplete, ruleset }: Props) {
	const [noteMode, setNoteMode] = useState(isTouchDevice) //If it's a touch device, start with notes on, otherwise off
	const [noteDragMode, setNoteDragMode] = useState<boolean | null>(null)
	const [showLinks, setShowLinks] = useState(false)
	const [lockedInput, setLockedInput] = useState(0)
	const [colorMode, setColorMode] = useState(false)
	const [colorDragMode, setColorDragMode] = useState<boolean | null>(null)
	const [lockedColor, setLockedColor] = useState<ColorName | null>(null)

	const [magicWandMode, setMagicWandMode] = useState<'disabled' | 'links' | 'clearColors' | 'calculator'>()

	const [calculatorValue, setCalculatorValue] = useState(0)

	const [selectMode, setSelectMode] = useState(GameHandler.game ? GameHandler.game.selectedCells.length > 1 : false)
	const [selectedCellBeforeSelectMode, setSelectedCellBeforeSelectMode] = useState<CellCoordinates | null>(null)

	const [possibleValues, setPossibleValues] = useState<number[]>([])
	const [completedNumbers, setCompletedNumbers] = useState<number[]>([])

	const [render, setRender] = useState(0)

	const canvasRef = useRef<CanvasRef>(null)

	const updateCalculatorValue = useCallback(() => {
		if (!GameHandler.game) return

		if (GameHandler.game.mode !== 'killer' || GameHandler.game.selectedCells.length < 2) {
			setCalculatorValue(0)
			return
		}

		let selectedCages: number[] = []

		function selectedCellsMatchCagesExactly(): boolean {
			if (!GameHandler.game) return false

			for (const c of GameHandler.game.selectedCells) {
				const cell = GameHandler.game.get(c)
				if (!selectedCages.includes(cell.cageIndex!)) selectedCages.push(cell.cageIndex!)
			}

			for (const cageIndex of selectedCages) {
				const cage = GameHandler.game.killer__cages[cageIndex]
				for (const cell of cage) {
					if (indexOfCoordsInArray(GameHandler.game.selectedCells, { x: cell[0], y: cell[1] }) === -1) {
						return false
					}
				}
			}

			return true
		}

		if (selectedCellsMatchCagesExactly()) {
			let sum = 0
			for (const cageIndex of selectedCages) {
				const firstCell = GameHandler.game.killer__cages[cageIndex][0]
				sum += GameHandler.game.get({ x: firstCell[0], y: firstCell[1] }).cageValue!
			}
			setCalculatorValue(sum)
		} else {
			setCalculatorValue(0)
		}
	}, [])

	const updatePossibleValues = useCallback(() => {
		if (!GameHandler.game) return

		let newPossibleValues: number[] = []
		if (SettingsHandler.settings.showPossibleValues) {
			for (const c of GameHandler.game.selectedCells) {
				for (const v of GameHandler.game.get(c).possibleValues) {
					if (!newPossibleValues.includes(v)) newPossibleValues = newPossibleValues.concat(v)
				}
			}
		} else {
			for (let i = 1; i <= GameHandler.game.nSquares; i++) {
				newPossibleValues.push(i)
			}
		}

		setPossibleValues(newPossibleValues)
		setCompletedNumbers(GameHandler.game.getCompletedNumbers())
	}, [])

	const handleSetColor = useCallback((coords: CellCoordinates[], color: ColorName = accentColor) => {
		if (!GameHandler.game || GameHandler.complete || !canvasRef.current || coords.length === 0) return
		GameHandler.game.pushBoard()

		let coincidence: 'none' | 'partial' | 'full' = 'none'
		let selectedGroups: number[] = []
		for (let i = 0; i < GameHandler.game.colorGroups.length; i++) {
			const cg = GameHandler.game.colorGroups[i]

			if (coincidence === 'none' && cg.cells.length === coords.length) {
				// Check if every cell in the colorGroup is in the selected coords
				if (coords.every(c => GameHandler.game?.get(c).colorGroupIndex === i)) {
					coincidence = 'full'
					selectedGroups = [i]
					break
				}
			} else {
				// Full coincidence is impossible, check if any cells in the group are selected
				if (coords.some(c => GameHandler.game?.get(c).colorGroupIndex === i)) {
					coincidence = 'partial'
					selectedGroups.push(i)
				}
			}
		}

		const indicesToRemove = new Set(selectedGroups)

		let newColor

		switch (coincidence) {
			case 'partial':
				/* eslint-disable no-fallthrough */
				// Eliminate all selected groups and then apply color
				GameHandler.game.removeColorGroups(indicesToRemove)
			case 'none':
				// Apply color
				newColor = coords.every(c => GameHandler.game!.get(c).color === color) ? 'default' : color
				if (newColor !== 'default' && coords.length > 1) {
					let visibleCells: CellCoordinates[] = GameHandler.game.ruleset.game.getVisibleCells(GameHandler.game, coords[0])
					for (let i = 1; i < coords.length; i++) {
						const visibleCells2 = GameHandler.game.ruleset.game.getVisibleCells(GameHandler.game, coords[i])
						visibleCells = visibleCells.filter(vc => indexOfCoordsInArray(visibleCells2, vc) !== -1)
					}

					GameHandler.game.colorGroups.push({
						cells: [...coords],
						visibleCells
					})

					for (const cell of coords) {
						GameHandler.game.get(cell).colorGroupIndex = GameHandler.game.colorGroups.length - 1
					}
				}
				for (const c of coords) GameHandler.game.setColor(c, newColor)
				break
			case 'full':
				// Change color and remove group if necessary
				newColor = GameHandler.game.get(coords[0]).color === color ? 'default' : color
				if (color === 'default') {
					GameHandler.game.removeColorGroups(indicesToRemove)
				}
				for (const c of coords) GameHandler.game.setColor(c, newColor)
				break
		}

		updatePossibleValues()

		setRender(r => r === 100 ? 0 : r + 1)
	}, [accentColor, updatePossibleValues])

	const updateMagicWandMode = useCallback(() => {
		if (!GameHandler.game) return
		if (colorMode) {
			setMagicWandMode('clearColors')
		} else if (GameHandler.game.selectedCells.length === 1 && (lockedInput !== 0 || GameHandler.game.get(GameHandler.game.selectedCells[0]).value > 0)) {
			setMagicWandMode('links')
		} else if (GameHandler.game.mode === 'killer' && GameHandler.game.selectedCells.length > 1) {
			setMagicWandMode('calculator')
		} else {
			setMagicWandMode('disabled')
			setShowLinks(false)
		}
		updateCalculatorValue()
	}, [colorMode, lockedInput, updateCalculatorValue])

	const onCanvasClick = useCallback((coords: CellCoordinates[], type: MouseButtonType, hold: boolean) => {
		if (!GameHandler.game || GameHandler.complete || !canvasRef.current) return

		let animations: BoardAnimation[] = []

		if (coords.length === 2) {
			//Select rectangular area
			setSelectMode(true)
			GameHandler.game.selectBox(coords[0], coords[1])
		} else if (coords.length === 1) {
			const cell = GameHandler.game.get(coords[0])
			const cellPossibleValues = GameHandler.game.get(coords[0]).possibleValues

			if (selectMode) {
				// We're in select mode, so add this cell to the selection
				GameHandler.game.selectCell(coords[0])
			} else if (type === 'tertiary') {
				// Middle mouse button, set color
				handleSetColor(coords)
			} else {
				if (colorMode) {
					if (lockedColor) {
						if (hold) {
							if ((cell.color === lockedColor) !== colorDragMode) {
								handleSetColor(coords, lockedColor)
							}
						} else {
							setColorDragMode(cell.color !== lockedColor)
							handleSetColor(coords, lockedColor)
							GameHandler.game.selectedCells = coords
						}
					} else {
						GameHandler.game.selectedCells = coords
					}
				} else {
					if (lockedInput === 0) {
						// No locked input, so select this cell (or its color group) and set the locked input if applicable

						const colorGroupIndex = GameHandler.game.get(coords[0]).colorGroupIndex
						if (colorGroupIndex === -1) {
							GameHandler.game.selectedCells = coords
						} else {
							setSelectedCellBeforeSelectMode(coords[0])
							GameHandler.game.selectedCells = [...GameHandler.game.colorGroups[colorGroupIndex].cells]
							setSelectMode(true)
						}

						if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock) setLockedInput(cell.value)
					} else {
						if (hold) {
							// If the user is dragging the cursor...
							if (cellPossibleValues.includes(lockedInput)) {
								if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
									// If we're in note mode and the cell has more than one possible value or the user doesn't want to auto solve single possibility cells, set a note
									if (cell.notes.includes(lockedInput) !== noteDragMode || GameHandler.game.onlyAvailableInAnyUnit(coords[0], lockedInput)) {
										GameHandler.game.pushBoard();
										[, animations] = GameHandler.game.setNote(coords, lockedInput)
									}
								} else {
									// If we're not in note mode or the cell has only one possible value, set the value if the cell doesn't already have a value (this helps with dragging)
									if (cell.value === 0) {
										GameHandler.game.pushBoard()
										animations = GameHandler.game.setValue([coords[0]], lockedInput)
									}
								}
							}
						} else {
							// The user is not dragging, select the cell and lock the input
							GameHandler.game.selectedCells = coords
							if (cell.value > 0) {
								setLockedInput(li => cell.value === li ? 0 : cell.value)
							} else {
								if ((noteMode || type === 'secondary')) {
									if (SettingsHandler.settings.autoSolveNakedSingles && cellPossibleValues.length === 1) {
										if (cellPossibleValues.includes(lockedInput)) {
											GameHandler.game.pushBoard()
											animations = GameHandler.game.setValue(coords, lockedInput)
										}
									} else {
										if (cell.notes.includes(lockedInput) || cellPossibleValues.includes(lockedInput)) {
											let newNoteMode
											GameHandler.game.pushBoard();
											[newNoteMode, animations] = GameHandler.game.setNote(coords, lockedInput)
											setNoteDragMode(newNoteMode)
										}
									}
								} else {
									if (cellPossibleValues.includes(lockedInput)) {
										GameHandler.game.pushBoard()
										animations = GameHandler.game.setValue(coords, lockedInput)
									}
								}
							}
						}
					}
				}
			}
		}

		updatePossibleValues()
		updateMagicWandMode()

		if (animations.length > 0) {
			canvasRef.current?.doAnimations(animations)
			if (animations[0].type === 'board') handleComplete()
		}

		setRender(r => r === 100 ? 0 : r + 1)
	}, [colorDragMode, colorMode, handleComplete, handleSetColor, lockedColor, lockedInput, noteDragMode, noteMode, selectMode, updatePossibleValues, updateMagicWandMode])

	const onNote = useCallback(() => {
		setNoteMode(n => !n)
	}, [])

	const onHint = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game) return
		GameHandler.game.pushBoard()
		GameHandler.game.hint(GameHandler.game.selectedCells)
		setRender(r => r === 100 ? 0 : r + 1)
	}, [])

	const onMagicWand = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game) return
		switch (magicWandMode) {
			case 'links':
				setShowLinks(l => !l)
				break
			case 'clearColors':
				GameHandler.game.pushBoard()
				GameHandler.game.clearColors()
				setRender(r => r === 100 ? 0 : r + 1)
				break
		}
	}, [magicWandMode])

	const onSelect = useCallback(() => {
		if (!GameHandler.game) return
		if (selectMode) {
			setSelectMode(false)
			if (selectedCellBeforeSelectMode) GameHandler.game.selectedCells = [selectedCellBeforeSelectMode]
			else GameHandler.game.selectedCells = []
		} else {
			setSelectMode(true)
			if (GameHandler.game.selectedCells.length > 0) setSelectedCellBeforeSelectMode(GameHandler.game.selectedCells[0])
			else setSelectedCellBeforeSelectMode(null)
			GameHandler.game.selectedCells = []
		}
		updateMagicWandMode()
	}, [selectMode, selectedCellBeforeSelectMode, updateMagicWandMode])

	const onColor = useCallback(() => {
		if (colorMode) {
			setColorMode(false)
		} else {
			setColorMode(true)
		}
	}, [colorMode])

	const onColorButtonClick = useCallback((color: ColorName, type: "primary" | "secondary") => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return

		if (type === 'primary') {
			handleSetColor(GameHandler.game.selectedCells, color)
		} else {
			setLockedColor(lc => lc === color ? null : color)
		}
	}, [handleSetColor])

	const onUndo = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return

		GameHandler.game.popBoard()
		canvasRef.current.stopAnimations()
		updatePossibleValues()
		setRender(r => r === 100 ? 0 : r + 1)
	}, [updatePossibleValues])

	const onErase = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return
		GameHandler.game.pushBoard()
		GameHandler.game.erase(GameHandler.game.selectedCells)
		updatePossibleValues()
		canvasRef.current.stopAnimations()
		setRender(r => r === 100 ? 0 : r + 1)
	}, [updatePossibleValues])

	const onNumpadButtonClick = useCallback((number: number, type: MouseButtonType) => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return

		let animations: BoardAnimation[] = []

		if (type === 'primary') {
			if (possibleValues.includes(number)) {
				if (noteMode && (possibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
					GameHandler.game.pushBoard();
					[, animations] = GameHandler.game.setNote(GameHandler.game.selectedCells, number)
				} else {
					if (lockedInput > 0) setLockedInput(number)
					GameHandler.game.pushBoard()
					animations = GameHandler.game.setValue(GameHandler.game.selectedCells, number)
				}
			}
		} else setLockedInput(li => li === number ? 0 : number)
		updatePossibleValues()

		if (animations.length > 0) {
			canvasRef.current.doAnimations(animations)
			if (animations[0].type === 'board') handleComplete()
		}

		setRender(r => r === 100 ? 0 : r + 1)
	}, [handleComplete, noteMode, possibleValues, updatePossibleValues, lockedInput])

	useEffect(() => {
		updatePossibleValues()
	}, [updatePossibleValues])

	useEffect(() => {
		canvasRef.current?.renderFrame()
	}, [render, lockedInput, showLinks, selectMode])

	const magicWandIcon = useMemo(() => {
		if (magicWandMode === 'disabled') {
			return <MagicWandSVG />
		} else if (magicWandMode === 'links') {
			return <FontAwesomeIcon icon={faLink} fontSize={30} color="var(--primaryIconColor)" />
		} else if (magicWandMode === 'clearColors') {
			return <ColorCircleSVG />
		} else return null
	}, [magicWandMode])

	useEffect(() => {
		updateMagicWandMode()
	}, [updateMagicWandMode])

	if (!GameHandler.game) return <Navigate to="/"></Navigate>

	return (
		<div className="game">
			<div className="sudoku">
				<CommonCanvas ref={canvasRef} onClick={onCanvasClick} showLinks={showLinks} game={GameHandler.game} lockedInput={lockedInput} theme={theme} accentColor={accentColor} paused={paused} ruleset={ruleset} />
			</div>
			<Numpad
				onUndo={onUndo}
				onErase={onErase}
				onNote={onNote}
				onHint={onHint}
				onMagicWand={onMagicWand}
				onSelect={onSelect}
				onColor={onColor}
				onColorButtonClick={onColorButtonClick}
				onNumpadButtonClick={onNumpadButtonClick}

				noteHighlighted={noteMode}
				magicWandHighlighted={showLinks}
				magicWandIcon={magicWandIcon}
				magicWandDisabled={magicWandMode === 'disabled'}
				selectHighlighted={selectMode}

				undoDisabled={GameHandler.complete || GameHandler.game.history.length === 0}
				eraseDisabled={GameHandler.complete || GameHandler.game.selectedCells.length === 0 || GameHandler.game.selectedCells.every((c: CellCoordinates) => (GameHandler.game!.get(c).clue || (GameHandler.game!.get(c).value === 0 && GameHandler.game!.get(c).notes.length === 0)))}
				hintDisabled={GameHandler.complete || GameHandler.game.selectedCells.length === 0 || GameHandler.game.selectedCells.every((c: CellCoordinates) => GameHandler.game!.get(c).clue || GameHandler.game!.get(c).solution === 0)}
				colorDisabled={false}

				colorMode={colorMode}
				lockedColor={lockedColor}

				lockedInput={lockedInput}
				possibleValues={possibleValues}
				completedNumbers={completedNumbers}

				magicWandCalculatorValue={calculatorValue}
			/>
		</div>
	)
}

export default CommonGame
