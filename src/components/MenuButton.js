import React from 'react';

function MenuButton(props){
	return (
		<div className={`menu-button ${props.className ? props.className : ''}`} onClick={(e) => {if (props.onClick) props.onClick(e);}}>
			<i className={`menu-button__icon ${props.icon}`}></i>
			{props.title}
		</div>
	);
}

export default MenuButton;