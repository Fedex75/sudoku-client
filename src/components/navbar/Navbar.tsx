import { faBookmark, faChartSimple, faCheck, faGear, faHome, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, useMatch } from 'react-router-dom'
import './navbar.css'
import { AnimatePresence, motion } from 'framer-motion'
import { COMMON_UI_ANIMATION_DURATION_SECONDS } from '../../utils/Constants'

export type NavbarAction = 'default' | 'prompt'

type Props = {
    action: NavbarAction
    onConfirm: () => void
    onCancel: () => void
    text?: string
    backgroundColor?: string
    color?: string
}

export default function Navbar({ action, onConfirm, onCancel, text = '', backgroundColor = 'var(--darkBackground)', color = 'white' }: Props) {
    const homeMatch = useMatch('/home')
    const bookmarksMatch = useMatch('/home/bookmarks')
    const statisticsMatch = useMatch('/home/statistics')
    const settingsMatch = useMatch('/home/settings')

    return (
        <>
            <motion.div
                initial={false}
                animate={action === 'default' ? { bottom: '30px' } : { bottom: '90px' }}
                transition={{ duration: COMMON_UI_ANIMATION_DURATION_SECONDS, ease: 'linear' }}
                className='navbar'
                style={{ backgroundColor: backgroundColor }}
            >
                {
                    action === 'prompt' ?
                        <p className='navbar__text' style={{ color: color }}>{text}</p>
                        : <>
                            <div style={{ flexGrow: 0.8 }}></div>

                            <Link to="/home" className={`navbar__tab ${homeMatch ? 'selected' : ''}`}>
                                <FontAwesomeIcon className='navbar__icon' icon={faHome} />
                            </Link>

                            <div style={{ flexGrow: 1 }}></div>

                            <Link to="/home/bookmarks" className={`navbar__tab ${bookmarksMatch ? 'selected' : ''}`}>
                                <FontAwesomeIcon className='navbar__icon' icon={faBookmark} />
                            </Link>

                            <div style={{ flexGrow: 1 }}></div>

                            <div style={{ height: 50, width: 50 }}>

                            </div>

                            <div style={{ flexGrow: 1 }}></div>

                            <Link to="/home/statistics" className={`navbar__tab ${statisticsMatch ? 'selected' : ''}`}>
                                <FontAwesomeIcon className='navbar__icon' icon={faChartSimple} />
                            </Link>

                            <div style={{ flexGrow: 1 }}></div>

                            <Link to="/home/settings" className={`navbar__tab ${settingsMatch ? 'selected' : ''}`}>
                                <FontAwesomeIcon className='navbar__icon' icon={faGear} />
                            </Link>
                        </>
                }

                <div style={{ flexGrow: 0.8 }}></div>
            </motion.div>

            <AnimatePresence>
                {
                    action === 'prompt' &&
                    <motion.div
                        key='navbarConfirm'
                        initial={{ bottom: '-60px' }}
                        animate={{ bottom: '20px', }}
                        exit={{ bottom: '-60px' }}
                        transition={{ duration: COMMON_UI_ANIMATION_DURATION_SECONDS, ease: 'linear' }}
                        className={`play-button confirmVariant`}
                        onClick={() => { onConfirm() }}
                    >
                        <FontAwesomeIcon className='play-button__icon' icon={faCheck} />
                    </motion.div>
                }
            </AnimatePresence>

            <AnimatePresence>
                {
                    action === 'prompt' &&
                    <motion.div
                        key='navbarCancel'
                        initial={{ bottom: '-60px' }}
                        animate={{ bottom: '20px', }}
                        exit={{ bottom: '-60px' }}
                        transition={{ duration: COMMON_UI_ANIMATION_DURATION_SECONDS, ease: 'linear' }}
                        className={`play-button cancelVariant`}
                        onClick={() => { onCancel() }}
                    >
                        <FontAwesomeIcon className='play-button__icon' icon={faXmark} fontSize={28} />
                    </motion.div>
                }
            </AnimatePresence>

            <AnimatePresence>
                {
                    action === 'prompt' &&
                    <motion.div
                        key='navbarBackdrop'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: COMMON_UI_ANIMATION_DURATION_SECONDS, ease: 'linear' }}
                        className='navbar-backdrop'
                        onClick={() => { onCancel() }}
                    />
                }
            </AnimatePresence>
        </>
    )
}
