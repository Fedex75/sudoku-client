import React from 'react';
import './editButton.css'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0)

type Props = {
	onClick: () => void;
	highlight?: boolean;
	yellow?: boolean;
	icon: React.ReactNode;
}

function EditButton({onClick, highlight = false, yellow = false, icon}: Props): React.JSX.Element {
	return (
		<div
			className={`edit-buttons__button fade_in ${highlight ? 'highlight' : ''} ${yellow ? 'yellow' : ''}`}
			onTouchStart={e => {
				e.stopPropagation()
				onClick()
			}}
			onClick={e => {
				e.stopPropagation()
				if (isTouchDevice) return
				onClick()
			}}
			onContextMenu={e => {
				e.stopPropagation()
				e.preventDefault()
				if (isTouchDevice) return
				onClick()
			}}
		>
			{icon}
		</div>
	)
}

export default EditButton
