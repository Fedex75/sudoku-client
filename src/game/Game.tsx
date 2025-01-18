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
import { indexOf, union } from "../utils/Utils"

type Props = {
	theme: ThemeName
	accentColor: AccentColor
	paused: boolean
	handleComplete: () => void
	ruleset: Ruleset
}

function Game({ theme, accentColor, paused, handleComplete, ruleset }: Props) {
	const [noteMode, setNoteMode] = useState(isTouchDevice) //If it's a touch device, start with notes on, otherwise off
	const [showLinks, setShowLinks] = useState(false)
	const [lockedInput, setLockedInput] = useState(0)
	const [colorMode, setColorMode] = useState(false)
	const [lockedColor, setLockedColor] = useState<ColorName | null>(null)

	const [dragMode, setDragMode] = useState<boolean | null>(null)

	const [magicWandMode, setMagicWandMode] = useState<'disabled' | 'links' | 'setColor' | 'clearColors'>()
	const [magicWandColor, setMagicWandColor] = useState<ColorName | null>(null)
	const [calculatorValue, setCalculatorValue] = useState<number | undefined>(0)

	const [selectMode, setSelectMode] = useState(GameHandler.game ? GameHandler.game.selectedCells.length > 1 : false)
	const [selectedCellBeforeSelectMode, setSelectedCellBeforeSelectMode] = useState<CellCoordinates | null>(null)

	const [possibleValues, setPossibleValues] = useState<number[]>([])
	const [completedNumbers, setCompletedNumbers] = useState<number[]>([])

	const [render, setRender] = useState(0)

	const canvasRef = useRef<CanvasRef>(null)

	const updateCalculatorValue = useCallback(() => {
		if (!GameHandler.game) return

		if (GameHandler.game.selectedCells.length < 2) {
			setCalculatorValue(undefined)
			return
		}

		let selectedCages: KillerCage[] = []

		function selectedCellsMatchCagesExactly(): boolean {
			if (!GameHandler.game) return false

			for (const c of GameHandler.game.selectedCells) {
				const cell = GameHandler.game.get(c)
				if (cell.value === 0 && cell.cache.cage && !selectedCages.includes(cell.cache.cage)) selectedCages.push(cell.cache.cage)
			}

			for (const cage of selectedCages) {
				for (const coords of cage.members) {
					if (indexOf(coords, GameHandler.game.selectedCells) === -1) {
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
			for (const c of GameHandler.game.selectedCells) {
				const cell = GameHandler.game.get(c)
				if (cell.value > 0 && cell.cache.cage && !selectedCages.includes(cell.cache.cage)) {
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
				for (const v of GameHandler.game.get(c).cache.possibleValues) {
					if (!newPossibleValues.includes(v)) newPossibleValues = newPossibleValues.concat(v)
				}
			}
		} else {
			for (let i = 0; i < GameHandler.game.nSquares; i++) newPossibleValues.push(i + 1)
		}

		setPossibleValues(newPossibleValues)
		setCompletedNumbers(GameHandler.game.getCompletedNumbers())
	}, [])

	const shuffleMagicWandColor = useCallback(() => {
		if (!GameHandler.game) return

		let possibleColorNames: ColorName[] = colorNames.filter(cn => cn !== 'default')
		const orthogonalCells = union(GameHandler.game.selectedCells.map(c => GameHandler.game!.ruleset.game.getOrthogonalCells(GameHandler.game!, c)))
		for (const c of orthogonalCells) {
			const cell = GameHandler.game.get(c)
			if (cell.color !== 'default') possibleColorNames = possibleColorNames.filter(cn => cn !== cell.color)
		}
		if (magicWandColor === null || !possibleColorNames.includes(magicWandColor)) {
			if (possibleColorNames.length > 0) setMagicWandColor(possibleColorNames[Math.floor(Math.random() * possibleColorNames.length)])
			else setMagicWandColor(accentColor)
		}
	}, [accentColor, magicWandColor])

	const updateMagicWandMode = useCallback(() => {
		if (!GameHandler.game) return

		if (colorMode) {
			setMagicWandMode('clearColors')
		} else if (GameHandler.game.selectedCells.length === 1 && (lockedInput !== 0 || GameHandler.game.get(GameHandler.game.selectedCells[0]).value > 0)) {
			setMagicWandMode('links')
		} else if (GameHandler.game.selectedCells.length > 0) {
			setMagicWandMode('setColor')
			shuffleMagicWandColor()
		} else {
			setMagicWandMode("disabled")
			setMagicWandColor(null)
		}
		updateCalculatorValue()
	}, [colorMode, lockedInput, updateCalculatorValue, shuffleMagicWandColor])

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

			GameHandler.game.checkFullNotation()

			if (GameHandler.game.isComplete()) {
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

	const handleSelect = useCallback((withState: boolean | null) => {
		if (!GameHandler.game) return
		const newState = (withState === null) ? !selectMode : withState
		if (newState) {
			if (GameHandler.game.selectedCells.length > 0) setSelectedCellBeforeSelectMode(GameHandler.game.selectedCells[0])
			else setSelectedCellBeforeSelectMode(null)
			GameHandler.game.selectedCells = []
		} else {
			if (selectedCellBeforeSelectMode) GameHandler.game.selectedCells = [selectedCellBeforeSelectMode]
			else GameHandler.game.selectedCells = []
		}

		setSelectMode(newState)
		updateMagicWandMode()
	}, [selectMode, selectedCellBeforeSelectMode, updateMagicWandMode])

	const handleSetColor = useCallback((selectedCoords: CellCoordinates[], color: ColorName = accentColor) => {
		if (!GameHandler.game || GameHandler.complete || !canvasRef.current || selectedCoords.length === 0) return

		let selectedGroups: ColorGroup[] = []
		for (const c of selectedCoords) {
			const cell = GameHandler.game.get(c)
			for (const cg of cell.cache.colorGroups) {
				if (!selectedGroups.includes(cg)) selectedGroups.push(cg)
			}
		}

		for (const cg of selectedGroups) {
			if (cg.members.every(coords => indexOf(coords, selectedCoords) !== -1) || (color !== GameHandler.game.get(cg.members[0]).color)) {
				// Coincidence is full or coincidence is partial and color is different: remove the group
				GameHandler.game.remove([cg])
			}
		}

		if (color !== 'default') {
			if (selectedCoords.length > 1) {
				GameHandler.game.createColorGroup(selectedCoords, color)
				handleSelect(false)
				setColorMode(false)
			} else GameHandler.game.setColor(selectedCoords[0], color)
		}
	}, [accentColor, handleSelect])

	const onCanvasClick = useCallback((coords: CellCoordinates[], type: MouseButtonType, hold: boolean) => {
		if (!GameHandler.game || GameHandler.complete || !canvasRef.current) return

		if (coords.length === 2) {
			//Select rectangular area
			setSelectMode(true)
			GameHandler.game.selectBox(coords[0], coords[1])
		} else if (coords.length === 1) {
			const cell = GameHandler.game.get(coords[0])
			const cellPossibleValues = GameHandler.game.get(coords[0]).cache.possibleValues

			if (selectMode) {
				if (hold) {
					GameHandler.game.select(coords[0], dragMode)
				} else {
					setDragMode(GameHandler.game.select(coords[0]))
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
							GameHandler.game.selectedCells = coords
						}
					} else {
						GameHandler.game.selectedCells = coords
					}
				} else {
					if (lockedInput === 0) {
						// No locked input, so select this cell (or its color group) and set the locked input if applicable
						if (hold) {
							GameHandler.game.select(coords[0])
							setDragMode(true)
							setSelectMode(true)
						} else {
							GameHandler.game.selectedCells = coords

							if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock) setLockedInput(cell.value)
						}
					} else {
						if (hold) {
							// If the user is dragging the cursor...
							if (!SettingsHandler.settings.showPossibleValues || cellPossibleValues.includes(lockedInput)) {
								if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
									// If we're in note mode and the cell has more than one possible value or the user doesn't want to auto solve single possibility cells, set a note
									if (GameHandler.game.onlyAvailableInAnyUnit(coords[0], lockedInput)) {
										GameHandler.game.setNote(lockedInput, coords, true)
									} else {
										GameHandler.game.setNote(lockedInput, coords, dragMode)
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
											setDragMode(GameHandler.game.setNote(lockedInput, coords))
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
	}, [dragMode, colorMode, handleSetColor, lockedColor, lockedInput, noteMode, selectMode, handleUserInteraction])

	const onNote = useCallback(() => {
		setNoteMode(n => !n)
	}, [])

	const onHint = useCallback(() => {
		if (GameHandler.complete || !GameHandler.game) return
		GameHandler.game.giveHint(GameHandler.game.selectedCells)
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
			case 'setColor':
				handleUserInteraction(() => {
					if (!GameHandler.game) return

					handleSetColor(GameHandler.game.selectedCells, magicWandColor || accentColor)
					shuffleMagicWandColor()
				}, GameHandler.game.selectedCells[0])
				break
		}
	}, [magicWandMode, handleUserInteraction, accentColor, handleSetColor, magicWandColor, shuffleMagicWandColor])

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
					GameHandler.game.setNote(number, GameHandler.game.selectedCells)
				} else {
					if (lockedInput > 0) setLockedInput(number)
					GameHandler.game.setValue(GameHandler.game.selectedCells, number)
				}
			}
		} else setLockedInput(li => li === number ? 0 : number)
	}, [noteMode, possibleValues, lockedInput])

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
				onSelect={() => { handleSelect(null) }}
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
						return cell.cache.clue || (cell.value === 0 && cell.notes.length === 0 && cell.color === 'default')
					})
				}
				hintDisabled={GameHandler.complete || GameHandler.game.selectedCells.length === 0 || GameHandler.game.selectedCells.every((c: CellCoordinates) => GameHandler.game!.get(c).cache.clue || GameHandler.game!.get(c).cache.solution === 0)}
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
