import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import './topbar.css'
import SVGLogo from '../../svg/logo'
import { PropsWithChildren, ReactNode } from 'react'

type Props = {
	logo?: boolean;
	title?: string | null;
	subtitle?: string | null;
	backURL?: string | null;
	onBack?: (() => void) | null;
	buttons?: ReactNode[];
	onTitleClick?: () => void;
}

export default function Topbar({logo = false, title = null, subtitle = null, children = [], backURL = null, onBack = null, buttons = [], onTitleClick = () => {}}: PropsWithChildren<Props>) {
	return (
		<div className='topbar'>
			<div className='topbar__top' style={{gridTemplateColumns: `${backURL || onBack ? 'fit-content(0)' : ''} fit-content(0) auto ${buttons.length > 0 ? `repeat(${buttons.length}, fit-content(0))` : ''}`, gridTemplateAreas: `"${backURL || onBack ? 'back' : ''} title additional ${buttons.map((_, i) => 'button' + i).join(' ')}"`}}>
				{
					backURL ?
					<Link to={backURL}>
						<div className='topbar__top__back'>
							<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--themeColor)', fontSize: 24}} />
						</div>
					</Link> :
					onBack ?
					<div className='topbar__top__back'>
						<FontAwesomeIcon icon={faChevronLeft} style={{color: 'var(--themeColor)', fontSize: 24}} onClick={onBack} />
					</div> : null
				}
				{
					subtitle ?
					<div className='topbar__title-wrapper subtitle' onClick={onTitleClick}>
						<p className='topbar__title'>{title}</p>
						<p className='topbar__subtitle'>{subtitle}</p>
					</div> :
					title ?
					<div className='topbar__title-wrapper' style={{width: 'fit-content'}} onClick={onTitleClick}>
						<p className='topbar__title'>{title}</p>
						<p className='topbar__subtitle'>{subtitle}</p>
					</div> :
					logo ?
					<SVGLogo className='topbar__logo' fill='var(--primaryTextColor)' />
					: null
				}
				<div className='topbar__top__additional' style={{gridTemplateColumns: `repeat(${(children as ReactNode[]).length || 0}, fit-content(0))`}}>
					{children}
				</div>
				{buttons}
			</div>
		</div>
	)
}
