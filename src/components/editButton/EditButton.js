import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

function EditButton(props){
	function handleClick(e){
		e.stopPropagation()
		if (props.onClick) props.onClick()
	}

	return (
		<div
			className={`edit-buttons__button ${props.highlight ? 'highlight' : ''} ${props.yellow ? 'yellow' : ''}`}
			onClick={handleClick}
			onContextMenu={handleClick}
		>
			<FontAwesomeIcon className='edit-buttons__button__icon' icon={props.icon} />
			{/*<div className="edit-buttons__button__title">{props.title}</div>*/}
		</div>
	)
}

export default EditButton