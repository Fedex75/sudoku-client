import { faCircle, faCircleDot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './colorChooser.css'
import { HTMLAttributes, useContext } from 'react'
import { AccentColorContext } from '../../utils/hooks/useAccentColor'
import { AccentColor } from '../../utils/Colors'

type ColorButtonProps = {
    selected: boolean
    color: string
    onClick: (c: string) => void
}

function ColorButton({ selected, color, onClick = () => { } }: ColorButtonProps) {
    return (
        <FontAwesomeIcon icon={selected ? faCircleDot : faCircle} style={{ fontSize: 25, color: `var(--${color})` }} onClick={() => { onClick(color) }} />
    )
}

type ColorChooserProps = {
    style?: HTMLAttributes<HTMLDivElement>
    colors: string[]
}

export default function ColorChooser({ style, colors }: ColorChooserProps) {
    const { accentColor, setAccentColor } = useContext(AccentColorContext)

    return (
        <div className="color-chooser" style={style}>
            {colors.map((c, i) => <ColorButton key={i} selected={accentColor === c} color={c} onClick={() => { setAccentColor(c as AccentColor) }} />)}
        </div>
    )
}
