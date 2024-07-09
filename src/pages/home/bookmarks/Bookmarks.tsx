import './bookmarks.css'
import { faBookmark, faCheck, faTrashCan, faPlay, faChartSimple } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom";
import { ActionSheet, ActionSheetButton } from '../../../components'
import { decodeMissionString } from "../../../utils/Decoder"
import { decodeDifficulty, decodeMode, GameModeIdentifier, DifficultyIdentifier } from "../../../utils/Difficulties"
import GameHandler from "../../../utils/GameHandler"
import missions from '../../../data/missions.json'
import { useTranslation } from 'react-i18next'
import ClassicBoard from '../../../gameModes/classic/ClassicBoard'
import { newGameFromMode } from '../../../gameModes/Common'
import { Bookmark, RawGameData, ThemeName, isIDBookmark } from '../../../utils/DataTypes'
import { ActionSheetRef } from 'actionsheet-react'

type Props = {
	theme: ThemeName;
}

function Bookmarks({ theme }: Props) {
	const [bookmarks, setBookmarks] = useState(GameHandler.bookmarks)
	const [removeBookmarkData, setRemoveBookmarkData] = useState<Bookmark>()
	const [playBookmarkData, setPlayBookmarkData] = useState<Bookmark>()
	const navigate = useNavigate()

	const clearBookmarksActionSheetRef = useRef<ActionSheetRef>()
	const removeBookmarkActionSheetRef = useRef<ActionSheetRef>()
	const playBookmarkActionSheetRef = useRef<ActionSheetRef>()

	const { t } = useTranslation()

	function handleRemoveBookmark(bm: Bookmark) {
		setRemoveBookmarkData(bm)
		removeBookmarkActionSheetRef.current?.open()
	}

	function clearBookmarks() {
		GameHandler.clearBookmarks()
		clearBookmarksActionSheetRef.current?.close()
		setBookmarks([])
	}

	function handleClearBookmarksClick() {
		clearBookmarksActionSheetRef.current?.open()
	}

	function removeBookmark() {
		if (removeBookmarkData){
			GameHandler.removeBookmark(removeBookmarkData);
			setBookmarks(GameHandler.bookmarks);
			removeBookmarkActionSheetRef.current?.close();
		}
	}

	function handlePlayBookmark(bm: Bookmark) {
		if (GameHandler.game === null || GameHandler.complete) {
			playBookmark(bm)
		} else {
			setPlayBookmarkData(bm)
			playBookmarkActionSheetRef.current?.open()
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
			<p className='home__section-title'>{t('home.bookmarks')}</p>
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
											{/*<Canvas game={board} autoSize={false} showSelectedCell={false} noTouch theme={theme} />*/}
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
			>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={clearBookmarks} />
			</ActionSheet>

			<ActionSheet reference={removeBookmarkActionSheetRef} title={t('bookmarks.promptDeleteOne')} cancelTitle={t('common.cancel')}>
				<ActionSheetButton title={t('common.delete')} color="var(--red)" onClick={removeBookmark} />
			</ActionSheet>

			<ActionSheet reference={playBookmarkActionSheetRef} title={t('common.discardGame')} cancelTitle={t('common.cancel')}>
				<ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { if (playBookmarkData) playBookmark(playBookmarkData) }} />
			</ActionSheet>
		</div>
	)
}

export default Bookmarks
