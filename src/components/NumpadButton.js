import React, {useRef} from 'react'
import useLongPress from '../utils/useLongPress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

function NunmpadButton({onClick, number, disabled, hidden, locked}){
	const endLongPressFired = useRef(false)
	const [onTouchStart, onTouchEnd] = useLongPress((type) => {
		endLongPressFired.current = true
		if (type === 'secondary' || !disabled) onClick(number, type)
	}, 300)

	return (
		<div
			className={`numpad__button number ${disabled ? 'disabled' : ''} ${hidden ? 'hidden' : ''} ${locked ? 'locked' : ''}`}
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
		>
			{number}
			{locked ? <FontAwesomeIcon icon={faLock} style={{position: 'absolute', right: 3, bottom: 3, fontSize: 16}}/> : null}
		</div>
	)
}

export default NunmpadButton