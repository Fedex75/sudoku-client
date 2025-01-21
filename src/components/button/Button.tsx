import './button.css'
import ReactLoading from 'react-loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

type Props = {
	title: string
	icon?: IconDefinition
	ghost?: boolean
	compact?: boolean
	disabled?: boolean
	loading?: boolean
	small?: boolean
	fontSize?: number
	color?: string
	backgroundColor?: string
	onClick?: () => void
	marginBottom?: number
	borderColor?: string | null
}

export default function Button({ title, icon, ghost, compact, disabled, loading, small, fontSize = 22, color = 'white', backgroundColor = 'var(--themeColor)', onClick = () => { }, marginBottom = 14, borderColor = null }: Props) {
	const clickHandler = () => { if (!disabled && !loading) onClick() }

	return (
		<div
			className={`
				button
				${icon ? 'icon' : ''}
				${ghost ? 'ghost' : ''}
				${compact ? 'compact' : ''}
				${disabled ? 'disabled' : ''}
				${small ? 'small' : ''}
			`}
			style={{
				color: ghost ? 'var(--themeColor)' : color,
				backgroundColor: ghost ? 'var(--themeColor-light)' : backgroundColor,
				marginBottom: marginBottom,
				fontSize: fontSize,
				border: borderColor === null ? 'none' : `solid 1px ${borderColor}`
			}}
			onClick={clickHandler}
		>
			{icon && !loading ? <FontAwesomeIcon icon={icon} /> : null}
			{loading ? <ReactLoading type="spin" color="white" height="20px" width="20px" /> : null}
			{title && !loading ? <div className="button__title">{title}</div> : null}
		</div>
	)
}
