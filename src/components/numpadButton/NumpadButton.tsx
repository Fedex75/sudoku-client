import React from 'react'
import './numpadButton.css'
import useLongPress from '../../utils/useLongPress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { MouseButtonType } from '../../utils/DataTypes'
import DigitSVG from '../../svg/digit'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0)

type Props = {
	onClick: (number: number, type: MouseButtonType) => void
	number: number
	disabled: boolean
	hidden: boolean
	locked: boolean
}

export default function NunmpadButton({ onClick, number, disabled, hidden, locked }: Props): React.JSX.Element {
	const [onTouchStart, onTouchEnd] = useLongPress((type: MouseButtonType) => {
		if (type === 'secondary' || !disabled) onClick(number, type)
	}, 300)

	return (
		<div
			className={`numpad__button fade_in number ${disabled ? 'disabled' : ''} ${hidden ? 'hidden' : ''} ${locked ? 'locked' : ''}`}
			onTouchStart={(e) => {
				e.stopPropagation()
				if (hidden) return
				onTouchStart()
			}}
			onTouchEnd={(e) => {
				e.stopPropagation()
				if (hidden) return
				onTouchEnd()
			}}
			onClick={(e) => {
				e.stopPropagation()
				if (hidden || isTouchDevice) return
				onClick(number, 'primary')
			}}
			onContextMenu={(e) => {
				e.stopPropagation()
				e.preventDefault()
				if (hidden || isTouchDevice) return
				onClick(number, 'secondary')
			}}
		>
			<DigitSVG className='numpad__button__digit' digit={number.toString().trim()} fill={locked ? 'white' : 'var(--theme-color)'} />
			{locked ? <FontAwesomeIcon icon={faLock} style={{ position: 'absolute', right: 3, bottom: 3, fontSize: 16 }} /> : null}
		</div>
	)
}
