import { faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import ThemeHandler from '../../utils/ThemeHandler'
import Input from '../Input'

function Topbar({title, subtitle = '', titleSize = 24, children, backURL = null, onBack = null, search = false, searchValue = '', onSearch = () => {}}){
	return (
		<div className="topbar">
			<div className={`topbar__top ${subtitle !== '' ? 'subtitle' : ''}`}>
				<div className='topbar__top__back'>
					{backURL ? <Link to={backURL}><FontAwesomeIcon icon={faChevronLeft} style={{color: ThemeHandler.theme.topbarFontColor}} /></Link> :
					onBack ? <FontAwesomeIcon icon={faChevronLeft} style={{color: ThemeHandler.theme.topbarFontColor}} onClick={onBack} /> : null}
				</div>
				<p className='topbar__title' style={{fontSize: titleSize}}>{title}</p>
				{subtitle !== '' ? <p className='topbar__subtitle'>{subtitle}</p> : null}
				<div className='topbar__buttons'>
					{children}
				</div>
			</div>
			{ search ?
				<div className='topbar__bottom'>
					<Input compact type="text" icon={faMagnifyingGlass} iconColor="var(--secondary-text-color)" value={searchValue} onChange={onSearch} placeholder="Buscar contraseñas" />
				</div> : null
			}
		</div>
	)
}

export default Topbar