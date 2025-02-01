import React from 'react'
import './editButton.css'
import ButtonCover from '../buttonCover/ButtonCover'

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0)

type Props = {
    onClick: () => void
    highlight?: Boolean
    yellow?: Boolean
    icon: React.ReactNode
    disabled?: Boolean
    number?: number
    animationDelay: number
}

function EditButton({ onClick, highlight = false, yellow = false, icon, disabled = false, number = 0, animationDelay }: Props) {
    return (
        <div
            className={`edit-buttons__button fade_in ${highlight ? 'highlight' : ''} ${yellow ? 'yellow' : ''} ${disabled ? 'disabled' : ''} ${number > 0 ? 'number' : ''}`}
            onTouchStart={e => {
                e.stopPropagation()
                if (disabled) return
                onClick()
            }}
            onClick={e => {
                e.stopPropagation()
                if (isTouchDevice || disabled) return
                onClick()
            }}
            onContextMenu={e => {
                e.stopPropagation()
                e.preventDefault()
                if (isTouchDevice || disabled) return
                onClick()
            }}
        >
            {icon}
            {
                number > 0 ? number : null
            }
            <ButtonCover animationDelay={animationDelay} />
        </div>
    )
}

export default EditButton
