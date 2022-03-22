import React, {useState} from 'react'
import MenuButton from './MenuButton';
import eventBus from "./EventBus";

function NewGameButton(props){
	const [newGameState, setNewGameState] = useState(0);

	const difficulties = [
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

	function handleNewGameClick(){
		setNewGameState(ng => ng === 0 ? 1 : 0);
	}

	async function handleMenuButtonClick(e, dif){
		//props.onNewGame(dif);
		e.stopPropagation();
		eventBus.dispatch("newGame", {difficulty: dif});
		setNewGameState(0);
	}

	return (
		<div id={props.id} className="new-game-wrapper" onClick={e => {e.stopPropagation()}}>
			<div className={`new-game-button ${props.ghost ? 'ghost' : ''}`} onClick={handleNewGameClick}>Nuevo juego</div>
			<div className={`new-game-menu ${newGameState === 0 ? 'hidden' : 'visible'}`} onClick={handleNewGameClick}>
				<div className='new-game-menu__list'>
					{difficulties.map((dif, i) => (
						<MenuButton key={i} icon={dif.name === 'restart' ? 'fas fa-undo' : 'fas fa-th'} title={dif.translation} onClick={(e) => {handleMenuButtonClick(e, dif.name)}} />
					))}
				</div>
				<MenuButton className="cancel" title="Cancelar" onClick={handleNewGameClick} />
			</div>
		</div>
	);
}

export default NewGameButton;