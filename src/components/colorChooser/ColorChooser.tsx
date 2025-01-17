import { faCircle, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './colorChooser.css'
import { HTMLAttributes } from 'react'

type ColorButtonProps = {
  selected: boolean
  color: string
  onClick: (c: string) => void
}

function ColorButton({ selected, color, onClick = () => { } }: ColorButtonProps) {
  return (
    <FontAwesomeIcon icon={selected ? faCircleCheck : faCircle} style={{ fontSize: 25, color: `var(--${color})` }} onClick={() => { onClick(color) }} />
  )
}

type ColorChooserProps = {
  style?: HTMLAttributes<HTMLDivElement>
  value: string
  onChange: (c: string) => void
  colors: string[]
}

export default function ColorChooser({ style, value, onChange = () => { }, colors }: ColorChooserProps) {
  return (
    <div className="color-chooser" style={style}>
      {colors.map((c, i) => <ColorButton key={i} selected={value === c} color={c} onClick={() => { onChange(c) }} />)}
    </div>
  )
}
