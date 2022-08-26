import { faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import Input from '../Input'

function Topbar({title, subtitle = '', titleSize = 24, children, backURL = null, onBack = null, search = false, searchValue = '', onSearch = () => {}}){
	return (
		<div className="topbar">
			<div className={`topbar__top ${subtitle !== '' ? 'subtitle' : ''}`}>
				{
					backURL ?
					<Link to={backURL}>
						<div className='topbar__top__back'>
							<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--theme-color)', fontSize: 24}} />
						</div>
					</Link> :
					onBack ? 
					<div className='topbar__top__back'>
						<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--theme-color)', fontSize: 24}} onClick={onBack} />
					</div> : null
				}
				<p className='topbar__title' style={{fontSize: titleSize, paddingLeft: backURL || onBack ? 0 : 10}}>{title}</p>
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