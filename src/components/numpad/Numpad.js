import { faDroplet, faDropletSlash, faEraser, faLightbulb, faLink, faPencilAlt, faUndo } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import ColorButton from '../colorButton/ColorButton'
import EditButton from '../editButton/EditButton'
import NunmpadButton from '../numpadButton/NumpadButton'
import './numpad.css'

const colorNames = ['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple', 'default']

export default function Numpad({onUndo, onErase, onNote, noteState, onHint, onLinks, linkState, onColor, colorState, onEraseInk, lockedInput, lockedColor, possibleValues, completedNumbers, onColorButtonClick, onNumpadButtonClick}){
  const [hintState, setHintState] = useState(false)
  const [eraseInkState, setEraseInkState] = useState(false)

  function handleHintClick(){
    if (hintState){
      onHint()
      setHintState(false)
    } else {
      setHintState(true)
      setTimeout(() => {setHintState(false)}, 2000)
    }
  }

  function handleEraseInkClick(){
    if (eraseInkState){
      onEraseInk()
      setEraseInkState(false)
    } else {
      setEraseInkState(true)
      setTimeout(() => {setEraseInkState(false)}, 2000)
    }
  }

  const editButtons = [
    <EditButton key={0} icon={faUndo} title="Undo" onClick={onUndo}/>,
    <EditButton key={1} icon={faEraser} title="Erase" onClick={onErase}/>,
    <EditButton key={2} icon={faPencilAlt} highlight={noteState} title="Notes" onClick={onNote}/>,
    <EditButton key={3} icon={faLightbulb} yellow={hintState} title="Hint" onClick={handleHintClick}/>
  ]

  const specialButtons = [
    <EditButton key={4} icon={faLink}  title="Links" highlight={linkState} onClick={onLinks}/>,
    <EditButton key={5} icon={faDroplet}  title="Paint" highlight={colorState} onClick={onColor}/>,
    <EditButton key={6} icon={faDropletSlash}  title="Erase ink" yellow={eraseInkState} onClick={handleEraseInkClick}/>
  ]

  const rows = [[], [], []]

  for (let i = 0; i < 3; i++){
    for (let j = 0; j < 3; j++){
      const buttonIndex = 3 * i + j
      rows[i].push(
        colorState ?
        <ColorButton
          key={buttonIndex + 7}
          color={colorNames[buttonIndex]}
          locked={lockedColor === colorNames[buttonIndex]}
          onClick={onColorButtonClick}
        /> :
        <NunmpadButton
          key={buttonIndex + 7}
          number={buttonIndex + 1}
          disabled={possibleValues !== null && !possibleValues.includes(buttonIndex + 1)}
          hidden={completedNumbers.includes(buttonIndex + 1)}
          locked={!completedNumbers.includes(buttonIndex + 1) && lockedInput === buttonIndex + 1}
          onClick={onNumpadButtonClick}
        />
      )
    }
  }

  return (
    <div className='numpad' onContextMenu={e => {e.preventDefault()}}>
      <div className='numpad__edit-buttons'>
        {editButtons}
      </div>
      <div className='numpad__special-buttons'>
        {specialButtons}
      </div>
      <div className='numpad__rows-wrapper'>
        {
          rows.map((row, i) => (
            <div key={i} className='numpad__button-row' style={{gridArea: `row${i+1}`}}>
              {rows[i]}
            </div>
          ))
        }
      </div>
    </div>
  )
}