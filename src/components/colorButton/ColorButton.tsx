import useLongPress from '../../utils/useLongPress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { ColorDefinitions, ColorName } from '../../utils/Colors'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0)

type Props = {
    onClick: (color: string, type: 'primary' | 'secondary') => void;
    color: ColorName;
    locked?: boolean;
}

export default function ColorButton({onClick = () => {}, color, locked = false}: Props): React.JSX.Element {
	const [onTouchStart, onTouchEnd] = useLongPress((type) => {
		onClick(color, type)
	}, 300)

    return (
        <div
            className={'numpad__button color fade_in'}
            style={{backgroundColor: ColorDefinitions[color]}}
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
