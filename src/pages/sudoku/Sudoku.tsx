import './sudoku.css'
import { useEffect, useState } from 'react'
import { Section, SectionContent, Topbar, ActionSheet, ActionSheetButton, Button } from '../../components'
import GameHandler from '../../utils/GameHandler'
import { DifficultyName, difficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark as bookmarkSolid, faInfoCircle, faPause, faPlay, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as bookmarkRegular } from '@fortawesome/free-regular-svg-icons'
import { useTranslation } from 'react-i18next'
import { millisecondsToHMS } from '../../utils/Statistics'
import SVGMenu from '../../svg/menu'
import SVGRestart from '../../svg/restart'
import ClassicGame from '../../gameModes/classic/ClassicGame'
import { ThemeName } from '../../utils/DataTypes'
import { AccentColor } from '../../utils/Colors'

type Props = {
	theme: ThemeName;
	accentColor: AccentColor;
}

export default function Sudoku({ theme, accentColor }: Props) {
	const [win, setWin] = useState(false);
	const [bookmark, setBookmark] = useState(GameHandler.currentGameIsBookmarked());
	const [menuActionSheetIsOpen, setMenuActionSheetIsOpen] = useState(false);
	const [exportActionSheetIsOpen, setExportActionSheetIsOpen] = useState(false);

	const navigate = useNavigate()

	const [isTimerRunning, setIsTimerRunning] = useState(true)
	const [paused, setPaused] = useState(false)
	const [time, setTime] = useState(GameHandler.game?.timer || 0)

	const { t } = useTranslation()

	useEffect(() => {
		let interval = null

		if (isTimerRunning && !paused) {
			interval = setInterval(() => {
				setTime((time) => {
					GameHandler.game?.setTimer(time + 100)
					return time + 100
				})
			}, 100)
		} else {
			if (interval) clearInterval(interval);
		}

		return () => { if (interval) clearInterval(interval) }
	}, [isTimerRunning, paused])

	function resetTimer() {
		setIsTimerRunning(true)
		setPaused(false)
		setTime(0)
	}

	function handleComplete() {
		setIsTimerRunning(false);
		setTimeout(() => {
			setWin(true);
		}, 1350) //Must be equal to animation duration in canvas
	}

	function handleNewGame(difficulty: DifficultyName) {
		if (!GameHandler.game) return;
		GameHandler.newGame(GameHandler.game.mode, difficulty)

		setWin(false)
		setBookmark(GameHandler.currentGameIsBookmarked())

		resetTimer()

		setMenuActionSheetIsOpen(false);
		setExportActionSheetIsOpen(false);
	}

	function handleNewGameClick() {
		if (!GameHandler.game) return;

		if (GameHandler.game.difficulty === 'unrated') {
			setMenuActionSheetIsOpen(true);
			setExportActionSheetIsOpen(false);
		}
		else handleNewGame(GameHandler.game.difficulty);
	}

	function topbarMenuClick() {
		setMenuActionSheetIsOpen(true);
		setExportActionSheetIsOpen(false);
		setPaused(true);
	}

	function menuShareClick() {
		setMenuActionSheetIsOpen(false);
		setExportActionSheetIsOpen(true);
	}

	function menuBookmarkClick() {
		if (!GameHandler.game) return;

		if (bookmark) {
			setBookmark(false);
			if (GameHandler.game.id !== ''){
				GameHandler.removeBookmark({
					id: GameHandler.game.id
				});
			} else {
				GameHandler.removeBookmark({
					m: GameHandler.game.mission
				});
			}
		} else {
			setBookmark(true);
			GameHandler.bookmarkCurrentGame();
		}
	}

	function handleTimerClick() {
		if (win) return;

		setPaused(p => !p);
	}

	useEffect(() => {
		if (GameHandler.game === null) {
			navigate('/');
			return;
		}

		const windowVisibilityChangeEvent = () => {
			if (!GameHandler.game?.checkComplete()) GameHandler.game?.saveToLocalStorage();
			if (document.visibilityState === 'visible') {
				if (!paused) setIsTimerRunning(true);
			} else setIsTimerRunning(false);
		};

		window.addEventListener('visibilitychange', windowVisibilityChangeEvent);

		return () => {
			window.removeEventListener('visibilitychange', windowVisibilityChangeEvent);
			GameHandler.game?.saveToLocalStorage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (paused){
			setIsTimerRunning(false);
		} else {
			setIsTimerRunning(true);
		}
	}, [paused]);

	useEffect(() => {
		if (!menuActionSheetIsOpen) setPaused(false);
	}, [menuActionSheetIsOpen]);

	if (GameHandler.game === null) return null

	return (
		<Section>
			<Topbar
				title={t(`gameModes.${GameHandler.game.mode}`)}
				subtitle={t(`gameDifficulties.${GameHandler.game.difficulty}`)}
				backURL="/"
				buttons={[
					<div key={0} style={{ display: 'grid', placeContent: 'center', marginRight: 5 }} onClick={topbarMenuClick}><SVGMenu className='sudoku__open-menu-button' strokeTop='var(--primaryIconColor)' strokeBottom='var(--secondaryIconColor)' /></div>
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
						(
							GameHandler.game.mode === 'classic' ? <ClassicGame theme={theme} accentColor={accentColor} paused={paused} handleComplete={handleComplete} /> :
							null
						)
				}
			</SectionContent>

			<ActionSheet
				isOpen={menuActionSheetIsOpen}
				onClose={() => setMenuActionSheetIsOpen(false)}
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
							difficulties[GameHandler.game.mode].map(diff => (
								<div key={diff} className='context-menu__button' onClick={() => handleNewGame(diff)}>
									<FontAwesomeIcon icon={faPlusSquare} fontSize={24} />
									<p>{t(`gameDifficulties.${diff}`)}</p>
								</div>
							))
						}
						<div className='context-menu__button' style={{color: 'white', backgroundColor: 'var(--red)'}}>
							<SVGRestart className='sudoku__restart-icon' stroke='white' />
							<p>{t('gameDifficulties.restart')}</p>
						</div>
					</div>
				</div>
			</ActionSheet>

			<ActionSheet
				isOpen={exportActionSheetIsOpen}
				cancelTitle={t('common.cancel')}
				onClose={() => setExportActionSheetIsOpen(false)}
			>
				<ActionSheetButton title={t('sudoku.copyClues')} onClick={() => {
					try {
						if (GameHandler.game) copy(GameHandler.game.getTextRepresentation(true));
						setExportActionSheetIsOpen(false);
					} catch (e) {
						alert(t('sudoku.exportError'));
					}
				}} />
				<ActionSheetButton title={t('sudoku.copyFullBoard')} onClick={() => {
					try {
						if (GameHandler.game) copy(GameHandler.game.getTextRepresentation(false));
						setExportActionSheetIsOpen(false);
					} catch (e) {
						alert(t('sudoku.exportError'));
					}
				}} />
				{
					GameHandler.game.difficulty !== 'unrated' ?
						<ActionSheetButton title={t('sudoku.copyMission')} onClick={() => {
							try {
								if (GameHandler.game) copy(GameHandler.exportMission())
								setExportActionSheetIsOpen(false);
							} catch (e) {
								alert(t('sudoku.exportError'))
							}
						}} /> : null
				}
			</ActionSheet>
		</Section>
	)
}
