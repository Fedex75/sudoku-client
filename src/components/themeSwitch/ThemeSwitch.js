import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import ReactSwitch from 'react-switch';

const moonIconStyle = {
	fontSize: 18,
	color: 'white',
}

const sunIconStyle = {
	fontSize: 18,
	color: '#344861',
}

const ThemeSwitch = ({theme, toggleTheme}) => {
	return (
		<ReactSwitch
			width={50}
			onColor='#25242c'
			offColor='#cdc8cc'
			checkedIcon={
				<div style={{display: 'grid', placeItems: 'center', width: 25, height: 28}}>
					<FontAwesomeIcon icon={faMoon} style={moonIconStyle} />
				</div>
			}
			uncheckedIcon={
				<div style={{display: 'grid', placeItems: 'center', width: 25, height: 28}}>
					<FontAwesomeIcon icon={faSun} style={sunIconStyle} />
				</div>
			}
			handleDiameter={24}
			onHandleColor='#4b7bec'
			offHandleColor='#4b7bec'
			activeBoxShadow={null}
			checked={theme === 'dark'}
			onChange={toggleTheme}
		/>
	);
}

export default ThemeSwitch;