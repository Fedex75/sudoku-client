import React, {useState} from 'react'
import MenuButton from './MenuButton';
import eventBus from "./EventBus";

function NewGameButton(props){
	const [newGameState, setNewGameState] = useState(0);

	const classicDifficulties = [
		{
			name: 'easy',
			translation: 'Fácil'
		},
		{
			name: 'medium',
			translation: 'Intermedio'
		},
		{
			name: 'hard',
			translation: 'Dificil'
		},
		{
			name: 'expert',
			translation: 'Experto'
		},
		{
			name: 'evil',
			translation: 'Malvado'
		},
		{
			name: 'restart',
			translation: 'Reiniciar'
		}
	];

	const killerDifficulties = [
		{
			name: 'easy',
			translation: 'Fácil'
		},
		{
			name: 'medium',
			translation: 'Intermedio'
		},
		{
			name: 'hard',
			translation: 'Dificil'
		},
		{
			name: 'expert',
			translation: 'Experto'
		},
		{
			name: 'restart',
			translation: 'Reiniciar'
		}
	];

	function handleModeClick(e, newMode){
		e.stopPropagation();
		props.setGameMode(newMode);
	}

	function handleNewGameClick(e){
		e.stopPropagation();
		setNewGameState(ng => ng === 0 ? 1 : 0);
	}

	async function handleMenuButtonClick(e, dif){
		//props.onNewGame(dif);
		e.stopPropagation();
		eventBus.dispatch("newGame", {difficulty: dif, mode: props.gameMode});
		setNewGameState(0);
	}

	return (
		<div id={props.id} className="new-game-wrapper" onClick={e => {e.stopPropagation()}}>
			<div className={`new-game-button ${props.ghost ? 'ghost' : ''}`} onClick={handleNewGameClick}>Nuevo juego</div>
			<div className={`new-game-menu ${newGameState === 0 ? 'hidden' : 'visible'}`} onClick={handleNewGameClick}>
				<div className='new-game-menu__list'>
					<div className='new-game-menu__mode-selector'>
						<div className={`new-game-menu__mode-selector__item ${props.gameMode === 'classic' ? 'selected' : ''}`} onClick={(e) => {handleModeClick(e, 'classic')}}>Clásico</div>
						<div className={`new-game-menu__mode-selector__item ${props.gameMode === 'killer' ? 'selected' : ''}`} onClick={(e) => {handleModeClick(e, 'killer')}}>Killer</div>
					</div>
					{
						(props.gameMode === 'classic' ? classicDifficulties : killerDifficulties).map((dif, i) => (
							<MenuButton key={i} icon={dif.name === 'restart' ? 'fas fa-undo' : 'fas fa-th'} title={dif.translation} onClick={(e) => {handleMenuButtonClick(e, dif.name)}} />
						))
					}
				</div>
				<MenuButton className="cancel" title="Cancelar" onClick={handleNewGameClick} />
			</div>
		</div>
	);
}

export default NewGameButton;