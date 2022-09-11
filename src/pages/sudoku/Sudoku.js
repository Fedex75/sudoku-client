import React, { useEffect, useRef, useState } from 'react'
import Canvas from '../../components/Canvas'
import EditButton from '../../components/EditButton'
import { Section, SectionContent, Topbar } from '../../components/section'
import SettingsHandler from '../../utils/SettingsHandler'
import NumpadButton from '../../components/NumpadButton'
import ActionSheet from '../../components/ActionSheet'
import { ActionSheetButton } from '../../components/ActionSheet'
import GameHandler from '../../utils/GameHandler'
import { modeTranslations, difficultyTranslations, classicDifficulties, killerDifficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import Button from '../../components/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark, faDroplet, faDropletSlash, faEraser, faLightbulb, faLink, faPencilAlt, faPlus, faUndo } from '@fortawesome/free-solid-svg-icons'
import ColorButton from '../../components/ColorButton'

const colorNames = ['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple', 'default']

const defaultLockedColor = 'purple'

const Sudoku = ({theme}) => {
	const [hintState, setHintState] = useState(0)
	const [eraseInkState, setEraseInkState] = useState(0)
	const [showLinks, setShowLinks] = useState(false)
	const [win, setWin] = useState(false)
	const [bookmark, setBookmark] = useState(GameHandler.currentGameIsBookmarked())
	const [possibleValues, setPossibleValues] = useState([])
	const [completedNumbers, setCompletedNumbers] = useState([])
	const [lockedColor, setLockedColor] = useState(defaultLockedColor)
	const [brush, setBrush] = useState(false)
	const [lockedInput, setLockedInput] = useState(0)
	const [noteMode, setNoteMode] = useState(true)
	const [noteDragMode, setNoteDragMode] = useState(null)

	const newGameActionSheetRef = useRef()
	const exportActionSheetRef = useRef()
	const navigate = useNavigate()

	const canvasRef = useRef()
	const sudokuRef = useRef()

	function handleComplete(){
		setTimeout(() => {
			setWin(true)
			setShowLinks(false)
			setLockedInput(0)
			setLockedColor(defaultLockedColor)
		}, 1350) //Must be equal to animation duration in Canvas.js
	}

	function onClick(coords, hold){
		let animations = []

		if (brush){
			GameHandler.game.setSelectedCell(coords)
			if (lockedColor !== null) handleSetColor(coords, lockedColor)
		} else {
			const cell = GameHandler.game.get(coords)
			const cellPossibleValues = GameHandler.game.getPossibleValues(coords)

			if (lockedInput === 0){
				GameHandler.game.setSelectedCell(coords)
				if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock && GameHandler.game.mode === 'classic') setLockedInput(cell.value)
			} else {
				if (hold){
					if (cellPossibleValues.includes(lockedInput)){
						if (noteMode && cellPossibleValues.length > 1){
							if (cell.notes.includes(lockedInput) !== noteDragMode || GameHandler.game.onlyAvailableInQuadrant(coords, lockedInput)) [, animations] = GameHandler.game.setNote(coords, lockedInput)
						} else {
							if (cell.value === 0) animations = GameHandler.game.setValue(coords, lockedInput)
						}
					}
				} else {
					GameHandler.game.setSelectedCell(coords)
					if (cell.value > 0){
						setLockedInput(li => cell.value === li ? 0 : cell.value)
					} else {
						if (noteMode){
							if (SettingsHandler.settings.autoSolveNakedSingles && cellPossibleValues.length === 1){
								if (cellPossibleValues.includes(lockedInput)) animations = GameHandler.game.setValue(coords, lockedInput)
							} else {
								if (cell.notes.includes(lockedInput) || cellPossibleValues.includes(lockedInput)){
									let newNoteMode
									[newNoteMode, animations] = GameHandler.game.setNote(coords, lockedInput)
									setNoteDragMode(newNoteMode)

								}
							}
						} else {
							if (cellPossibleValues.includes(lockedInput)) animations = GameHandler.game.setValue(coords, lockedInput)
						}
					}
				}
			}
		}
		updatePossibleValues()

		if (animations.length > 0){
			canvasRef.current?.doAnimation(animations)
			if (animations[0].type === 'board') handleComplete()
		}
	}

	function handleNumpadButtonClick(number, type){
		if (GameHandler.complete) return

		let animations = []

		if (type === 'primary'){
			if (possibleValues.includes(number)){
				if (noteMode && (possibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)){
					[, animations] = GameHandler.game.setNote(GameHandler.game.selectedCell, number)
				} else {
					if (lockedInput > 0) setLockedInput(number)
					animations = GameHandler.game.setValue(GameHandler.game.selectedCell, number)
				}
			}
		} else setLockedInput(li => li === number ? 0 : number)
		updatePossibleValues()

		if (animations.length > 0){
			canvasRef.current?.doAnimation(animations)
			if (animations[0].type === 'board') handleComplete()
		}
	}

	function invertNoteMode(){
		setNoteMode(nm => !nm)
		updatePossibleValues()
	}

	function invertShowLinks(){
		setShowLinks(v => !v)
	}

	function eraseSelectedCell(){
		if (GameHandler.complete) return

		if (GameHandler.game.selectedCell !== null){
			GameHandler.game.erase(GameHandler.game.selectedCell)
			updatePossibleValues()
			canvasRef.current?.stopAnimations()
		}
	}

	function handleHintClick(){
		if (GameHandler.complete) return

		let animations = []

		if (GameHandler.game.selectedCell !== null){
			if (hintState === 0){
				setHintState(1)
				setTimeout(() => {setHintState(0)}, 2000)
			} else if (hintState === 1){
				setHintState(0)
				animations = GameHandler.game.hint(GameHandler.game.selectedCell)
				updatePossibleValues()
			}
		}

		if (animations.length > 0){
			canvasRef.current?.doAnimation(animations)
			if (animations[0].type === 'board') handleComplete()
		}
	}

	function handleEraseInkClick(){
		if (eraseInkState === 0){
			setEraseInkState(1)
			setTimeout(() => {setEraseInkState(0)}, 2000)
		} else if (eraseInkState === 1){
			setEraseInkState(0)
			GameHandler.game.clearColors()
			//canvasRef.current.renderFrame()
		}
	}

	function handleUndo(){
		if (GameHandler.complete) return

		GameHandler.game.popBoard()
		canvasRef.current?.stopAnimations()
		updatePossibleValues()
	}

	function handleBrushClick(){
		setBrush(b => !b)
	}

	function handleSetColor(coords, color){
		if (GameHandler.complete) return

		const cell = GameHandler.game.get(coords)
		if (
			cell.value === 0 &&
			(GameHandler.game.mode === 'killer' || cell.notes.length > 1)
		){
			GameHandler.game.setColor(coords, cell.color !== color ? color : 'default')
			canvasRef.current.renderFrame()
		}
	}

	function handleColorButtonClick(color, type){
		if (type === 'primary') handleSetColor(GameHandler.game.selectedCell, color)
		else {
			setLockedColor(oldColor => oldColor === color ? null : color)
		}
	}

	function updatePossibleValues(){
		if (noteMode && GameHandler.game.getSelectedCell().value > 0) setPossibleValues([])
		else setPossibleValues(GameHandler.game.getPossibleValues(GameHandler.game.selectedCell))

		setCompletedNumbers(GameHandler.game.getCompletedNumbers())
	}

	function handleNewGame(difficulty){
		GameHandler.newGame(GameHandler.game.mode, difficulty)
		
		setNoteMode(true)
		setBrush(false)
		setWin(false)
		setShowLinks(false)
		updatePossibleValues()
		setBookmark(GameHandler.currentGameIsBookmarked())
		newGameActionSheetRef.current.close()
	}

	function handleBookmarkClick(){
		if (bookmark){
			setBookmark(false)
			GameHandler.removeBookmark({
				id: GameHandler.game._id,
				mission: GameHandler.game.mission
			})
		} else {
			setBookmark(true)
			GameHandler.bookmarkCurrentGame()
		}
	}

	function handleNewGameClick(){
		if (GameHandler.game.difficulty === 'custom') newGameActionSheetRef.current.open()
		else handleNewGame(GameHandler.game.difficulty)
	}

	useEffect(() => {
		if (GameHandler.game === null){
			navigate('/')
			return
		}

		updatePossibleValues()

		const windowVisibilityChangeEvent = window.addEventListener('visibilitychange', () => {
			if (GameHandler.game && !GameHandler.game.checkComplete()) GameHandler.game.saveToLocalStorage()
		})

		return () => {
			window.removeEventListener('visibilitychange', windowVisibilityChangeEvent)
			GameHandler.game.saveToLocalStorage()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (GameHandler.game === null) return null

	return (
		<Section>
			{/* title={modeTranslations[GameHandler.game.mode]} subtitle={difficultyTranslations[GameHandler.game.difficulty]} */}
			<Topbar title={`${modeTranslations[GameHandler.game.mode]} - ${difficultyTranslations[GameHandler.game.difficulty]}`} titleSize={20} backURL="/">
				<FontAwesomeIcon className={`topbar__buttons__button bookmark-${bookmark ? 'on' : 'off'}`} icon={faBookmark} onClick={handleBookmarkClick} />
				<FontAwesomeIcon className='topbar__buttons__button' icon={faArrowUpFromBracket} onClick={() => {exportActionSheetRef.current.open()}} />
				<FontAwesomeIcon className='topbar__buttons__button' icon={faPlus} onClick={() => {newGameActionSheetRef.current.open()}} />
			</Topbar>
			<SectionContent paddingTop={0}>
				{
					win ? 
					<div className='sudoku__win-screen-wrapper'>
						<div className='sudoku__win-screen'>
							<div className='sudoku__win-screen__title'>¡Excelente!</div>
							<Button title="Nuevo juego" onClick={handleNewGameClick} />
						</div>
					</div> :
					<div className="game">
						<div ref={sudokuRef} className="sudoku">
							<Canvas ref={canvasRef} onClick={onClick} showLinks={showLinks} game={GameHandler.game} lockedInput={lockedInput} theme={theme} />
						</div>
						<div className="numpad" onContextMenu={e => {e.preventDefault()}}>
							{(() => {
								let buttons = []
								const specialButtons = [
									<EditButton key={0} icon={faUndo} title="Undo" onClick={handleUndo}/>,
									<EditButton key={1} icon={faEraser} title="Erase" onClick={eraseSelectedCell}/>,
									<EditButton key={2} icon={faPencilAlt} highlight={noteMode} title="Notes" onClick={invertNoteMode}/>,
									<EditButton key={3} icon={faLightbulb} yellow={hintState === 1} title="Hint" onClick={handleHintClick}/>,
									<EditButton key={4} icon={faLink}  title="Links" highlight={showLinks} onClick={invertShowLinks}/>,
									<EditButton key={8} icon={faDroplet}  title="Paint" highlight={brush} onClick={handleBrushClick}/>,
									<EditButton key={12} icon={faDropletSlash}  title="Erase ink" yellow={eraseInkState === 1} onClick={handleEraseInkClick}/>
								]
								let specialButtonIndex = 0
								for (let y = 0; y < 4; y++){
									for (let x = 0; x < 4; x++){
										if (x === 0 || y === 0) buttons.push(specialButtons[specialButtonIndex++])
										else {
											const key = 4 * y + x
											const buttonIndex = 3 * (y - 1) + x
											buttons.push(brush ?
												<ColorButton
													key={key}
													theme={theme}
													color={colorNames[buttonIndex - 1]}
													locked={lockedColor === colorNames[buttonIndex - 1]}
													onClick={handleColorButtonClick}
												/> :
												<NumpadButton
													key={key}
													number={buttonIndex}
													disabled={possibleValues !== null && !possibleValues.includes(buttonIndex)}
													hidden={completedNumbers.includes(buttonIndex)}
													locked={!completedNumbers.includes(buttonIndex) && lockedInput === buttonIndex}
													onClick={handleNumpadButtonClick}
												/>
											)
										}
									}
								}
								return buttons
							})()}
						</div>
					</div>
				}
			</SectionContent>

			<ActionSheet reference={newGameActionSheetRef} title={`Nuevo juego`} cancelTitle="Cancelar">
				{
					(GameHandler.game.mode === 'classic' ? classicDifficulties : killerDifficulties).map(diff => (
						<ActionSheetButton key={diff} title={difficultyTranslations[diff]} color={diff === 'restart' ? 'var(--red)' : 'var(--theme-color)'} onClick={() => {handleNewGame(diff)}} />
					))
				}
			</ActionSheet>

			<ActionSheet reference={exportActionSheetRef} title={`Exportar tablero`} cancelTitle="Cancelar">
				<ActionSheetButton title="Copiar pistas" onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(true))
						exportActionSheetRef.current.close()
					} catch(e){
						alert(e)
					}
				}} />
				<ActionSheetButton title="Copiar tablero completo" onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(false))
						exportActionSheetRef.current.close()
					} catch(e){
						alert(e)
					}
				}} />
				{
					GameHandler.game.difficulty !== 'custom' ?
					<ActionSheetButton title="Copiar misión" onClick={() => {
						try {
							copy(GameHandler.exportMission())
							exportActionSheetRef.current.close()
						} catch(e){
							alert(e)
						}
					}} /> : null
				}				
			</ActionSheet>
		</Section>
	)
}

export default Sudoku