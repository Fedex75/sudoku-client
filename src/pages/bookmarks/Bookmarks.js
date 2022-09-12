import './bookmarks.css'
import { faBookmark, faCheck, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Canvas, Section, SectionContent, Topbar, ActionSheet, ActionSheetButton } from '../../components'
import Board from "../../utils/Board"
import Decoder from "../../utils/Decoder"
import { difficultyDecoder, difficultyTranslations, modeDecoder, modeTranslations } from "../../utils/Difficulties"
import GameHandler from "../../utils/GameHandler"
import missions from '../../data/missions.json'

function Bookmarks({theme}){
	const [bookmarks, setBookmarks] = useState(GameHandler.bookmarks)
	const [removeBookmarkData, setRemoveBookmarkData] = useState(null)
	const [playBookmarkData, setPlayBookmarkData] = useState(null)
	const navigate = useNavigate()

	const clearBookmarksActionSheetRef = useRef(null)
	const removeBookmarkActionSheetRef = useRef(null)
	const playBookmarkActionSheetRef = useRef(null)

	function handleRemoveBookmark(bm){
		setRemoveBookmarkData(bm)
		removeBookmarkActionSheetRef.current.open()
	}

	function clearBookmarks(){
		GameHandler.clearBookmarks()
		clearBookmarksActionSheetRef.current.close()
		setBookmarks([])
	}

	function removeBookmark(){
		if (removeBookmarkData.c) GameHandler.removeBookmark({mission: removeBookmarkData.m})
		else GameHandler.removeBookmark({id: removeBookmarkData.id})
		setBookmarks(GameHandler.bookmarks)
		removeBookmarkActionSheetRef.current.close()
	}

	function handlePlayBookmark(bm){
		if (GameHandler.game === null || GameHandler.complete){
			playBookmark(bm)
		} else {
			setPlayBookmarkData(bm)
			playBookmarkActionSheetRef.current.open()
		}
	}

	function playBookmark(bm){
		GameHandler.loadGameFromBookmark(bm)
		navigate('/sudoku')
	}

	const canvasSize = `${window.innerWidth - 40}px`

	return (
		<Section>
			<Topbar title="Marcadores" backURL="/">
				{bookmarks.length > 0 ? <FontAwesomeIcon icon={faTrashCan} className="topbar__buttons__button" style={{color: 'var(--red)'}} onClick={() => {clearBookmarksActionSheetRef.current.open()}}/> : null}
			</Topbar>

			<SectionContent id="bookmarks">
				{
					bookmarks.length > 0 ?
					<div className="bookmarks__wrapper">
						{
							bookmarks.map((bm, i) => {
								let board

								if (bm.c){
									board = new Board({
										id: 'cc0',
										m: Decoder.decode(bm.m),
									}, true)
								} else {
									board = new Board(missions[modeDecoder[bm.id[0]]][difficultyDecoder[bm.id[1]]].find(mission => mission.id === bm.id), true)
								}

								const solved = bm.c ? false : GameHandler.solved.includes(bm.id)

								return (
									<div key={i} className="bookmarks__item">
										<div className="bookmarks_item__top">
											<p className="bookmarks__item__top__title">{`${modeTranslations[board.mode]} - ${difficultyTranslations[board.difficulty]}`}</p>
											{solved ? <FontAwesomeIcon style={{color: 'var(--green)'}} icon={faCheck} /> : null}
											<FontAwesomeIcon className="bookmark-on" icon={faBookmark} onClick={() => {handleRemoveBookmark(bm)}} />
										</div>
										<div className="bookmarks__item__canvas-wrapper" onClick={() => {handlePlayBookmark(bm)}}>
											<Canvas game={board} autoSize={false} size={canvasSize} showSelectedCell={false} noTouch theme={theme} />
										</div>
									</div>
								)
							})
						}
					</div> :
					<div className="bookmarks__empty">
						<FontAwesomeIcon icon={faBookmark} style={{fontSize: 70, marginBottom: 10}}/>
						<p style={{fontSize: 20}}>No hay marcadores</p>
					</div>
				}
			</SectionContent>

			<ActionSheet reference={clearBookmarksActionSheetRef} title="¿Eliminar todos los marcadores?" cancelTitle="Cancelar">
				<ActionSheetButton title="Eliminar" color="var(--red)" onClick={clearBookmarks}/>
			</ActionSheet>

			<ActionSheet reference={removeBookmarkActionSheetRef} title="¿Eliminar marcador?" cancelTitle="Cancelar">
				<ActionSheetButton title="Eliminar" color="var(--red)" onClick={removeBookmark}/>
			</ActionSheet>

			<ActionSheet reference={playBookmarkActionSheetRef} title="¿Descartar el juego en progreso?" cancelTitle="Cancelar">
				<ActionSheetButton title="Descartar" color="var(--red)" onClick={() => {playBookmark(playBookmarkData)}}/>
			</ActionSheet>
		</Section>
	)
}

export default Bookmarks