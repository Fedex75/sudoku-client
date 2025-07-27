import { motion } from 'framer-motion';
import './buttonCover.css';
import { GAME_SLIDE_ANIMATION_DURATION_SECONDS } from '../../utils/Constants';
import { useState } from 'react';

export default function ButtonCover({ animationDelay }: { animationDelay: number; }) {
    const [shouldAnimate, setShouldAnimate] = useState(true);

    if (!shouldAnimate) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: GAME_SLIDE_ANIMATION_DURATION_SECONDS + animationDelay, duration: 0.5 }}
            className='button-cover'
            onAnimationComplete={() => { setShouldAnimate(false); }}
        >
        </motion.div>
    );
}
