import './sudoku.css'
import { useEffect, useRef, useState } from 'react'
import { Canvas, Section, SectionContent, Topbar, ActionSheet, ActionSheetButton, Button, ExpandCard, Numpad } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import GameHandler from '../../utils/GameHandler'
import { modeTranslations, difficultyTranslations, classicDifficulties, killerDifficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark, faPause, faPlay, faPlus} from '@fortawesome/free-solid-svg-icons'
import { useStopwatch } from 'react-timer-hook'

export default function Sudoku({theme, accentColor}){
	const [showLinks, setShowLinks] = useState(false)
	const [win, setWin] = useState(false)
	const [bookmark, setBookmark] = useState(GameHandler.currentGameIsBookmarked())
	const [possibleValues, setPossibleValues] = useState([])
	const [completedNumbers, setCompletedNumbers] = useState([])
	const [lockedColor, setLockedColor] = useState(accentColor)
	const [brush, setBrush] = useState(false)
	const [lockedInput, setLockedInput] = useState(0)
	const [noteMode, setNoteMode] = useState(true)
	const [noteDragMode, setNoteDragMode] = useState(null)

	const newGameActionSheetRef = useRef()
	const exportActionSheetRef = useRef()
	const navigate = useNavigate()

	const canvasRef = useRef(null)
	const sudokuRef = useRef(null)

	const topbarNewGameRef = useRef(null)
	const topbarShareRef = useRef(null)
	const topbarBookmarkRef = useRef(null)

	const [newGameExpanded, setNewGameExpanded] = useState(false)
	const [shareExpanded, setShareExpanded] = useState(false)
	const [bookmarkExpanded, setBookmarkExpanded] = useState(false)

	const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [time, setTime] = useState(GameHandler.game?.timer || 0)

	function startTimer(){
    setIsActive(true)
    setIsPaused(false)
  }
  
  function pause(){ 
    setIsPaused(!paused)
  }
  
  const handleReset = () => {
    setIsActive(false)
    setTime(0)
  }

	function handleComplete(){
		pauseTimer()
		setTimeout(() => {
			setWin(true)
			setShowLinks(false)
			setLockedInput(0)
			setLockedColor(accentColor)
		}, 1350) //Must be equal to animation duration in Canvas.js
	}

	function onClick(coords, type, hold){
		let animations = []

		if (brush){
			GameHandler.game.setSelectedCell(coords)
			if (lockedColor !== null) handleSetColor(coords, lockedColor)
		} else {
			const cell = GameHandler.game.get(coords)
			const cellPossibleValues = GameHandler.game.getPossibleValues(coords)

			if (type === 'tertiary') handleSetColor(coords)
			else {
				if (lockedInput === 0){
					GameHandler.game.setSelectedCell(coords)
					if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock && GameHandler.game.mode === 'classic') setLockedInput(cell.value)
				} else {
					if (hold){
						if (cellPossibleValues.includes(lockedInput)){
							if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)){
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
							if ((noteMode || type === 'secondary')){
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

		let animations = GameHandler.game.hint(GameHandler.game.selectedCell)
		updatePossibleValues()

		if (animations.length > 0){
			canvasRef.current?.doAnimation(animations)
			if (animations[0].type === 'board') handleComplete()
		}
	}

	function handleEraseInkClick(){
		GameHandler.game.clearColors()
		canvasRef.current.renderFrame()
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

	function handleSetColor(coords, color = 'purple'){
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
		
		if (GameHandler.game.mode === 'killer') canvasRef.current.clearCageVectors()

		setNoteMode(true)
		setBrush(false)
		setWin(false)
		setShowLinks(false)
		updatePossibleValues()
		setNewGameExpanded(false)
		setBookmark(GameHandler.currentGameIsBookmarked())
		newGameActionSheetRef.current.close()
		topbarNewGameRef.current.collapseH('var(--darkBackground)', 'var(--theme-color)')
		resetTimer()
	}

	function handleNewGameClick(){
		if (GameHandler.game.difficulty === 'custom') newGameActionSheetRef.current.open()
		else handleNewGame(GameHandler.game.difficulty)
	}

	function topbarNewGameClick(){
		setNewGameExpanded(true)
		newGameActionSheetRef.current.open()
		topbarNewGameRef.current.expandH('var(--theme-color)', 'white')
	}

	function topbarShareClick(){
		setShareExpanded(true)
		exportActionSheetRef.current.open()
		topbarShareRef.current.expandH('var(--theme-color)', 'white')
	}

	function topbarBookmarkClick(){
		setBookmarkExpanded(true)

		if (bookmark){
			setBookmark(false)
			GameHandler.removeBookmark({
				id: GameHandler.game.id,
				mission: GameHandler.game.mission
			})

			topbarBookmarkRef.current.expandH('var(--red)', 'white')
		} else {
			setBookmark(true)
			GameHandler.bookmarkCurrentGame()

			topbarBookmarkRef.current.expandH('var(--theme-color)', 'white')
		}

		setTimeout(() => {
			setBookmarkExpanded(false)
			topbarBookmarkRef.current.collapseH('var(--darkBackground)', bookmark ? 'var(--theme-color)' : 'white')
		}, 1000)
	}

	function handleTimerClick(){
		if (win) return
		canvasRef.current.stopAnimations()
		if (paused){
			startTimer()
			setPaused(false)
			canvasRef.current.doAnimation([{type: 'fadein'}])
		} else {
			pauseTimer()
			setPaused(true)
			canvasRef.current.doAnimation([{type: 'fadeout'}])
		}
	}

	useEffect(() => {
		GameHandler.game.setTimer(seconds + minutes * 60 + hours * 3600 + days * 24 * 3600)
	}, [seconds, minutes, hours, days])

	useEffect(() => {
		if (GameHandler.game === null){
			navigate('/')
			return
		}

		updatePossibleValues()

		const windowVisibilityChangeEvent = window.addEventListener('visibilitychange', () => {
			if (GameHandler.game && !GameHandler.game.checkComplete()) GameHandler.game.saveToLocalStorage()
			/*if (document.visibilityState === 'visible') {
				if (!paused) startTimer()
			} else pauseTimer()*/
		})

		return () => {
			window.removeEventListener('visibilitychange', windowVisibilityChangeEvent)
			GameHandler.game.saveToLocalStorage()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (GameHandler.game === null) return null

	const totalHours = days * 24 + hours > 0 ? days * 24 + hours + ':' : ''
	const paddedMinutes = ('00'+minutes).slice(-2)
	const paddedSeconds = ('00'+seconds).slice(-2)

	return (
		<Section>
			<Topbar
				title={modeTranslations[GameHandler.game.mode]}
				subtitle={difficultyTranslations[GameHandler.game.difficulty]}
				titleSize={20}
				backURL="/"
				buttons={[
					<ExpandCard key={0} className='topbar__button' style={{display: 'flex', gap: 5, color: paused ? 'white' : 'var(--topbarFontColor)', backgroundColor: paused ? 'var(--red)' : 'var(--darkBackground)'}} onClick={handleTimerClick}>
						<p style={{fontSize: 18}}>{`${totalHours}${paddedMinutes}:${paddedSeconds}`}</p>
						{!win ? <FontAwesomeIcon icon={paused ? faPlay : faPause} fontSize={18}/> : null}
					</ExpandCard>,
					<ExpandCard key={1} ref={topbarBookmarkRef} className='topbar__button' expanded={bookmarkExpanded} onClick={topbarBookmarkClick}>{bookmarkExpanded ? (bookmark ? 'Guardado' : 'Eliminado') : <FontAwesomeIcon className={`topbar__buttons__button bookmark-${bookmark ? 'on' : 'off'}`} icon={faBookmark} />}</ExpandCard>,
					<ExpandCard key={2} ref={topbarShareRef} className='topbar__button' expanded={shareExpanded} onClick={topbarShareClick}>{shareExpanded ? 'Compartir' : <FontAwesomeIcon className='topbar__buttons__button' icon={faArrowUpFromBracket} />}</ExpandCard>,
					<ExpandCard key={3} ref={topbarNewGameRef} className='topbar__button' expanded={newGameExpanded} onClick={topbarNewGameClick}>{newGameExpanded ? 'Nuevo juego' : <FontAwesomeIcon className='topbar__buttons__button' icon={faPlus} />}</ExpandCard>
				]}
				onTitleClick={topbarNewGameClick}
			>
				
			</Topbar>
			
			<SectionContent>
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
							<Canvas ref={canvasRef} onClick={onClick} showLinks={showLinks} game={GameHandler.game} lockedInput={lockedInput} theme={theme} accentColor={accentColor} paused={paused}/>
						</div>
						<Numpad
							onUndo={handleUndo}
							onErase={eraseSelectedCell}
							onNote={invertNoteMode}
							noteState={noteMode}
							onHint={handleHintClick}
							onLinks={invertShowLinks}
							linkState={showLinks}
							onColor={handleBrushClick}
							colorState={brush}
							onEraseInk={handleEraseInkClick}
							lockedInput={lockedInput}
							lockedColor={lockedColor}
							possibleValues={possibleValues}
							completedNumbers={completedNumbers}
							onColorButtonClick={handleColorButtonClick}
							onNumpadButtonClick={handleNumpadButtonClick}
						/>
					</div>
				}
			</SectionContent>
			
			<ActionSheet
				reference={newGameActionSheetRef}
				title={`Nuevo juego`}
				cancelTitle="Cancelar"
				onClose={() => {
					setNewGameExpanded(false)
					topbarNewGameRef.current.collapseH('var(--darkBackground)', 'var(--theme-color)')}
				}
				showTopbar
			>
				{
					(GameHandler.game.mode === 'classic' ? classicDifficulties : killerDifficulties).map(diff => (
						<ActionSheetButton key={diff} title={difficultyTranslations[diff]} color={diff === 'restart' ? 'var(--red)' : 'var(--theme-color)'} onClick={() => {handleNewGame(diff)}} />
					))
				}
			</ActionSheet>

			<ActionSheet
				reference={exportActionSheetRef}
				title={`Exportar tablero`}
				cancelTitle="Cancelar"
				onClose={() => {
					setShareExpanded(false)
					topbarShareRef.current.collapseH('var(--darkBackground)', 'var(--theme-color)')
				}}
				showTopbar
			>
				<ActionSheetButton title="Copiar pistas" onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(true))
						exportActionSheetRef.current.close()

						setShareExpanded(false)
						topbarShareRef.current.collapseH('var(--darkBackground)', 'var(--theme-color)')
					} catch(e){
						alert(e)
					}
				}} />
				<ActionSheetButton title="Copiar tablero completo" onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(false))
						exportActionSheetRef.current.close()

						setShareExpanded(false)
						topbarShareRef.current.collapseH('var(--darkBackground)', 'var(--theme-color)')
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

							setShareExpanded(false)
							topbarShareRef.current.collapseH('var(--darkBackground)', 'var(--theme-color)')
						} catch(e){
							alert(e)
						}
					}} /> : null
				}				
			</ActionSheet>
		</Section>
	)
}