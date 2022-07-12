import { useState, useRef } from 'react'
import { Link, useNavigate } from "react-router-dom"
import Button from "../../components/Button"
import Canvas from "../../components/Canvas"
import { Section, SectionContent, Topbar } from "../../components/section"
import Board from "../../utils/Board"
import GameHandler from "../../utils/GameHandler"
import ActionSheet from '../../components/ActionSheet'
import { ActionSheetButton } from '../../components/ActionSheet'
import { modeTranslations, difficultyTranslations, classicDifficulties, killerDifficulties } from '../../utils/Difficulties'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightToBracket, faBookmark, faGear } from '@fortawesome/free-solid-svg-icons'

function Home(){
	const [newGameMode, setNewGameMode] = useState('classic')

	const newGameActionSheetRef = useRef()
	let navigate = useNavigate()

	let classicMiniature = new Board({
		_id: null,
		id: null,
		mission: '103004080',
		solution: '123654789',
		cages: null,
		mode: 'classic',
		difficulty: '',
	}, true, 3)

	classicMiniature.setValue({x: 1, y: 0}, 2)
	classicMiniature.setValue({x: 0, y: 1}, 6)
	classicMiniature.setValue({x: 0, y: 2}, 7)
	classicMiniature.setValue({x: 2, y: 2}, 9)

	let killerMiniature = new Board({
		_id: null,
		id: null,
		mission: '103004080',
		solution: '123654789',
		cages: [[0, 1], [2, 5], [3, 6], [7, 8], [4]],
		mode: 'killer',
		difficulty: ''
	}, true, 3)

	killerMiniature.setValue({x: 1, y: 0}, 2)
	killerMiniature.setValue({x: 0, y: 1}, 6)
	killerMiniature.setValue({x: 0, y: 2}, 7)
	killerMiniature.setValue({x: 2, y: 2}, 9)

	const squareSize = (window.innerWidth - 40) / 2;

	function openNewGameActionSheet(mode){
		setNewGameMode(mode)
		newGameActionSheetRef.current.open()
	}

	function handleNewGame(difficulty){
		GameHandler.newGame(newGameMode, difficulty)
		navigate('/sudoku')
	}

	function handleImport(){
		const board = prompt('Ingrese el tablero')
		if (board){
			if (GameHandler.importGame(board)){
				navigate('/sudoku')
			} else {
				alert('Datos incompatibles')
			}
		}
	}

	return (
		<Section>
			<Topbar title="Sudoku">
				<Link to="/settings"><FontAwesomeIcon className='topbar__buttons__button' icon={faGear} /></Link>
			</Topbar>

			<SectionContent id="home">
				<div className="home__grid">
					<div className="home__grid__item" style={{width: `${squareSize}px`, height: `${squareSize}px`}} onClick={() => {openNewGameActionSheet('classic')}}>
						<Canvas onClick={() => {openNewGameActionSheet('classic')}} game={classicMiniature} nSquares={3} autoSize={false} size={`${squareSize - 60}px`} showSelectedCell={false} canvasSize={(squareSize - 60) * 3}/>
						<p className="home__grid__item__title">Clásico</p>
					</div>
					<div className="home__grid__item" style={{width: `${squareSize}px`, height: `${squareSize}px`}} onClick={() => {openNewGameActionSheet('killer')}}>
						<Canvas onClick={() => {openNewGameActionSheet('killer')}} game={killerMiniature} nSquares={3} autoSize={false} size={`${squareSize - 60}px`} showSelectedCell={false} canvasSize={(squareSize - 60) * 3}/>
						<p className="home__grid__item__title">Killer</p>
					</div>
					<Link to="/bookmarks">
						<div className="home__grid__item" style={{width: `${squareSize}px`, height: `${squareSize}px`}}>
							<div className="home__grid__item__icon-wrapper">
								<FontAwesomeIcon className='home__grid__item__icon-wrapper__icon' icon={faBookmark} />
							</div>
							<p className="home__grid__item__title">Guardados</p>
						</div>
					</Link>					
					<div className="home__grid__item" style={{width: `${squareSize}px`, height: `${squareSize}px`}} onClick={handleImport}>
						<div className="home__grid__item__icon-wrapper">
							<FontAwesomeIcon className='home__grid__item__icon-wrapper__icon' icon={faArrowRightToBracket} rotation={90} />
						</div>
						<p className="home__grid__item__title">Importar</p>
					</div>
				</div>
				<div className="home__continue-wrapper">
					{
						GameHandler.game && !GameHandler.complete ?
						<>
							<Link to="/sudoku"><Button title="Continuar" marginBottom={5} /></Link>
							<p className="home__continue-wrapper__subtitle">{`${modeTranslations[GameHandler.game.mode]} - ${difficultyTranslations[GameHandler.game.difficulty]}`}</p>
						</> : null
					}
				</div>
			</SectionContent>

			<ActionSheet reference={newGameActionSheetRef} title={`Nuevo juego`} cancelTitle="Cancelar">
				{
					(newGameMode === 'classic' ? classicDifficulties : killerDifficulties).map(diff => (
						diff !== 'restart' ?
						<ActionSheetButton key={diff} title={difficultyTranslations[diff]} onClick={() => {handleNewGame(diff)}} />
						: null	
					))
				}
			</ActionSheet>
		</Section>
	)
}

export default Home