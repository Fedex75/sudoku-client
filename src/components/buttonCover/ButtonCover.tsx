import { motion } from 'framer-motion'
import './buttonCover.css'
import { GAME_SLIDE_ANIMATION_DURATION_SECONDS } from '../../utils/Constants'

export default function ButtonCover({ animationDelay }: { animationDelay: number }) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: GAME_SLIDE_ANIMATION_DURATION_SECONDS + animationDelay, duration: 0.5 }}
            className='button-cover'
        >
        </motion.div>
    )
}
