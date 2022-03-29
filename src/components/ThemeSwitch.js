import React from 'react';
import ReactSwitch from 'react-switch';

const moonIconStyle = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	width: 25,
	height: 28,
	color: 'white',
}

const sunIconStyle = {
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	width: 25,
	height: 28,
	color: '#344861',
}

const ThemeSwitch = (props) => {
	return (
		<ReactSwitch
			width={50}
			onColor='#25242c'
			offColor='#cdc8cc'
			checkedIcon={
				<i className='fas fa-moon' style={moonIconStyle} />
			}
			uncheckedIcon={
				<i className='fas fa-sun' style={sunIconStyle} />
			}
			handleDiameter={24}
			onHandleColor='#4b7bec'
			offHandleColor='#4b7bec'
			activeBoxShadow={null}
			checked={props.themeName === 'dark'}
			onChange={props.toggleTheme}
		/>
	);
}

export default ThemeSwitch;