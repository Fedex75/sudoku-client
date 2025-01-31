import './actionSheetButton.css'
import { useState } from "react"

type Props = {
    title: string
    color?: string
    onClick?: () => void
    cancel?: boolean
}

export default function ActionSheetButton({ title, color = '', onClick = () => { }, cancel = false }: Props) {
    const [clicked, setClicked] = useState(false)

    return (
        <div
            className={`action-sheet__button ${cancel ? 'cancel' : ''}`}
            onClick={onClick}
            onTouchStart={() => { setClicked(true) }}
            onTouchEnd={() => { setClicked(false) }}
            style={{
                color: color,
                filter: clicked ? 'brightness(90%)' : 'none'
            }}
        >
            {title}
        </div>
    )
}
