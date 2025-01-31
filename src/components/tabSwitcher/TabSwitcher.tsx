import { faBookmark, faChartSimple, faGear, faPlay, faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, useNavigate } from 'react-router-dom'
import './tabSwitcher.css'
import { useCallback, useState } from 'react'
import GameHandler from '../../utils/GameHandler'

type Props = {
    selected: 'newGame' | 'bookmarks' | 'statistics' | 'settings'
}

export default function TabSwitcher({ selected }: Props) {
    const [playButtonClicked, setPlayButtonClicked] = useState(false)

    let navigate = useNavigate()

    const handlePlayButtonClicked = useCallback(() => {
        if (playButtonClicked) return

        setPlayButtonClicked(true)
        setTimeout(() => {
            if (!GameHandler.game || GameHandler.game.complete) GameHandler.newGame(GameHandler.recommendations.newGame.mode, GameHandler.recommendations.newGame.difficulty)
            navigate('/sudoku')
        }, 500)
    }, [playButtonClicked, navigate])

    return (
        <>
            <div className='tabSwitcher'>
                <div style={{ flexGrow: 0.8 }}></div>

                <Link to="/home" className={`tabSwitcher__tab ${selected === 'newGame' ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faHome} />
                </Link>

                <div style={{ flexGrow: 1 }}></div>

                <Link to="/home/bookmarks" className={`tabSwitcher__tab ${selected === 'bookmarks' ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faBookmark} />
                </Link>

                <div style={{ flexGrow: 1 }}></div>

                <div style={{ height: 50, width: 50 }}>

                </div>

                <div style={{ flexGrow: 1 }}></div>

                <Link to="/home/statistics" className={`tabSwitcher__tab ${selected === 'statistics' ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faChartSimple} />
                </Link>

                <div style={{ flexGrow: 1 }}></div>

                <Link to="/home/settings" className={`tabSwitcher__tab ${selected === 'settings' ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faGear} />
                </Link>

                <div style={{ flexGrow: 0.8 }}></div>

                <div className='tabSwitcher__hole'></div>

                <div id='playButton' className={`tabSwitcher__play-button ${playButtonClicked ? 'activated' : ''}`} onClick={handlePlayButtonClicked}>
                    <FontAwesomeIcon className='tabSwitcher__play-button__icon' icon={faPlay} />
                </div>
            </div>

            <div className={`tabSwitcher__play-backdrop ${playButtonClicked ? 'activated' : ''}`}></div>
        </>
    )
}
