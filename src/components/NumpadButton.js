import React, {useRef} from 'react'
import useLongPress from '../utils/useLongPress'

function NunmpadButton({onClick, number, disabled, hidden, locked}){
	const endLongPressFired = useRef(false)
	const [onTouchStart, onTouchEnd] = useLongPress((type) => {
		endLongPressFired.current = true
		onClick(number, type)
	}, 500)

	return (
		<div
			/*ref={divRef}*/
			className={`numpad__button number ${disabled ? 'disabled' : ''} ${hidden ? 'hidden' : ''} ${locked ? 'locked' : ''}`}
			onClick={(e) => {
				e.stopPropagation()
				//e.preventDefault()
				if (hidden) return
				if (endLongPressFired.current) endLongPressFired.current = false
				else onClick(number, 'primary')
			}}
			onContextMenu={(e) => {
				e.stopPropagation()
				e.preventDefault()
				if (hidden) return
				onClick(number, 'secondary')
			}}
			onTouchStart={(e) => {
				e.stopPropagation()
				//e.preventDefault()
				if (hidden) return
				onTouchStart()
			}}
			onTouchEnd={(e) => {
				e.stopPropagation()
				//e.preventDefault()
				if (hidden) return
				onTouchEnd()
			}}
		>
			{number}
		</div>
	)
}

export default NunmpadButton