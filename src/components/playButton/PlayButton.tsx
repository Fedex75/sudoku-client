import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './playButton.css'

export type PlayButtonAction = 'default' | 'confirm' | 'moveToTop'
export type PlayButtonVariant = 'defaultVariant' | 'confirmVariant'

type Props = {
    action: PlayButtonAction
    variant: PlayButtonVariant
    onPlayButtonClick: () => void
}

export default function PlayButton({ action, variant, onPlayButtonClick }: Props) {
    return (
        <>
            <div id='playButton' className={`play-button ${action} ${variant}`} onClick={() => { onPlayButtonClick() }}>
                <FontAwesomeIcon className='play-button__icon' icon={faPlay} />
            </div>
        </>
    )
}
