import { faCircle, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './colorChooser.css'

function ColorButton({selected, color, onClick = () => {}}){
    return (
      <FontAwesomeIcon icon={selected ? faCircleCheck : faCircle} style={{fontSize: 25, color: `var(--${color})`}} onClick={() => {onClick(color)}}/>
    )
}

export default function ColorChooser({style, value, onChange = () => {}, colors, multiple = false}){
  function handleTagChange(c){
    if (multiple){
      if (value.includes(c)){
        //Remove
        onChange(value.filter(color => color !== c))
      } else {
        //Append
        onChange([...value, c])
      }
    } else {
      onChange(c)
    }
  }

  return (
    <div className="color-chooser" style={style}>
      {colors.map((c, i) => <ColorButton key={i} selected={multiple ? value.includes(c) : (value === c)} color={c} onClick={handleTagChange}/>)}
    </div>
  )
}