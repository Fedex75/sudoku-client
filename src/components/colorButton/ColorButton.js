import React, {useRef} from "react";
import useLongPress from '../../utils/useLongPress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

function ColorButton({onClick = () => {}, color, locked}){
    const endLongPressFired = useRef(false)
	const [onTouchStart, onTouchEnd] = useLongPress((type) => {
		endLongPressFired.current = true
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
            className={'numpad__button color'}
            style={{backgroundColor: colors[color]}}
            onTouchStart={(e) => {
				e.stopPropagation()
				onTouchStart()
			}}
			onTouchEnd={(e) => {
				e.stopPropagation()
				onTouchEnd()
			}}
        >
            {locked ? <FontAwesomeIcon icon={faLock} style={{fontSize: 30}}/> : null}
        </div>
    )
}

export default ColorButton