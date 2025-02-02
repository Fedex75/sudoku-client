import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import './playButton.css'
import { COMMON_UI_ANIMATION_DURATION_SECONDS } from '../../utils/Constants'

export type PlayButtonAction = 'default' | 'hide'

type Props = {
    action: PlayButtonAction
    onPlay: () => void
}

export default function PlayButton({ action, onPlay }: Props) {
    console.log(action)
    return (
        <motion.div
            initial={{ top: 'calc(100vh - 85px)' }}
            animate={
                action === 'hide' ? { top: 'calc(100vh - 1px)', transition: { duration: COMMON_UI_ANIMATION_DURATION_SECONDS, ease: 'linear' } } :
                    { top: 'calc(100vh - 85px)', transition: { duration: COMMON_UI_ANIMATION_DURATION_SECONDS, ease: 'linear' } }
            }
            className={`play-button defaultVariant`}
            onClick={() => { onPlay() }}
        >
            <FontAwesomeIcon className='play-button__icon' icon={faPlay} />
        </motion.div>
    )
}
