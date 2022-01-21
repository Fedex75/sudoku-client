import React from 'react';

function MenuButton(props){
	return (
		<div className="menu-button" onClick={() => {if (props.onClick) props.onClick();}}>
			<i className={`menu-button__icon ${props.icon}`}></i>
			{props.title}
		</div>
	);
}

export default MenuButton;