import useLongPress from '../../utils/useLongPress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)

function ColorButton({onClick = () => {}, color, locked}){
	const [onTouchStart, onTouchEnd] = useLongPress((type) => {
		onClick(color, type)
	}, 300)

    const colors = {
        default: 'var(--canvasLightDefaultCellColor)',
        red: '#fc5c65',
        orange: '#fd9644',
        yellow: '#fed330',
        green: '#26de81',
        blueGreen: '#2bcbba',
        lightBlue: '#45aaf2',
        darkBlue: '#4b7bec',
        purple: '#a55eea'
    }

    return (
        <div
            className={'numpad__button color fade_in'}
            style={{backgroundColor: colors[color]}}
            onTouchStart={(e) => {
				e.stopPropagation()
				onTouchStart()
			}}
			onTouchEnd={(e) => {
				e.stopPropagation()
				onTouchEnd()
			}}
            onClick={(e) => {
				e.stopPropagation()
				if (isTouchDevice) return
				onClick(color, 'primary')
			}}
			onContextMenu={(e) => {
				e.stopPropagation()
				e.preventDefault()
				if (isTouchDevice) return
				onClick(color, 'secondary')
			}}
        >
            {locked ? <FontAwesomeIcon icon={faLock} style={{fontSize: 30}}/> : null}
        </div>
    )
}

export default ColorButton