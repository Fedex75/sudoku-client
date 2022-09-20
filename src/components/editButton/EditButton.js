import './editButton.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)

function EditButton({onClick = () => {}, highlight = false, yellow = false, icon}){
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
			<FontAwesomeIcon className='edit-buttons__button__icon' icon={icon} />
		</div>
	)
}

export default EditButton