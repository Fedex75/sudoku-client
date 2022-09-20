import './numpadButton.css'
import useLongPress from '../../utils/useLongPress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)

function NunmpadButton({onClick, number, disabled, hidden, locked}){
	const [onTouchStart, onTouchEnd] = useLongPress((type) => {
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
			{number}
			{locked ? <FontAwesomeIcon icon={faLock} style={{position: 'absolute', right: 3, bottom: 3, fontSize: 16}}/> : null}
		</div>
	)
}

export default NunmpadButton