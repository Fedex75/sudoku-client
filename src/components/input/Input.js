import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useRef, useState } from 'react'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export default function Input({value = '', onChange = () => {}, type = 'text', onEnter = () => {}, min, max, icon, iconColor = 'var(--theme-color)', width = '100%', noMargin, backgroundColor = '', compact, placeholder, disabled, autoFocus, buttons, error = false, onIconClick = () => {}}){
	const [focus, setFocus] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const textInput = useRef(null)

	const handleEyeClick = () => { setShowPassword(!showPassword) }

	const handleKeyDown = e => {
		if (e.key === 'Enter' && onEnter){
			textInput.current.blur()
			onEnter()
		}
	}

	return (
		<div 
			className={`
				input
				${compact ? 'compact' : ''}
				${focus ? 'focus' : ''}
				${width !== '100%' ? 'fit-content' : ''}
				${noMargin ? 'no-margin' : ''}
				${error ? 'error' : ''}
			`}
			style={{backgroundColor: backgroundColor}}
		>	
			{icon ? <FontAwesomeIcon icon={icon} style={{color: iconColor}} onClick={onIconClick} /> : null}
			<input
				ref={textInput}
				type={
					(type === 'password' && showPassword) || type === 'name' ? 'text' :
					type
				}
				autoCapitalize={type === 'name' ? 'words' : 'off'}
				min={min}
				max={max}
				onFocus={() => {setFocus(true)}}
				onBlur={() => {setFocus(false)}}
				value={value}
				onChange={ev => {onChange(ev.target.value)}}
				placeholder={placeholder}
				onKeyDown={handleKeyDown}
				disabled={disabled}
				autoFocus={autoFocus}
			/>
			<div className="input__buttons">
				{type === 'password' ? <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} onClick={handleEyeClick} /> : null}
				{buttons ? buttons.map((btn, i) => (React.cloneElement(btn, {key: i}))) : null}
			</div>
		</div>
	)
}