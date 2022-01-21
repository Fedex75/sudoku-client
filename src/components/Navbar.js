import React from 'react';
import logo from '../gemini.png';
import {Link} from 'react-router-dom';
import Auth from '../Auth';

function Navbar(props){
	const sections = [
		{
			name: 'sudoku',
			translation: 'Sudoku'
		},
		{
			name: 'settings',
			translation: 'Settings'
		}
	];

	return (
		<div className="navbar">
			<div className="navbar__logo-wrapper">
				<img src={logo}/>
			</div>
			<div className="navbar__title">
				{sections.filter(x => x.name === props.currentSection)[0].translation}
			</div>
			<div className="navbar__user-wrapper">
				<Link to="/settings"><div className="navbar__user-wrapper__settings"><i className="fas fa-cog"></i></div></Link>
				{
					Auth.isAuthenticated() ? 
					<div className="navbar__user-wrapper__login-button">Log Out</div> :
					<a href="https://accounts.zaifo.com.ar/signin?service=sudoku&continue=https%3A%2F%2Fsudoku.zaifo.com.ar"><div className="navbar__user-wrapper__login-button">Log In</div></a>
				}
				
			</div>
		</div>
	);
}

export default Navbar;