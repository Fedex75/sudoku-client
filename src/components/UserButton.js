import React from 'react';
import Auth from '../utils/Auth';

function UserButton(props){
	if (Auth.isAuthenticated()){
		return (
			<div className="navbar__user-wrapper__login-button">Log Out</div>
		);
	} else {
		return (
			<a href="https://accounts.zaifo.com.ar/signin?service=sudoku&continue=https%3A%2F%2Fsudoku.zaifo.com.ar">
				<div className="navbar__user-wrapper__login-button">Acceder</div>
			</a>
		);
	}
}

export default UserButton;