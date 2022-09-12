import './actionSheetButton.css'
import { useState } from "react"

export default function ActionSheetButton({title, color = 'var(--theme-color)', onClick = () => {}, cancel = false}){
	const [clicked, setClicked] = useState(false)

	return (
		<div
			className={`action-sheet__button ${cancel ? 'cancel' : ''}`}
			onClick={onClick}
			onTouchStart={() => {setClicked(true)}}
			onTouchEnd={() => {setClicked(false)}}
			style={{
				color: color,
				filter: clicked ? 'brightness(90%)' : 'none'
			}}
		>	
			{title}
		</div>
	)
}