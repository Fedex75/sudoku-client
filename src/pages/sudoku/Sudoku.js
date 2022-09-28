import './sudoku.css'
import { useEffect, useRef, useState } from 'react'
import { Canvas, Section, SectionContent, Topbar, ActionSheet, ActionSheetButton, Button, ExpandCard, Numpad } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import GameHandler from '../../utils/GameHandler'
import { classicDifficulties, killerDifficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark, faPause, faPlay, faPlus} from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

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

	const topbarRef = useRef(null)

	/*const topbarNewGameRef = useRef(null)
	const topbarShareRef = useRef(null)
	const topbarBookmarkRef = useRef(null)*/

	const [newGameExpanded, setNewGameExpanded] = useState(false)
	const [shareExpanded, setShareExpanded] = useState(false)
	const [bookmarkExpanded, setBookmarkExpanded] = useState(false)

	const [isTimerRunning, setIsTimerRunning] = useState(true)
	const [paused, setPaused] = useState(false)
	const [time, setTime] = useState(GameHandler.game?.timer || 0)

	const {t} = useTranslation()

	useEffect(() => {
	let interval = null
  
	if (isTimerRunning && !paused){
	  interval = setInterval(() => {
		setTime((time) => {
					GameHandler.game.setTimer(time + 100)
					return time + 100
				})
	  }, 100)
	} else clearInterval(interval)

	return () => { clearInterval(interval) }
  }, [isTimerRunning, paused])

	function startTimer(){
	setIsTimerRunning(true)
	setPaused(false)
  }
  
	function pauseTimer(){ 
		setIsTimerRunning(false)
		setPaused(true)
	}
  
  	function resetTimer(){
		setIsTimerRunning(true)
		setPaused(false)
		setTime(0)
	}

	function handleComplete(){
		setIsTimerRunning(false)
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
								if (cell.notes.includes(lockedInput) !== noteDragMode || GameHandler.game.onlyAvailableInBox(coords, lockedInput)) [, animations] = GameHandler.game.setNote(coords, lockedInput)
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

	function handleSetColor(coords, color = accentColor){
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
		setNewGameExpanded(false)
		setBookmark(GameHandler.currentGameIsBookmarked())
		newGameActionSheetRef.current.close()
		topbarRef.current.collapse({newBackgroundColor: 'var(--darkBackground)', newFontColor: 'var(--theme-color)'})
		resetTimer()
	}

	function handleNewGameClick(){
		if (GameHandler.game.difficulty === 'custom'){
			newGameActionSheetRef.current.open()
			exportActionSheetRef.current.close()
		}
		else handleNewGame(GameHandler.game.difficulty)
	}

	function topbarNewGameClick(){
		setNewGameExpanded(true)
		setShareExpanded(false)
		newGameActionSheetRef.current.open()
		exportActionSheetRef.current.close()
		topbarRef.current.expand({buttonIndex: 3, newBackgroundColor: 'var(--theme-color)', newFontColor: 'white'})
	}

	function topbarShareClick(){
		setShareExpanded(true)
		setNewGameExpanded(false)
		exportActionSheetRef.current.open()
		newGameActionSheetRef.current.close()
		topbarRef.current.expand({buttonIndex: 2, newBackgroundColor: 'var(--theme-color)', newFontColor: 'white'})
	}

	function topbarBookmarkClick(){
		setBookmarkExpanded(true)

		if (bookmark){
			setBookmark(false)
			GameHandler.removeBookmark({
				id: GameHandler.game.id,
				mission: GameHandler.game.mission
			})

			topbarRef.current.expand({buttonIndex: 1, newBackgroundColor: 'var(--red)', newFontColor: 'white'})
		} else {
			setBookmark(true)
			GameHandler.bookmarkCurrentGame()

			topbarRef.current.expand({buttonIndex: 1, newBackgroundColor: 'var(--theme-color)', newFontColor: 'white'})
		}

		setTimeout(() => {
			setBookmarkExpanded(false)
			topbarRef.current.collapse({newBackgroundColor: 'var(--darkBackground)', newFontColor: bookmark ? 'var(--theme-color)' : 'white'})
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
		if (GameHandler.game === null){
			navigate('/')
			return
		}

		updatePossibleValues()

		const windowVisibilityChangeEvent = window.addEventListener('visibilitychange', () => {
			if (GameHandler.game && !GameHandler.game.checkComplete()) GameHandler.game.saveToLocalStorage()
			if (document.visibilityState === 'visible') {
				if (!paused) setIsTimerRunning(true)
			} else setIsTimerRunning(false)
		})

		return () => {
			window.removeEventListener('visibilitychange', windowVisibilityChangeEvent)
			GameHandler.game.saveToLocalStorage()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	if (GameHandler.game === null) return null

	let totalHours = Math.floor((time / 3600000) % 60)
	totalHours = totalHours > 0 ? totalHours + ':' : ''
	const paddedMinutes = ('0' + Math.floor((time / 60000) % 60)).slice(-2)
	const paddedSeconds = ('0' + Math.floor((time / 1000) % 60)).slice(-2)

	return (
		<Section>
			<Topbar
				ref={topbarRef}
				title={t(`gameModes.${GameHandler.game.mode}`)}
				subtitle={t(`gameDifficulties.${GameHandler.game.difficulty}`)}
				titleSize={20}
				backURL="/"
				buttons={[
					<ExpandCard key={0} className='topbar__button' style={{display: 'flex', gap: 5, color: paused ? 'white' : 'var(--topbarFontColor)', backgroundColor: paused ? 'var(--red)' : 'var(--darkBackground)'}} onClick={handleTimerClick}>
						<p style={{fontSize: 18}}>{`${totalHours}${paddedMinutes}:${paddedSeconds}`}</p>
						{!win ? <FontAwesomeIcon icon={paused ? faPlay : faPause} fontSize={18}/> : null}
					</ExpandCard>,
					<ExpandCard key={1} className='topbar__button' expanded={bookmarkExpanded} onClick={topbarBookmarkClick}>{bookmarkExpanded ? (bookmark ? t('sudoku.saved') : t('sudoku.removed')) : <FontAwesomeIcon className={`topbar__buttons__button bookmark-${bookmark ? 'on' : 'off'}`} icon={faBookmark} />}</ExpandCard>,
					<ExpandCard key={2} className='topbar__button' expanded={shareExpanded} onClick={topbarShareClick}>{shareExpanded ? t('sudoku.share') : <FontAwesomeIcon className='topbar__buttons__button' icon={faArrowUpFromBracket} />}</ExpandCard>,
					<ExpandCard key={3} className='topbar__button' expanded={newGameExpanded} onClick={topbarNewGameClick}>{newGameExpanded ? t('sudoku.newGame') : <FontAwesomeIcon className='topbar__buttons__button' icon={faPlus} />}</ExpandCard>
				]}
				onTitleClick={topbarNewGameClick}
			>
				
			</Topbar>
			
			<SectionContent>
				{
					win ? 
					<div className='sudoku__win-screen-wrapper'>
						<div className='sudoku__win-screen'>
							<div className='sudoku__win-screen__title'>{t('sudoku.excellent')}</div>
							<Button title={t('sudoku.newGame')} onClick={handleNewGameClick} />
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
				title={t('sudoku.newGame')}
				cancelTitle={t('common.cancel')}
				onClose={() => {
					setNewGameExpanded(false)
					topbarRef.current.collapse({newBackgroundColor: 'var(--darkBackground)', newFontColor: 'var(--theme-color)'})
				}}
				showTopbar
			>
				{
					(GameHandler.game.mode === 'classic' ? classicDifficulties : killerDifficulties).map(diff => (
						<ActionSheetButton key={diff} title={t(`gameDifficulties.${diff}`)} color={diff === 'restart' ? 'var(--red)' : 'var(--theme-color)'} onClick={() => {handleNewGame(diff)}} />
					))
				}
			</ActionSheet>

			<ActionSheet
				reference={exportActionSheetRef}
				title={t('sudoku.export')}
				cancelTitle={t('common.cancel')}
				onClose={() => {
					setShareExpanded(false)
					topbarRef.current.collapse({newBackgroundColor: 'var(--darkBackground)', newFontColor: 'var(--theme-color)'})
				}}
				showTopbar
			>
				<ActionSheetButton title={t('sudoku.copyClues')} onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(true))
						exportActionSheetRef.current.close()

						setShareExpanded(false)
						topbarRef.current.collapse({newBackgroundColor: 'var(--darkBackground)', newFontColor: 'var(--theme-color)'})
					} catch(e){
						alert(t('sudoku.exportError'))
					}
				}} />
				<ActionSheetButton title={t('sudoku.copyFullBoard')} onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(false))
						exportActionSheetRef.current.close()

						setShareExpanded(false)
						topbarRef.current.collapse({newBackgroundColor: 'var(--darkBackground)', newFontColor: 'var(--theme-color)'})
					} catch(e){
						alert(t('sudoku.exportError'))
					}
				}} />
				{
					GameHandler.game.difficulty !== 'custom' ?
					<ActionSheetButton title={t('sudoku.copyMission')} onClick={() => {
						try {
							copy(GameHandler.exportMission())
							exportActionSheetRef.current.close()

							setShareExpanded(false)
							topbarRef.current.collapse({newBackgroundColor: 'var(--darkBackground)', newFontColor: 'var(--theme-color)'})
						} catch(e){
							alert(t('sudoku.exportError'))
						}
					}} /> : null
				}				
			</ActionSheet>
		</Section>
	)
}