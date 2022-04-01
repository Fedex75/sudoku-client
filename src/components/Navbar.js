import React from 'react';
import {Link} from 'react-router-dom';
import NewGameButton from './NewGameButton';
import UserButton from './UserButton';
import eventBus from "./EventBus";
import ThemeSwitch from './ThemeSwitch';

function Navbar(props){
	const sections = [
		{
			name: 'sudoku',
			translation: 'Sudoku'
		},
		{
			name: 'settings',
			translation: 'Opciones'
		}
	];

	return (
		<div className="navbar">
			<div className='menu-icon-wrapper' onClick={() => {eventBus.dispatch("openModal", {})}}>
				<i className='fas fa-bars'></i>
			</div>
			<div className="navbar__title">
				{sections.filter(x => x.name === props.currentSection)[0].translation}
			</div>
			<div className="navbar__user-wrapper">
				<ThemeSwitch themeName={props.themeName} toggleTheme={props.toggleTheme} />
				<Link to="/settings"><div className="navbar__user-wrapper__settings"><i className="fas fa-cog"></i></div></Link>
				<UserButton />
			</div>
			{
				props.currentSection === 'sudoku' ?
				<NewGameButton id="navbar-new-game-button" absoluteMenu={true} ghost gameMode={props.gameMode} setGameMode={props.setGameMode} />
				: null
			}
		</div>
	);
}

export default Navbar;