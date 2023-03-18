import './button.css'
import ReactLoading from 'react-loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Button({title, icon, ghost, compact, disabled, loading, small, fontSize = 22, color = 'white', backgroundColor = 'var(--theme-color)', fontColor = 'white', onClick = () => {}, marginBottom = 14, borderColor = null}) {
	const clickHandler = () => { if (!disabled && !loading) onClick() };

	return (
		<div
			className={`
				button
				${icon ? 'icon' : ''}
				${ghost ? 'ghost' : ''}
				${compact ? 'compact' : ''}
				${disabled ? 'disabled' : ''}
				${small ? 'small': ''}
			`}
			style={{
				color: ghost ? 'var(--theme-color)' : color,
				backgroundColor: ghost ? 'var(--theme-color-light)' : backgroundColor,
				marginBottom: marginBottom,
				fontSize: fontSize,
				border: borderColor === null ? 'none' : `solid 1px ${borderColor}`
			}}
			onClick={clickHandler}
		>
			{icon && !loading ? <FontAwesomeIcon icon={icon} /> : null}
			{loading ? <ReactLoading type="spin" color="white" height="20px" width="20px"/> : null}
			{title && !loading ? <div className="button__title">{title}</div> : null}
		</div>
	)
}
