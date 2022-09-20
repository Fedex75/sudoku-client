import './topbar.css'
import { faChevronLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { Input, ExpandCard } from '../'

function Topbar({title, subtitle = null, children = [], backURL = null, onBack = null, search = false, searchValue = '', onSearch = () => {}, buttons = [], onTitleClick = () => {}}){
	return (
		<div className='topbar fade_in'>
			<div className='topbar__top' style={{gridTemplateColumns: `${backURL || onBack ? 'fit-content(0)' : ''} fit-content(0) auto repeat(${buttons.length}, fit-content(0))`, gridTemplateAreas: `"${backURL || onBack ? 'back' : ''} title additional ${buttons.map((_, i) => 'button' + i).join(' ')}"`}}>
				{
					backURL ?
					<Link to={backURL}>
						<ExpandCard className='topbar__top__back'>
							<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--theme-color)', fontSize: 24}} />
						</ExpandCard>
					</Link> :
					onBack ? 
					<ExpandCard className='topbar__top__back'>
						<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--theme-color)', fontSize: 24}} onClick={onBack} />
					</ExpandCard> : null
				}
				{
					subtitle ?
					<div className='topbar__title-wrapper subtitle' onClick={onTitleClick}>
						<p className='topbar__title'>{title}</p>
						<p className='topbar__subtitle'>{subtitle}</p>
					</div> :
					<ExpandCard className='topbar__title-wrapper' style={{width: 'fit-content'}} onClick={onTitleClick}>
						<p className='topbar__title'>{title}</p>
						<p className='topbar__subtitle'>{subtitle}</p>
					</ExpandCard>	
				}
				<div className='topbar__top__additional' style={{gridTemplateColumns: `repeat(${children.length}, fit-content(0))`}}>
					{children}
				</div>
				{buttons}
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