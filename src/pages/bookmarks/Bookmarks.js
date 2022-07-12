import { faBookmark, faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { useNavigate } from "react-router"
import Canvas from "../../components/Canvas"
import { Section, SectionContent, Topbar } from "../../components/section"
import Board from "../../utils/Board"
import { difficultyTranslations, modeTranslations } from "../../utils/Difficulties"
import GameHandler from "../../utils/GameHandler"

function Bookmarks(){
	const [bookmarks, setBookmarks] = useState(GameHandler.bookmarks)
	const navigate = useNavigate()

	function handleBookmarkClick(bm){
		if (bm.custom){
			GameHandler.removeBookmark({mission: bm.mission})
		} else {
			GameHandler.removeBookmark({id: bm._id})
		}
		setBookmarks(GameHandler.bookmarks)
	}

	function playBookmark(bm){
		GameHandler.loadGameFromBookmark(bm)
		navigate('/sudoku')
	}

	const canvasSize = `${window.innerWidth - 40}px`

	return (
		<Section>
			<Topbar title="Juegos guardados" backURL="/" />

			<SectionContent id="bookmarks">
				{
					bookmarks.map((bm, i) => {
						let board

						if (bm.custom){
							let solution = ''
							for (let i = 0; i < 81; i++) solution += '0'

							board = new Board({
								_id: null,
								id: null,
								mission: bm.mission,
								solution: solution,
								cages: null,
								mode: 'classic',
								difficulty: 'custom'
							}, true)
						} else {
							board = new Board(GameHandler.missions.filter(mission => mission._id === bm._id)[0], true)
						}

						let solved
						if (bm.custom){
							solved = GameHandler.solved.some(mission => mission.custom && mission.mission === bm.mission)
						} else {
							solved = GameHandler.solved.some(mission => !mission.custom && mission._id === bm._id)
						}

						return (
							<div key={i} className="bookmarks__item">
								<div className="bookmarks_item__top">
									<p className="bookmarks__item__top__title">{`${modeTranslations[board.mode]} - ${difficultyTranslations[board.difficulty]}`}</p>
									{solved ? <FontAwesomeIcon style={{color: 'var(--green)'}} icon={faCheck} /> : null}
									<FontAwesomeIcon className="bookmark-on" icon={faBookmark} onClick={() => {handleBookmarkClick(bm)}} />
								</div>
								<div className="bookmarks__item__canvas-wrapper">
									<Canvas onClick={() => {playBookmark(bm)}} game={board} autoSize={false} size={canvasSize} showSelectedCell={false}/>
								</div>
							</div>
						)
					})
				}
			</SectionContent>
		</Section>
	)
}

export default Bookmarks