import React from 'react';
import './editButton.css'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0)

type Props = {
	onClick: () => void;
	highlight?: Boolean;
	yellow?: Boolean;
	icon: React.ReactNode;
	disabled?: Boolean;
}

function EditButton({onClick, highlight = false, yellow = false, icon, disabled = false}: Props) {
	return (
		<div
			className={`edit-buttons__button fade_in ${highlight ? 'highlight' : ''} ${yellow ? 'yellow' : ''} ${disabled ? 'disabled' : ''}`}
			onTouchStart={e => {
				e.stopPropagation()
				if (disabled) return
				onClick()
			}}
			onClick={e => {
				e.stopPropagation()
				if (isTouchDevice || disabled) return
				onClick()
			}}
			onContextMenu={e => {
				e.stopPropagation()
				e.preventDefault()
				if (isTouchDevice || disabled) return
				onClick()
			}}
		>
			{icon}
		</div>
	)
}

export default EditButton
