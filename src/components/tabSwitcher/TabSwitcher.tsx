import { faBookmark, faChartSimple, faGear, faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, useMatch } from 'react-router-dom'
import './tabSwitcher.css'

export default function TabSwitcher() {
    const homeMatch = useMatch('/home')
    const bookmarksMatch = useMatch('/home/bookmarks')
    const statisticsMatch = useMatch('/home/statistics')
    const settingsMatch = useMatch('/home/settings')

    return (
        <>
            <div className='tabSwitcher'>
                <div style={{ flexGrow: 0.8 }}></div>

                <Link to="/home" className={`tabSwitcher__tab ${homeMatch ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faHome} />
                </Link>

                <div style={{ flexGrow: 1 }}></div>

                <Link to="/home/bookmarks" className={`tabSwitcher__tab ${bookmarksMatch ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faBookmark} />
                </Link>

                <div style={{ flexGrow: 1 }}></div>

                <div style={{ height: 50, width: 50 }}>

                </div>

                <div style={{ flexGrow: 1 }}></div>

                <Link to="/home/statistics" className={`tabSwitcher__tab ${statisticsMatch ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faChartSimple} />
                </Link>

                <div style={{ flexGrow: 1 }}></div>

                <Link to="/home/settings" className={`tabSwitcher__tab ${settingsMatch ? 'selected' : ''}`}>
                    <FontAwesomeIcon className='tabSwitcher__icon' icon={faGear} />
                </Link>

                <div style={{ flexGrow: 0.8 }}></div>

                <div className='tabSwitcher__hole'></div>
            </div>
        </>
    )
}
