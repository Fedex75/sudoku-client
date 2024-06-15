import './sudoku.css'
import { useEffect, useRef, useState } from 'react'
import { Canvas, Section, SectionContent, Topbar, ActionSheet, ActionSheetButton, Button, Numpad } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import GameHandler from '../../utils/GameHandler'
import { classicDifficulties, killerDifficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark as bookmarkSolid, faClock, faInfoCircle, faPause, faPlay, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as bookmarkRegular } from '@fortawesome/free-regular-svg-icons'
import { useTranslation } from 'react-i18next'
import { millisecondsToHMS } from '../../utils/Statistics'
import SVGMenu from '../../svg/menu'
import SVGRestart from '../../svg/restart'

export default function Sudoku({ theme, accentColor }) {
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

	const menuActionSheetRef = useRef()
	const exportActionSheetRef = useRef()
	const navigate = useNavigate()

	const canvasRef = useRef(null)

	const [isTimerRunning, setIsTimerRunning] = useState(true)
	const [paused, setPaused] = useState(false)
	const [time, setTime] = useState(GameHandler.game?.board.timer || 0)

	const { t } = useTranslation()

	useEffect(() => {
		let interval = null

		if (isTimerRunning && !paused) {
			interval = setInterval(() => {
				setTime((time) => {
					GameHandler.game.board.setTimer(time + 100)
					return time + 100
				})
			}, 100)
		} else clearInterval(interval)

		return () => { clearInterval(interval) }
	}, [isTimerRunning, paused])

	function startTimer() {
		setIsTimerRunning(true)
		setPaused(false)
	}

	function pauseTimer() {
		setIsTimerRunning(false)
		setPaused(true)
	}

	function resetTimer() {
		setIsTimerRunning(true)
		setPaused(false)
		setTime(0)
	}

	function handleComplete() {
		setIsTimerRunning(false)
		setTimeout(() => {
			setWin(true)
			setShowLinks(false)
			setLockedInput(0)
			setLockedColor(accentColor)
		}, 1350) //Must be equal to animation duration in Canvas.js
	}

	function onClick(coords, type, hold) {
		/*let animations = []

		if (brush) {
			GameHandler.game.setSelectedCell(coords)
			if (lockedColor !== null) handleSetColor(coords, lockedColor)
		} else {
			const cell = GameHandler.game.get(coords)
			const cellPossibleValues = GameHandler.game.getPossibleValues(coords)

			if (type === 'tertiary') handleSetColor(coords)
			else {
				if (lockedInput === 0) {
					GameHandler.game.setSelectedCell(coords)
					if (cell.value > 0 && SettingsHandler.settings.autoChangeInputLock && GameHandler.game.mode === 'classic') setLockedInput(cell.value)
				} else {
					if (hold) {
						if (cellPossibleValues.includes(lockedInput)) {
							if ((noteMode || type === 'secondary') && (cellPossibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
								if (cell.notes.includes(lockedInput) !== noteDragMode || GameHandler.game.onlyAvailableInBox(coords, lockedInput)) [, animations] = GameHandler.game.setNote(coords, lockedInput)
							} else {
								if (cell.value === 0) animations = GameHandler.game.setValue(coords, lockedInput)
							}
						}
					} else {
						GameHandler.game.setSelectedCell(coords)
						if (cell.value > 0) {
							setLockedInput(li => cell.value === li ? 0 : cell.value)
						} else {
							if ((noteMode || type === 'secondary')) {
								if (SettingsHandler.settings.autoSolveNakedSingles && cellPossibleValues.length === 1) {
									if (cellPossibleValues.includes(lockedInput)) animations = GameHandler.game.setValue(coords, lockedInput)
								} else {
									if (cell.notes.includes(lockedInput) || cellPossibleValues.includes(lockedInput)) {
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

		if (animations.length > 0) {
			canvasRef.current?.doAnimation(animations)
			if (animations[0].type === 'board') handleComplete()
		}*/
	}

	function handleNumpadButtonClick(number, type) {
		if (GameHandler.complete) return

		let animations = []

		if (type === 'primary') {
			if (possibleValues.includes(number)) {
				if (noteMode && (possibleValues.length > 1 || !SettingsHandler.settings.autoSolveNakedSingles)) {
					[, animations] = GameHandler.game.setNote(GameHandler.game.selectedCell, number)
				} else {
					if (lockedInput > 0) setLockedInput(number)
					animations = GameHandler.game.setValue(GameHandler.game.selectedCell, number)
				}
			}
		} else setLockedInput(li => li === number ? 0 : number)
		updatePossibleValues()

		if (animations.length > 0) {
			canvasRef.current?.doAnimation(animations)
			if (animations[0].type === 'board') handleComplete()
		}
	}

	function invertNoteMode() {
		setNoteMode(nm => !nm)
		updatePossibleValues()
	}

	function invertShowLinks() {
		setShowLinks(v => !v)
	}

	function eraseSelectedCell() {
		if (GameHandler.complete) return

		if (GameHandler.game.selectedCell !== null) {
			GameHandler.game.erase(GameHandler.game.selectedCell)
			updatePossibleValues()
			canvasRef.current?.stopAnimations()
		}
	}

	function handleHintClick() {
		if (GameHandler.complete) return

		let animations = GameHandler.game.hint(GameHandler.game.selectedCell)
		updatePossibleValues()

		if (animations.length > 0) {
			canvasRef.current?.doAnimation(animations)
			if (animations[0].type === 'board') handleComplete()
		}
	}

	function handleEraseInkClick() {
		GameHandler.game.clearColors()
		canvasRef.current.renderFrame()
	}

	function handleUndo() {
		if (GameHandler.complete) return

		GameHandler.game.popBoard()
		canvasRef.current?.stopAnimations()
		updatePossibleValues()
	}

	function handleBrushClick() {
		setBrush(b => !b)
	}

	function handleSetColor(coords, color = accentColor) {
		if (GameHandler.complete) return

		const cell = GameHandler.game.get(coords)
		if (
			cell.value === 0 &&
			(GameHandler.game.mode === 'killer' || cell.notes.length > 1)
		) {
			GameHandler.game.setColor(coords, cell.color !== color ? color : 'default')
			canvasRef.current.renderFrame()
		}
	}

	function handleColorButtonClick(color, type) {
		if (type === 'primary') handleSetColor(GameHandler.game.selectedCell, color)
		else {
			setLockedColor(oldColor => oldColor === color ? null : color)
		}
	}

	function updatePossibleValues() {
		if (noteMode && GameHandler.game.getSelectedCell().value > 0) setPossibleValues([])
		else setPossibleValues(GameHandler.game.getPossibleValues(GameHandler.game.selectedCell))

		setCompletedNumbers(GameHandler.game.getCompletedNumbers())
	}

	function handleNewGame(difficulty) {
		GameHandler.newGame(GameHandler.game.mode, difficulty)

		setNoteMode(true)
		setBrush(false)
		setWin(false)
		setShowLinks(false)
		updatePossibleValues()
		setBookmark(GameHandler.currentGameIsBookmarked())
		menuActionSheetRef.current.close()
		resetTimer()
	}

	function handleNewGameClick() {
		if (GameHandler.game.difficulty === 'custom') {
			menuActionSheetRef.current.open()
			exportActionSheetRef.current.close()
		}
		else handleNewGame(GameHandler.game.difficulty)
	}

	function topbarMenuClick() {
		menuActionSheetRef.current.open()
		exportActionSheetRef.current.close()
	}

	function menuShareClick() {
		exportActionSheetRef.current.open()
		menuActionSheetRef.current.close()
	}

	function menuBookmarkClick() {
		if (bookmark) {
			setBookmark(false)
			GameHandler.removeBookmark({
				id: GameHandler.game.id,
				mission: GameHandler.game.mission
			})
		} else {
			setBookmark(true)
			GameHandler.bookmarkCurrentGame()
		}
	}

	function handleTimerClick() {
		if (win) return
		canvasRef.current.stopAnimations()
		if (paused) {
			startTimer()
			setPaused(false)
			canvasRef.current.doAnimation([{ type: 'fadein' }])
		} else {
			pauseTimer()
			setPaused(true)
			canvasRef.current.doAnimation([{ type: 'fadeout' }])
		}
	}

	useEffect(() => {
		if (GameHandler.game === null) {
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

	return (
		<Section>
			<Topbar
				title={t(`gameModes.${GameHandler.game.mode}`)}
				subtitle={t(`gameDifficulties.${GameHandler.game.difficulty}`)}
				titleSize={20}
				backURL="/"
				buttons={[
					<div key={0} style={{ display: 'grid', placeContent: 'center', marginRight: 5 }} onClick={topbarMenuClick}><SVGMenu height={12} strokeTop='var(--primaryIconColor)' strokeBottom='var(--secondaryIconColor)' /></div>
				]}
			>
				<div className='sudoku__timer' style={{ color: paused ? 'white' : 'var(--topbarFontColor)', backgroundColor: paused ? 'var(--red)' : 'var(--darkBackground)' }} onClick={handleTimerClick}>
					<p className='sudoku__timer__time'>{millisecondsToHMS(time)}</p>
					{!win ? <FontAwesomeIcon icon={paused ? faPlay : faPause} fontSize={18} /> : null}
				</div>
			</Topbar>

			<SectionContent>
				{
					win ?
						<div className='sudoku__win-screen-wrapper'>
							<div className='sudoku__win-screen'>
								<div className='sudoku__win-screen__title'>{t('sudoku.excellent')}</div>
								<div className='sudoku__win-screen__stat'>
									<div className='sudoku__win-screen__stat__title'>{t('sudoku.time')}</div>
									<div className='sudoku__win-screen__stat__value'>{millisecondsToHMS(GameHandler.game.timer)}</div>
								</div>
								<div className='sudoku__win-screen__stat'>
									<div className='sudoku__win-screen__stat__title'>{t('sudoku.average')}</div>
									<div className='sudoku__win-screen__stat__value'>{millisecondsToHMS(GameHandler.statistics[GameHandler.game.mode][GameHandler.game.difficulty].average)}</div>
								</div>
								<div className='sudoku__win-screen__stat'>
									<div className='sudoku__win-screen__stat__title'>{t('sudoku.best')}</div>
									<div className='sudoku__win-screen__stat__value'>{millisecondsToHMS(GameHandler.statistics[GameHandler.game.mode][GameHandler.game.difficulty].best)}</div>
								</div>
								<Button title={t('sudoku.newGame')} onClick={handleNewGameClick} />
							</div>
						</div> :
						<div className="game">
							<div className="sudoku">
								<Canvas ref={canvasRef} onClick={onClick} showLinks={showLinks} game={GameHandler.game} lockedInput={lockedInput} theme={theme} accentColor={accentColor} paused={paused} />
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
				reference={menuActionSheetRef}
				showHandle
			>
				<div className='sudoku__context-menu'>
					<div className='context-menu__button vertical' style={{ gridArea: 'save' }} onClick={menuBookmarkClick}>
						<FontAwesomeIcon icon={bookmark ? bookmarkSolid : bookmarkRegular} fontSize={24} />
						<p>{t('common.save')}</p>
					</div>
					<div className='context-menu__button vertical' style={{ gridArea: 'share' }} onClick={menuShareClick}>
						<FontAwesomeIcon icon={faArrowUpFromBracket} fontSize={24} />
						<p>{t('common.share')}</p>
					</div>
					<div className='context-menu__button' style={{ gridArea: 'rules', marginTop: 25, marginBottom: 25 }}>
						<FontAwesomeIcon icon={faInfoCircle} fontSize={24} />
						<p>{t('sudoku.rules')}</p>
					</div>
					<div className='sudoku__context-menu__buttons' style={{ gridArea: 'buttons' }}>
						{
							(GameHandler.game.mode === 'classic' ? classicDifficulties : killerDifficulties).map(diff => (
								<div key={diff} className='context-menu__button' onClick={() => handleNewGame(diff)}>
									<FontAwesomeIcon icon={faPlusSquare} fontSize={24} />
									<p>{t(`gameDifficulties.${diff}`)}</p>
								</div>
							))
						}
						<div className='context-menu__button' style={{color: 'white', backgroundColor: 'var(--red)'}}>
							<SVGRestart fill='white' stroke='white' height={24} />
							<p>{t('gameDifficulties.restart')}</p>
						</div>
					</div>
				</div>
			</ActionSheet>

			<ActionSheet
				reference={exportActionSheetRef}
				cancelTitle={t('common.cancel')}
			>
				<ActionSheetButton title={t('sudoku.copyClues')} onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(true))
						exportActionSheetRef.current.close()
					} catch (e) {
						alert(t('sudoku.exportError'))
					}
				}} />
				<ActionSheetButton title={t('sudoku.copyFullBoard')} onClick={() => {
					try {
						copy(GameHandler.game.getTextRepresentation(false))
						exportActionSheetRef.current.close()
					} catch (e) {
						alert(t('sudoku.exportError'))
					}
				}} />
				{
					GameHandler.game.difficulty !== 'custom' ?
						<ActionSheetButton title={t('sudoku.copyMission')} onClick={() => {
							try {
								copy(GameHandler.exportMission())
								exportActionSheetRef.current.close()
							} catch (e) {
								alert(t('sudoku.exportError'))
							}
						}} /> : null
				}
			</ActionSheet>
		</Section>
	)
}
