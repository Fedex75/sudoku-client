import React from 'react'
import './editButton.css'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0)

type Props = {
	onClick: () => void
	highlight?: Boolean
	yellow?: Boolean
	icon: React.ReactNode
	disabled?: Boolean
	number?: number
}

function EditButton({ onClick, highlight = false, yellow = false, icon, disabled = false, number = 0 }: Props) {
	return (
		<div
			className={`edit-buttons__button fade_in ${highlight ? 'highlight' : ''} ${yellow ? 'yellow' : ''} ${disabled ? 'disabled' : ''} ${number > 0 ? 'number' : ''}`}
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
			{
				number > 0 ? number : null
			}
		</div>
	)
}

export default EditButton
