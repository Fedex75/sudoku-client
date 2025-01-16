import React from 'react'
import './editButton.css'
import DigitSVG from '../../svg/digit'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0)

type Props = {
	onClick: () => void
	highlight?: Boolean
	yellow?: Boolean
	icon: React.ReactNode
	disabled?: Boolean
	number?: number
}

function EditButton({ onClick, highlight = false, yellow = false, icon, disabled = false, number }: Props) {
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
			{/*
				number !== undefined ?
					<div style={{ display: 'flex', flexFlow: 'row', gap: '5px', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
						{
							number.toString().split('').map(digit => (
								<DigitSVG key={digit} digit={digit} className='edit-buttons__button__digit' />
							))
						}
					</div>
					: null
			*/
			}
			{
				number !== undefined ? number : null
			}
		</div>
	)
}

export default EditButton
