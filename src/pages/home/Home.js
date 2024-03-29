import './home.css'
import { useState, useRef } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { Canvas, Section, SectionContent, Topbar, ActionSheet, ActionSheetButton, ExpandCard } from "../../components"
import Board from "../../utils/Board"
import GameHandler from "../../utils/GameHandler"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightToBracket, faBookmark, faChevronRight, faGear } from '@fortawesome/free-solid-svg-icons'
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'

function Home({theme, accentColor}){
	const [newGameMode, setNewGameMode] = useState(null)

	const discardGameActionSheetRef = useRef()
	let navigate = useNavigate()

	const {t} = useTranslation()

	let classicMiniature = new Board({id: 'ce0', m: '1.3:4.8.'}, true, 3)
	classicMiniature.setValue({x: 1, y: 0}, 2)
	classicMiniature.setValue({x: 0, y: 1}, 6)
	classicMiniature.setValue({x: 0, y: 2}, 7)
	classicMiniature.setValue({x: 2, y: 2}, 9)

	let killerMiniature = new Board({id: 'ke0', m: '1.3:4.8.', s: '123654789', c: '0010,2021,0102,11,1222'}, true, 3)
	killerMiniature.setValue({x: 1, y: 0}, 2)
	killerMiniature.setValue({x: 0, y: 1}, 6)
	killerMiniature.setValue({x: 0, y: 2}, 7)
	killerMiniature.setValue({x: 2, y: 2}, 9)

	function openNewGameActionSheet(mode){
		setNewGameMode(mode)
		if (GameHandler.game === null || GameHandler.complete) handleNewGame(mode)
		else discardGameActionSheetRef.current.open()
	}

	function handleNewGame(mode){
		GameHandler.newGame(mode, mode === 'classic' ? GameHandler.classicDifficulty : GameHandler.killerDifficulty)
		navigate('/sudoku')
	}

	function handleImport(){
		const board = prompt(t('home.importPrompt'))
		if (board){
			if (GameHandler.importGame(board)){
				navigate('/sudoku')
			} else {
				alert(t('home.incompatibleData'))
			}
		}
	}

	return (
		<Section>
			<Topbar title="Sudoku" buttons={[
				<Link key={0} to="/settings">
					<ExpandCard>
						<FontAwesomeIcon className='topbar__button' icon={faGear} />
					</ExpandCard>
				</Link>
			]}>
				{
					API.clientVersionIsBeta ?
					[
						<ExpandCard key={0} style={{fontSize: 20, color: 'var(--red)'}}>Beta</ExpandCard>
					] : null
				}
			</Topbar>

			<SectionContent id="home">
				<div className="home__grid">
					<ExpandCard className="home__grid__item" onClick={() => {openNewGameActionSheet('classic')}}>
						<Canvas noTouch game={classicMiniature} nSquares={3} showSelectedCell={false} theme={theme} accentColor={accentColor} />
						<p className="home__grid__item__title">{t('gameModes.classic')}</p>
					</ExpandCard>
					<ExpandCard className="home__grid__item" onClick={() => {openNewGameActionSheet('killer')}}>
						<Canvas noTouch game={killerMiniature} nSquares={3} showSelectedCell={false} theme={theme} accentColor={accentColor} />
						<p className="home__grid__item__title">{t('gameModes.killer')}</p>
					</ExpandCard>
					<ExpandCard className="home__grid__item" onClick={() => {navigate('/bookmarks')}}>
						<div className="home__grid__item__icon-wrapper">
							<FontAwesomeIcon className='home__grid__item__icon-wrapper__icon' icon={faBookmark} />
						</div>
						<p className="home__grid__item__title">{t('sectionNames.bookmarks')}</p>
					</ExpandCard>
					<ExpandCard className="home__grid__item" onClick={handleImport}>
						<div className="home__grid__item__icon-wrapper">
							<FontAwesomeIcon className='home__grid__item__icon-wrapper__icon' icon={faArrowRightToBracket} rotation={90} />
						</div>
						<p className="home__grid__item__title">{t('home.import')}</p>
					</ExpandCard>
				</div>
				<div className="home__continue-wrapper">
					{
						GameHandler.game && !GameHandler.complete ?
						<>
							<Link to="/sudoku">
								<ExpandCard className='home__continue'>
									<p className='home__continue__info'>{`${t(`gameModes.${GameHandler.game.mode}`)} - ${t(`gameDifficulties.${GameHandler.game.difficulty}`)}`}</p>
									<p className='home__continue__button'>{t('home.continue')}</p>
									<FontAwesomeIcon className='home__continue__icon' icon={faChevronRight} />
								</ExpandCard>
							</Link>
						</> : null
					}
				</div>
			</SectionContent>

			<ActionSheet reference={discardGameActionSheetRef} title={t('common.discardGame')} cancelTitle={t('common.cancel')}>
				<ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => {handleNewGame(newGameMode)}}/>
			</ActionSheet>
		</Section>
	)
}

export default Home