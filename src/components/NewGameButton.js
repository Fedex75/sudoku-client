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
		if (newGameState === 0) setNewGameState(1);
		else setNewGameState(0);
	}

	async function handleMenuButtonClick(dif){
		//props.onNewGame(dif);
		eventBus.dispatch("newGame", {difficulty: dif});
		setNewGameState(0);
	}

	return (
		<div id={props.id} className={`new-game-wrapper ${props.absoluteMenu ? 'absolute' : ''}`} onClick={e => {e.stopPropagation()}}>
			<div className={`new-game-button ${props.ghost ? 'ghost' : ''}`} onClick={handleNewGameClick}>Nuevo juego</div>
			<div className={`new-game-menu ${props.absoluteMenu ? 'absolute' : ''} ${newGameState === 0 ? 'hidden' : 'visible'}`}>
				{difficulties.map((dif, i) => (
					<MenuButton key={i} icon={dif === 'restart' ? 'fas fa-redo' : 'fas fa-th'} title={dif.translation} onClick={() => handleMenuButtonClick(dif.name)} />
				))}
			</div>
		</div>
	);
}

export default NewGameButton;