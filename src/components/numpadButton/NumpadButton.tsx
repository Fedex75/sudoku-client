import React, { useCallback, useContext } from 'react';
import './numpadButton.css';
import useLongPress from '../../utils/hooks/useLongPress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { MouseButtonType } from '../../utils/DataTypes';
import ButtonCover from '../buttonCover/ButtonCover';
import { ColorName, Colors } from '../../utils/Colors';
import { themes } from '../../game/Themes';
import { ThemeContext } from '../../utils/hooks/useTheme';

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || ((navigator as any).msMaxTouchPoints > 0);

type Props = {
    onNumberClick: (number: number, type: MouseButtonType) => void;
    onColorClick: (color: ColorName | null, type: MouseButtonType) => void;
    colorMode: boolean;
    number: number;
    disabled: boolean;
    hidden: boolean;
    locked: boolean;
    animationDelay: number;
    color: ColorName | null;
};

export default function NunmpadButton({ onNumberClick, onColorClick, colorMode, number, disabled, hidden, locked, animationDelay, color }: Props): React.JSX.Element {
    const { theme } = useContext(ThemeContext);

    const handleClick = useCallback((type: MouseButtonType) => {
        if (colorMode) {
            onColorClick(color, type);
        } else {
            onNumberClick(number, type);
        }
    }, [color, colorMode, number, onColorClick, onNumberClick]);

    const [onTouchStart, onTouchEnd] = useLongPress((type: MouseButtonType) => {
        handleClick(type);
    }, 300);

    return (
        <div
            className={`numpad__button fade_in number ${disabled ? 'disabled' : ''} ${hidden ? 'hidden' : ''} ${!colorMode && locked ? 'locked' : ''}`}
            style={colorMode ? { backgroundColor: color ? Colors[color] : themes[theme].lightDefaultCellColor } : {}}
            onTouchStart={(e) => {
                e.stopPropagation();
                if (hidden) return;
                onTouchStart();
            }}
            onTouchEnd={(e) => {
                e.stopPropagation();
                if (hidden) return;
                onTouchEnd();
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (hidden || isTouchDevice) return;
                handleClick('primary');
            }}
            onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (hidden || isTouchDevice) return;
                handleClick('secondary');
            }}
        >
            {colorMode ? '' : number}
            {!colorMode && locked ? <FontAwesomeIcon icon={faLock} style={{ position: 'absolute', right: 3, bottom: 3, fontSize: 16 }} /> : null}
            <ButtonCover animationDelay={animationDelay} />
        </div>
    );
}
