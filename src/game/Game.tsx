import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import GameHandler from "../utils/GameHandler"
import Numpad from "../components/numpad/Numpad"
import Canvas from "./Canvas"
import { CanvasRef, CellCoordinates, ColorGroup, KillerCage, MouseButtonType, Ruleset, ThemeName } from "../utils/DataTypes"
import { Navigate } from "react-router"
import { AccentColor, ColorName } from "../utils/Colors"
import SettingsHandler from "../utils/SettingsHandler"
import { isTouchDevice } from "../utils/isTouchDevice"
import MagicWandSVG from "../svg/magic_wand"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import ColorCircleSVG from "../svg/color_circle"
import { indexOfCoordsInArray } from "../utils/Utils"

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

		if (GameHandler.game.selectedCells.length < 2) {
			setCalculatorValue(0)
			return
		}

		let selectedCages: KillerCage[] = []

		function selectedCellsMatchCagesExactly(): boolean {
			if (!GameHandler.game) return false

			for (const c of GameHandler.game.selectedCells) {
				const cell = GameHandler.game.get(c)
				if (cell.value === 0 && cell.cage && !selectedCages.includes(cell.cage)) selectedCages.push(cell.cage)
			}

			for (const cage of selectedCages) {
				for (const cell of cage.members) {
					if (indexOfCoordsInArray(GameHandler.game.selectedCells, cell) === -1) {
						return false
					}
				}
			}

			return true
		}

		if (GameHandler.game.mode !== 'killer' || selectedCellsMatchCagesExactly()) {
			let sum = 0
			for (const cage of selectedCages) {
				sum += cage.sum
			}
			for (const c of GameHandler.game.selectedCells) {
				const cell = GameHandler.game.get(c)
				if (cell.value > 0 && cell.cage && !selectedCages.includes(cell.cage)) {
					sum += cell.value
				}
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
			for (let i = 0; i < GameHandler.game.nSquares; i++) newPossibleValues.push(i + 1)
		}

		setPossibleValues(newPossibleValues)
		setCompletedNumbers(GameHandler.game.getCompletedNumbers())
	}, [])

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

	const handleUserInteraction = useCallback((func: () => void, lastInteractionCoords: CellCoordinates | null) => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return

		GameHandler.game.stashBoard()

		func()

		if (GameHandler.game.hasChanged) {
			GameHandler.game.pushBoard()

			do {
				GameHandler.game.hasChanged = false
				for (const func of GameHandler.game.ruleset.game.afterValuesChanged) func(GameHandler.game)
			} while (GameHandler.game.hasChanged)

			if (GameHandler.game.checkComplete()) {
				GameHandler.game.animations = [{ type: 'board', center: lastInteractionCoords || { x: Math.floor(GameHandler.game.nSquares / 2), y: Math.floor(GameHandler.game.nSquares / 2) } }]
				GameHandler.setComplete()
				handleComplete()
			}

			if (GameHandler.game.animations.length > 0) {
				canvasRef.current?.doAnimations(GameHandler.game.animations)
				GameHandler.game.animations = []
			}
		}

		updatePossibleValues()
		updateMagicWandMode()

		setRender(r => r === 100 ? 0 : r + 1)
	}, [handleComplete, updateMagicWandMode, updatePossibleValues])

	const handleSetColor = useCallback((coords: CellCoordinates[], color: ColorName = accentColor) => {
		if (!GameHandler.game || GameHandler.complete || !canvasRef.current || coords.length === 0) return

		let coincidence: 'none' | 'partial' | 'full' = 'none'
		let selectedGroups: ColorGroup[] = []
		for (const cg of GameHandler.game.colorGroups) {
			if (coincidence === 'none' && cg.members.length === coords.length) {
				// Check if every cell in the colorGroup is in the selected coords
				if (coords.every(c => GameHandler.game?.get(c).colorGroups.includes(cg))) {
					coincidence = 'full'
					selectedGroups = [cg]
					break
				}
			} else {
				// Full coincidence is impossible, check if any cells in the group are selected
				if (coords.some(c => GameHandler.game?.get(c).colorGroups.includes(cg))) {
					coincidence = 'partial'
					selectedGroups.push(cg)
				}
			}
		}

		let newColor

		switch (coincidence) {
			case 'partial':

				// Eliminate all selected groups and then apply color
				GameHandler.game.removeColorGroups(selectedGroups)
				break
			case 'none':
				// Apply color
				newColor = coords.every(c => GameHandler.game!.get(c).color === color) ? 'default' : color
				if (newColor !== 'default' && coords.length > 1) {
					let visibleCells: CellCoordinates[] = GameHandler.game.ruleset.game.getVisibleCells(GameHandler.game, coords[0])
					for (let i = 1; i < coords.length; i++) {
						const visibleCells2 = GameHandler.game.ruleset.game.getVisibleCells(GameHandler.game, coords[i])
						visibleCells = visibleCells.filter(vc => indexOfCoordsInArray(visibleCells2, vc) !== -1)
					}

					const newColorGroup: ColorGroup = {
						members: [...coords],
						visibleCells
					}

					GameHandler.game.colorGroups.push(newColorGroup)

					for (const cell of coords) {
						GameHandler.game.get(cell).colorGroups.push(newColorGroup)
					}
				}
				for (const c of coords) GameHandler.game.setColor(c, newColor)
				break
			case 'full':
				// Change color and remove group if necessary
				newColor = GameHandler.game.get(coords[0]).color === color ? 'default' : color
				if (color === 'default') {
					GameHandler.game.removeColorGroups(selectedGroups)
				}
				for (const c of coords) GameHandler.game.setColor(c, newColor)
				break
		}
	}, [accentColor])

	const onCanvasClick = useCallback((coords: CellCoordinates[], type: MouseButtonType, hold: boolean) => {
		if (!GameHandler.game || GameHandler.complete || !canvasRef.current) return

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
				handleUserInteraction(() => { handleSetColor(coords) }, coords[0])
			} else {
				if (colorMode) {
					if (lockedColor) {
						if (hold) {
							if ((cell.color === lockedColor) !== colorDragMode) {
								handleUserInteraction(() => { handleSetColor(coords, lockedColor) }, coords[0])
							}
						} else {
							setColorDragMode(cell.color !== lockedColor)
							handleUserInteraction(() => { handleSetColor(coords, lockedColor) }, coords[0])
							GameHandler.game.selectedCells = coords
						}
					} else {
						GameHandler.game.selectedCells = coords
					}
				} else {
					if (lockedInput === 0) {
						// No locked input, so select this cell (or its color group) and set the locked input if applicable

						if (GameHandler.game.get(coords[0]).colorGroups.length === 0) {
							GameHandler.game.selectedCells = coords
						} else {
							setSelectedCellBeforeSelectMode(coords[0])
							GameHandler.game.selectedCells = [...GameHandler.game.get(coords[0]).colorGroups[0].members]
							setSelectMode(true)
						}

						if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock) setLockedInput(cell.value)
					} else {
						if (hold) {
							// If the user is dragging the cursor...
							if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
								if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
									// If we're in note mode and the cell has more than one possible value or the user doesn't want to auto solve single possibility cells, set a note
									if (cell.notes.includes(lockedInput) !== noteDragMode || GameHandler.game.onlyAvailableInAnyUnit(coords[0], lockedInput)) {
										GameHandler.game.setNote(coords, lockedInput)
									}
								} else {
									// If we're not in note mode or the cell has only one possible value, set the value if the cell doesn't already have a value (this helps with dragging)
									if (cell.value === 0) {
										GameHandler.game.setValue([coords[0]], lockedInput)
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
										if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
											GameHandler.game.setValue(coords, lockedInput)
										}
									} else {
										if (!SettingsHandler.settings.showPossibleValues || cell.notes.includes(lockedInput) || cellPossibleValues.includes(lockedInput)) {
											let newNoteMode
											newNoteMode = GameHandler.game.setNote(coords, lockedInput)
											setNoteDragMode(newNoteMode)
										}
									}
								} else {
									if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
										GameHandler.game.setValue(coords, lockedInput)
									}
								}
							}
						}
					}
				}
			}
		}
	}, [colorDragMode, colorMode, handleSetColor, lockedColor, lockedInput, noteDragMode, noteMode, selectMode, handleUserInteraction])

	const onNote = useCallback(() => {
		setNoteMode(n => !n)
	}, [])

	const onHint = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game) return
		GameHandler.game.hint(GameHandler.game.selectedCells)
	}, [])

	const onMagicWand = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game) return
		switch (magicWandMode) {
			case 'links':
				setShowLinks(l => !l)
				break
			case 'clearColors':
				handleUserInteraction(() => {
					if (GameHandler.game && !GameHandler.complete) GameHandler.game.clearColors()
				}, null)
				break
		}
	}, [magicWandMode, handleUserInteraction])

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
		if (type === 'primary') {
			handleUserInteraction(() => { if (GameHandler.game) handleSetColor(GameHandler.game.selectedCells, color) }, (GameHandler.game ? (GameHandler.game.selectedCells.length > 0 ? GameHandler.game.selectedCells[0] : null) : null))
		} else {
			setLockedColor(lc => lc === color ? null : color)
		}
	}, [handleSetColor, handleUserInteraction])

	const onUndo = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return

		GameHandler.game.popBoard()
		canvasRef.current.stopAnimations()
	}, [])

	const onErase = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return

		GameHandler.game.erase(GameHandler.game.selectedCells)
		canvasRef.current.stopAnimations()
	}, [])

	const onNumpadButtonClick = useCallback((number: number, type: MouseButtonType) => {
		if (GameHandler.complete || !GameHandler.game || !canvasRef.current) return

		if (type === 'primary') {
			if (possibleValues.includes(number)) {
				if (noteMode && (possibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
					GameHandler.game.setNote(GameHandler.game.selectedCells, number)
				} else {
					if (lockedInput > 0) setLockedInput(number)
					GameHandler.game.setValue(GameHandler.game.selectedCells, number)
				}
			}
		} else setLockedInput(li => li === number ? 0 : number)
	}, [noteMode, possibleValues, lockedInput])

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
				<Canvas
					ref={canvasRef}
					onClick={(coords, type, hold) => { handleUserInteraction(() => { onCanvasClick(coords, type, hold) }, coords[0]) }}
					showLinks={showLinks}
					game={GameHandler.game}
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
				onSelect={onSelect}
				onColor={onColor}
				onColorButtonClick={onColorButtonClick}
				onNumpadButtonClick={(number, type) => { handleUserInteraction(() => { onNumpadButtonClick(number, type) }, null) }}

				noteHighlighted={noteMode}
				magicWandHighlighted={showLinks}
				magicWandIcon={magicWandIcon}
				magicWandDisabled={magicWandMode === 'disabled'}
				selectHighlighted={selectMode}

				undoDisabled={GameHandler.complete || GameHandler.game.history.length === 0}
				eraseDisabled={
					GameHandler.complete ||
					GameHandler.game.selectedCells.length === 0 ||
					GameHandler.game.selectedCells.every(c => {
						const cell = GameHandler.game!.get(c)
						return cell.clue || (cell.value === 0 && cell.notes.length === 0 && cell.color === 'default')
					})
				}
				hintDisabled={GameHandler.complete || GameHandler.game.selectedCells.length === 0 || GameHandler.game.selectedCells.every((c: CellCoordinates) => GameHandler.game!.get(c).clue || GameHandler.game!.get(c).solution === 0)}
				colorDisabled={false}

				colorMode={colorMode}
				lockedColor={lockedColor}

				lockedInput={lockedInput}
				possibleValues={possibleValues}
				completedNumbers={completedNumbers}

				magicWandCalculatorValue={magicWandMode === 'calculator' ? calculatorValue : undefined}
			/>
		</div>
	)
}

export default CommonGame
