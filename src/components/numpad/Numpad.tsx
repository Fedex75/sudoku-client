import React from 'react'
import { useState } from 'react'
import ColorButton from '../colorButton/ColorButton'
import EditButton from '../editButton/EditButton'
import NunmpadButton from '../numpadButton/NumpadButton'
import UndoSVG from '../../svg/undo'
import EraserSVG from '../../svg/eraser'
import PencilSVG from '../../svg/pencil'
import BulbSVG from '../../svg/bulb'
import './numpad.css'
import MagicWandSVG from '../../svg/magic_wand'
import SelectSVG from '../../svg/select'
import ColorCirclePaintedSVG from '../../svg/color_circle_painted'
import { colorNames } from '../../utils/Colors'
import GameHandler from '../../utils/GameHandler'
import ColorCircleSVG from '../../svg/color_circle'
import { MouseButtonType } from '../../utils/DataTypes'

type Props = {
  onUndo: () => void;
  onErase: () => void;
  onNote: () => void;
  onHint: () => void;
  onMagicWand: () => void;
  onSelect: () => void;
  onColor: () => void;
  onColorButtonClick: () => void;
  onNumpadButtonClick: (number: number, type: MouseButtonType) => void;

  noteHighlighted: boolean;
  magicWandHighlighted: boolean;
  selectHighlighted: boolean;
  colorOn: boolean;
  colorMode: boolean;

  lockedInput: number;
  possibleValues: number[];
  completedNumbers: number[];
}

export default function Numpad({onUndo, onErase, onNote, onHint, onMagicWand, onSelect, onColor, lockedInput, onColorButtonClick, onNumpadButtonClick, noteHighlighted, magicWandHighlighted, selectHighlighted, colorOn, colorMode, possibleValues, completedNumbers}: Props): React.JSX.Element {
  const [hintState, setHintState] = useState(false);

  function handleHintClick(){
    if (hintState){
      onHint()
      setHintState(false)
    } else {
      setHintState(true)
      setTimeout(() => {setHintState(false)}, 2000)
    }
  }

  const editButtons = [
    <EditButton key={0} icon={<UndoSVG />} onClick={onUndo}/>,
    <EditButton key={1} icon={<EraserSVG />} onClick={onErase}/>,
    <EditButton key={2} icon={<PencilSVG />} highlight={noteHighlighted} onClick={onNote}/>,
    <EditButton key={3} icon={<BulbSVG />} yellow={hintState} onClick={handleHintClick}/>
  ]

  const specialButtons = [
    <EditButton key={4} icon={<MagicWandSVG />} highlight={magicWandHighlighted} onClick={onMagicWand}/>,
    <EditButton key={5} icon={<SelectSVG />} highlight={selectHighlighted} onClick={onSelect}/>,
    <EditButton key={6} icon={colorOn ? <ColorCirclePaintedSVG /> : <ColorCircleSVG />} onClick={onColor}/>
  ]

  const rows: React.JSX.Element[][] = [[], [], []]

  for (let i = 0; i < 3; i++){
    for (let j = 0; j < 3; j++){
      const buttonIndex = 3 * i + j
      rows[i].push(
        colorMode ?
        <ColorButton
          key={buttonIndex + 7}
          color={colorNames[buttonIndex]}
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
