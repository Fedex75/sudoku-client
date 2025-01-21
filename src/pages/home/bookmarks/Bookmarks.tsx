import './bookmarks.css'
import { faBookmark, faCheck, faPlay, faChartSimple, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { ActionSheet, ActionSheetButton } from '../../../components'
import { getDifficulty, getMode, GameModeIdentifier, DifficultyIdentifier } from "../../../utils/Difficulties"
import GameHandler from "../../../utils/GameHandler"
import missionsData from '../../../data/missions.json'
import { useTranslation } from 'react-i18next'
import { Bookmark, MissionsData, RawGameData, isIDBookmark } from '../../../utils/DataTypes'
import Board from '../../../game/Board'
import Canvas from '../../../game/Canvas'
import { AccentColor } from '../../../utils/Colors'
import { rulesets } from '../../../game/gameModes/Rulesets'
import { ThemeName } from '../../../game/Themes'

type Props = {
	theme: ThemeName
	accentColor: AccentColor
}

const missions: MissionsData = missionsData as MissionsData

function Bookmarks({ theme, accentColor }: Props) {
	const [bookmarks, setBookmarks] = useState(GameHandler.bookmarks)
	const [removeBookmarkData, setRemoveBookmarkData] = useState<Bookmark>()
	const [playBookmarkData, setPlayBookmarkData] = useState<Bookmark>()
	const [clearBookmarksActionSheetIsOpen, setClearBookmarksActionSheetIsOpen] = useState(false)
	const [removeBookmarkActionSheetIsOpen, setRemoveBookmarkActionSheetIsOpen] = useState(false)
	const [playBookmarkActionSheetIsOpen, setPlayBookmarkActionSheetIsOpen] = useState(false)

	const navigate = useNavigate()
	const { t } = useTranslation()

	const handleRemoveBookmark = useCallback((bm: Bookmark) => {
		setRemoveBookmarkData(bm)
		setRemoveBookmarkActionSheetIsOpen(true)
	}, [])

	const clearBookmarks = useCallback(() => {
		GameHandler.clearBookmarks()
		setClearBookmarksActionSheetIsOpen(false)
		setBookmarks([])
	}, [])

	const handleClearBookmarksClick = useCallback(() => {
		setClearBookmarksActionSheetIsOpen(true)
	}, [])

	const removeBookmark = useCallback(() => {
		if (removeBookmarkData) {
			GameHandler.removeBookmark(removeBookmarkData)
			setBookmarks(GameHandler.bookmarks)
			setRemoveBookmarkActionSheetIsOpen(false)
		}
	}, [removeBookmarkData])

	const playBookmark = useCallback((bm: Bookmark) => {
		if (bm) {
			GameHandler.loadGameFromBookmark(bm)
			navigate('/sudoku')
		}
	}, [navigate])

	const handlePlayBookmark = useCallback((bm: Bookmark) => {
		if (GameHandler.game === null || GameHandler.complete) {
			playBookmark(bm)
		} else {
			setPlayBookmarkData(bm)
			setPlayBookmarkActionSheetIsOpen(true)
		}
	}, [playBookmark])

	return (
		<div className='home__bookmarks'>
			<div style={{ display: 'grid', gridTemplateColumns: 'auto fit-content(0)' }}>
				<p className='home__section-title'>{t('home.bookmarks')}</p>
				{bookmarks.length > 0 ? <FontAwesomeIcon icon={faTrash} color='var(--red)' onClick={handleClearBookmarksClick} fontSize={20} /> : null}
			</div>
			{
				bookmarks.length > 0 ?
					<div className="bookmarks__wrapper">
						{
							bookmarks.map((bm, i) => {
								let board
								let solved

								if (isIDBookmark(bm)) {
									const mode = getMode(bm.id[0] as GameModeIdentifier)
									board = new Board(missions[mode][getDifficulty(bm.id[1] as DifficultyIdentifier)].find(mission => mission.id === bm.id) as RawGameData, 9)
									solved = GameHandler.solved.includes(bm.id)
								} else {
									board = GameHandler.boardFromCustomMission(bm.m)
									solved = false
								}

								return (
									<div key={i} className="bookmarks__item">
										<div className="bookmarks_item__top">
											<p className="bookmarks__item__top__title">{`${t(`gameModes.${board.mode}`)} - ${t(`gameDifficulties.${board.difficulty}`)}`}</p>
											{solved ? <FontAwesomeIcon style={{ color: 'var(--green)' }} icon={faCheck} /> : null}
											<FontAwesomeIcon className="bookmark-on" icon={faBookmark} onClick={() => { handleRemoveBookmark(bm) }} />
										</div>
										<div className="bookmarks__item__canvas-wrapper" onClick={() => { handlePlayBookmark(bm) }}>
											<Canvas game={board} accentColor={accentColor} notPlayable theme={theme} ruleset={rulesets[board.mode]} />
										</div>
									</div>
								)
							})
						}
					</div> :
					<div className="bookmarks__empty">
						<FontAwesomeIcon icon={faBookmark} style={{ fontSize: 70, marginBottom: 10 }} />
						<p style={{ fontSize: 20 }}>{t('bookmarks.empty')}</p>
					</div>
			}

			<div className='home__tabSwitcher-wrapper'>
				<div className='home__tabSwitcher'>
					<Link to="/home">
						<div className='home__tabSwitcher__tab'>
							<FontAwesomeIcon className='home__tabSwitcher__icon' icon={faPlay} />
						</div>
					</Link>
					<Link to="/home/bookmarks">
						<div className='home__tabSwitcher__tab selected'>
							<FontAwesomeIcon className='home__tabSwitcher__icon' icon={faBookmark} />
						</div>
					</Link>
					<Link to="/home/statistics">
						<div className='home__tabSwitcher__tab'>
							<FontAwesomeIcon className='home__tabSwitcher__icon' icon={faChartSimple} />
						</div>
					</Link>
				</div>
			</div>

			<ActionSheet
				isOpen={clearBookmarksActionSheetIsOpen}
				title={t('bookmarks.promptDeleteAll')}
				cancelTitle={t('common.cancel')}
				buttonsMode
				onClose={() => { setClearBookmarksActionSheetIsOpen(false) }}
			>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={clearBookmarks} />
			</ActionSheet>

			<ActionSheet isOpen={removeBookmarkActionSheetIsOpen} title={t('bookmarks.promptDeleteOne')} cancelTitle={t('common.cancel')} buttonsMode onClose={() => { setRemoveBookmarkActionSheetIsOpen(false) }}>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={removeBookmark} />
			</ActionSheet>

			<ActionSheet isOpen={playBookmarkActionSheetIsOpen} title={t('common.discardGame')} cancelTitle={t('common.cancel')} buttonsMode onClose={() => { setPlayBookmarkActionSheetIsOpen(false) }}>
				<ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { if (playBookmarkData) playBookmark(playBookmarkData) }} />
			</ActionSheet>
		</div>
	)
}

export default Bookmarks
