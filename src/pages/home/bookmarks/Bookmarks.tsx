import './bookmarks.css'
import { faBookmark, faCheck, faPlay, faChartSimple, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom";
import { ActionSheet, ActionSheetButton } from '../../../components'
import { decodeDifficulty, decodeMode, GameModeIdentifier, DifficultyIdentifier } from "../../../utils/Difficulties"
import GameHandler from "../../../utils/GameHandler"
import missions from '../../../data/missions.json'
import { useTranslation } from 'react-i18next'
import { newGameFromMode } from '../../../gameModes/Common'
import { Bookmark, RawGameData, ThemeName, isIDBookmark } from '../../../utils/DataTypes'

type Props = {
	theme: ThemeName;
}

function Bookmarks({ theme }: Props) {
	const [bookmarks, setBookmarks] = useState(GameHandler.bookmarks)
	const [removeBookmarkData, setRemoveBookmarkData] = useState<Bookmark>()
	const [playBookmarkData, setPlayBookmarkData] = useState<Bookmark>()
	const [clearBookmarksActionSheetIsOpen, setClearBookmarksActionSheetIsOpen] = useState(false)
	const [removeBookmarkActionSheetIsOpen, setRemoveBookmarkActionSheetIsOpen] = useState(false)
	const [playBookmarkActionSheetIsOpen, setPlayBookmarkActionSheetIsOpen] = useState(false)

	const navigate = useNavigate()
	const { t } = useTranslation()

	function handleRemoveBookmark(bm: Bookmark) {
		setRemoveBookmarkData(bm)
		setRemoveBookmarkActionSheetIsOpen(true)
	}

	function clearBookmarks() {
		GameHandler.clearBookmarks()
		setClearBookmarksActionSheetIsOpen(false)
		setBookmarks([])
	}

	function handleClearBookmarksClick() {
		setClearBookmarksActionSheetIsOpen(true)
	}

	function removeBookmark() {
		if (removeBookmarkData){
			GameHandler.removeBookmark(removeBookmarkData);
			setBookmarks(GameHandler.bookmarks);
			setRemoveBookmarkActionSheetIsOpen(false);
		}
	}

	function handlePlayBookmark(bm: Bookmark) {
		if (GameHandler.game === null || GameHandler.complete) {
			playBookmark(bm)
		} else {
			setPlayBookmarkData(bm)
			setPlayBookmarkActionSheetIsOpen(true)
		}
	}

	function playBookmark(bm: Bookmark) {
		if (bm){
			GameHandler.loadGameFromBookmark(bm)
			navigate('/sudoku')
		}
	}

	return (
		<div className='home__bookmarks'>
			<div style={{display: 'grid', gridTemplateColumns: 'auto fit-content(0)'}}>
				<p className='home__section-title'>{t('home.bookmarks')}</p>
				<FontAwesomeIcon icon={faTrash} color='var(--red)' onClick={handleClearBookmarksClick} fontSize={20}/>
			</div>
			{
				bookmarks.length > 0 ?
					<div className="bookmarks__wrapper">
						{
							bookmarks.map((bm, i) => {
								let board;
								let solved;

								if (isIDBookmark(bm)){
									const mode = decodeMode(bm.id[0] as GameModeIdentifier);
									board = newGameFromMode(mode, missions[mode][decodeDifficulty(bm.id[1] as DifficultyIdentifier)].find(mission => mission.id === bm.id) as RawGameData);
									solved = GameHandler.solved.includes(bm.id);
								} else {
									board = GameHandler.boardFromCustomMission(bm.m);
									solved = false;
								}

								return (
									<div key={i} className="bookmarks__item">
										<div className="bookmarks_item__top">
											<p className="bookmarks__item__top__title">{`${t(`gameModes.${board.mode}`)} - ${t(`gameDifficulties.${board.difficulty}`)}`}</p>
											{solved ? <FontAwesomeIcon style={{ color: 'var(--green)' }} icon={faCheck} /> : null}
											<FontAwesomeIcon className="bookmark-on" icon={faBookmark} onClick={() => { handleRemoveBookmark(bm) }} />
										</div>
										<div className="bookmarks__item__canvas-wrapper" onClick={() => { handlePlayBookmark(bm) }}>
											{/*<Canvas game={board} autoSize={false} showSelectedCell={false} notPlayable theme={theme} />*/}
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
			>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={clearBookmarks} />
			</ActionSheet>

			<ActionSheet isOpen={removeBookmarkActionSheetIsOpen} title={t('bookmarks.promptDeleteOne')} cancelTitle={t('common.cancel')} buttonsMode>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={removeBookmark} />
			</ActionSheet>

			<ActionSheet isOpen={playBookmarkActionSheetIsOpen} title={t('common.discardGame')} cancelTitle={t('common.cancel')} buttonsMode>
				<ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { if (playBookmarkData) playBookmark(playBookmarkData) }} />
			</ActionSheet>
		</div>
	)
}

export default Bookmarks
