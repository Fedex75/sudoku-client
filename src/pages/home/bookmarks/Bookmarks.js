import './bookmarks.css'
import { faBookmark, faCheck, faTrashCan, faPlay, faChartSimple } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom";
import { Canvas, ActionSheet, ActionSheetButton } from '../../../components'
import Board from "../../../utils/Board"
import Decoder from "../../../utils/Decoder"
import { difficultyDecoder, modeDecoder } from "../../../utils/Difficulties"
import GameHandler from "../../../utils/GameHandler"
import missions from '../../../data/missions.json'
import { useTranslation } from 'react-i18next'

function Bookmarks({ theme }) {
	const [bookmarks, setBookmarks] = useState(GameHandler.bookmarks)
	const [removeBookmarkData, setRemoveBookmarkData] = useState(null)
	const [playBookmarkData, setPlayBookmarkData] = useState(null)
	const [deleteAllExpanded, setDeleteAllExpanded] = useState(false)
	const navigate = useNavigate()

	const clearBookmarksActionSheetRef = useRef(null)
	const removeBookmarkActionSheetRef = useRef(null)
	const playBookmarkActionSheetRef = useRef(null)
	const topbarRef = useRef(null)

	const { t } = useTranslation()

	function handleRemoveBookmark(bm) {
		setRemoveBookmarkData(bm)
		removeBookmarkActionSheetRef.current.open()
	}

	function clearBookmarks() {
		topbarRef.current.collapse({ newBackgroundColor: 'var(--red)', newFontColor: 'white' })
		GameHandler.clearBookmarks()
		clearBookmarksActionSheetRef.current.close()
		setBookmarks([])
		setDeleteAllExpanded(false)
	}

	function handleClearBookmarksClick() {
		setDeleteAllExpanded(true)
		clearBookmarksActionSheetRef.current.open()
		topbarRef.current.expand({ buttonIndex: 0, newBackgroundColor: 'var(--red)', newFontColor: 'white' })
	}

	function removeBookmark() {
		if (removeBookmarkData.c) GameHandler.removeBookmark({ mission: removeBookmarkData.m })
		else GameHandler.removeBookmark({ id: removeBookmarkData.id })
		setBookmarks(GameHandler.bookmarks)
		removeBookmarkActionSheetRef.current.close()
	}

	function handlePlayBookmark(bm) {
		if (GameHandler.game === null || GameHandler.complete) {
			playBookmark(bm)
		} else {
			setPlayBookmarkData(bm)
			playBookmarkActionSheetRef.current.open()
		}
	}

	function playBookmark(bm) {
		GameHandler.loadGameFromBookmark(bm)
		navigate('/sudoku')
	}

	return (
		<div className='home__bookmarks'>
			<p className='home__section-title'>{t('home.bookmarks')}</p>
			{
				bookmarks.length > 0 ?
					<div className="bookmarks__wrapper">
						{
							bookmarks.map((bm, i) => {
								let board

								if (bm.c) {
									board = new Board({
										id: 'cc0',
										m: Decoder.decode(bm.m)
									}, true)
								} else {
									board = new Board(missions[modeDecoder[bm.id[0]]][difficultyDecoder[bm.id[1]]].find(mission => mission.id === bm.id), true)
								}

								const solved = bm.c ? false : GameHandler.solved.includes(bm.id)

								return (
									<div key={i} className="bookmarks__item">
										<div className="bookmarks_item__top">
											<p className="bookmarks__item__top__title">{`${t(`gameModes.${board.mode}`)} - ${t(`gameDifficulties.${board.difficulty}`)}`}</p>
											{solved ? <FontAwesomeIcon style={{ color: 'var(--green)' }} icon={faCheck} /> : null}
											<FontAwesomeIcon className="bookmark-on" icon={faBookmark} onClick={() => { handleRemoveBookmark(bm) }} />
										</div>
										<div className="bookmarks__item__canvas-wrapper" onClick={() => { handlePlayBookmark(bm) }}>
											<Canvas game={board} autoSize={false} showSelectedCell={false} noTouch theme={theme} />
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
				reference={clearBookmarksActionSheetRef}
				title={t('bookmarks.promptDeleteAll')}
				cancelTitle={t('common.cancel')}
				onClose={() => {
					setDeleteAllExpanded(false)
					topbarRef.current.collapse({ newBackgroundColor: 'var(--red)', newFontColor: 'white' })
				}}
			>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={clearBookmarks} />
			</ActionSheet>

			<ActionSheet reference={removeBookmarkActionSheetRef} title={t('bookmarks.promptDeleteOne')} cancelTitle={t('common.cancel')}>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={removeBookmark} />
			</ActionSheet>

			<ActionSheet reference={playBookmarkActionSheetRef} title={t('common.discardGame')} cancelTitle={t('common.cancel')}>
				<ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { playBookmark(playBookmarkData) }} />
			</ActionSheet>
		</div>
	)
}

export default Bookmarks
