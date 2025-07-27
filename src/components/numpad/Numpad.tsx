import React, { useCallback } from 'react';
import { useState } from 'react';
import EditButton from '../editButton/EditButton';
import NunmpadButton from '../numpadButton/NumpadButton';
import UndoSVG from '../../svg/undo';
import EraserSVG from '../../svg/eraser';
import PencilSVG from '../../svg/pencil';
import BulbSVG from '../../svg/bulb';
import './numpad.css';
import SelectSVG from '../../svg/select';
import ColorCirclePaintedSVG from '../../svg/color_circle_painted';
import { ColorName, colorNames } from '../../utils/Colors';
import { MouseButtonType } from '../../utils/DataTypes';
import { BOARD_FADEIN_ANIMATION_DURATION_MS } from '../../utils/Constants';

type Props = {
    paused: boolean;

    onUndo: () => void;
    onErase: () => void;
    onNote: () => void;
    onHint: () => void;
    onMagicWand: () => void;
    onSelect: () => void;
    onColor: () => void;
    onColorButtonClick: (color: ColorName | null, type: MouseButtonType) => void;
    onNumpadButtonClick: (number: number, type: MouseButtonType) => void;

    noteHighlighted: boolean;
    magicWandHighlighted: boolean;
    magicWandIcon: React.ReactNode;
    calculatorValue: number;
    selectHighlighted: boolean;
    colorMode: boolean;

    undoDisabled: boolean;
    eraseDisabled: boolean;
    hintDisabled: boolean;
    magicWandDisabled: boolean;

    lockedInput: number;
    lockedColor: ColorName | null;
    possibleValues: Set<number>;
    completedNumbers: Set<number>;
    colorDisabled: boolean;
};

const ROW_DELAY_DELTA = 0.1;
const CORRECTION = 0.3;

export default function Numpad({ paused, onUndo, onErase, onNote, onHint, onMagicWand, onSelect, onColor, lockedInput, onColorButtonClick, onNumpadButtonClick, noteHighlighted, magicWandHighlighted, selectHighlighted, colorMode, possibleValues, completedNumbers, undoDisabled, eraseDisabled, hintDisabled, magicWandIcon, magicWandDisabled, lockedColor, calculatorValue }: Props): React.JSX.Element {
    const [hintState, setHintState] = useState(false);

    const handleHintClick = useCallback(() => {
        if (hintState) {
            onHint();
            setHintState(false);
        } else {
            setHintState(true);
            setTimeout(() => { setHintState(false); }, 2000);
        }
    }, [hintState, onHint]);



    const editButtons = [
        <EditButton key={0} icon={<UndoSVG />} onClick={onUndo} disabled={undoDisabled || paused} animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 - CORRECTION} />,
        <EditButton key={1} icon={<EraserSVG />} onClick={onErase} disabled={eraseDisabled || paused} animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 - CORRECTION} />,
        <EditButton key={2} icon={<PencilSVG stroke={noteHighlighted ? 'none' : undefined} />} highlight={noteHighlighted} onClick={onNote} animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 - CORRECTION} disabled={paused} />,
        <EditButton key={3} icon={<BulbSVG />} yellow={hintState} onClick={handleHintClick} disabled={hintDisabled || paused} animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 - CORRECTION} />
    ];

    const specialButtons = [
        <EditButton key={5} icon={<SelectSVG fill={selectHighlighted ? 'white' : undefined} />} highlight={selectHighlighted} onClick={onSelect} number={calculatorValue} animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 + ROW_DELAY_DELTA - CORRECTION} disabled={paused} />,
        <EditButton key={4} icon={magicWandIcon} highlight={magicWandHighlighted} onClick={onMagicWand} disabled={magicWandDisabled || paused} animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 + ROW_DELAY_DELTA * 2 - CORRECTION} />,
        <EditButton key={6} icon={<ColorCirclePaintedSVG />} highlight={colorMode} onClick={onColor} animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 + ROW_DELAY_DELTA * 3 - CORRECTION} disabled={paused} />
    ];

    const rows: React.JSX.Element[][] = [[], [], []];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const buttonIndex = 3 * i + j;
            rows[i].push(
                <NunmpadButton
                    key={buttonIndex + 7}
                    colorMode={colorMode}
                    number={buttonIndex + 1}
                    disabled={(!colorMode && possibleValues !== null && !possibleValues.has(buttonIndex + 1)) || paused}
                    hidden={completedNumbers.has(buttonIndex + 1)}
                    locked={!completedNumbers.has(buttonIndex + 1) && lockedInput === buttonIndex + 1
                    }
                    onNumberClick={onNumpadButtonClick}
                    onColorClick={onColorButtonClick}
                    animationDelay={BOARD_FADEIN_ANIMATION_DURATION_MS / 1000 + ROW_DELAY_DELTA * (i + 1) - CORRECTION}
                    color={[null, ...colorNames][buttonIndex]}
                />
            );
        }
    }

    return (
        <div className='numpad' onContextMenu={e => { e.preventDefault(); }}>
            <div className='numpad__edit-buttons'>
                {editButtons}
            </div>
            <div className='numpad__special-buttons'>
                {specialButtons}
            </div>
            <div className='numpad__rows-wrapper'>
                {
                    rows.map((row, i) => (
                        <div key={i} className='numpad__button-row' style={{ gridArea: `row${i + 1}` }}>
                            {rows[i]}
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
