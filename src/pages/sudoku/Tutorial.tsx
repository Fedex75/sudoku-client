import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './tutorial.css';
import { Button } from '../../components';
import CanvasComponent from '../../components/CanvasComponent';
import { CanvasFactory } from '../../game/gameModes/CanvasFactory';
import { AccentColorContext } from '../../utils/hooks/useAccentColor';
import { ThemeContext } from '../../utils/hooks/useTheme';
import { GameModeDefinitions } from '../../game/Definitions';
import { GameModeName } from '../../game/types';

interface TutorialProps {
    gameMode: GameModeName;
    quitTutorial: () => void;
}

export function Tutorial({ gameMode, quitTutorial }: TutorialProps) {
    const { theme } = useContext(ThemeContext);
    const { accentColor } = useContext(AccentColorContext);
    const [step, setStep] = useState(0);
    const canvasHandlerRef = useRef(CanvasFactory(gameMode, accentColor, true, 0.01));

    const { t } = useTranslation();

    const tutorial = useMemo(() => {
        return GameModeDefinitions[gameMode].tutorial[step];
    }, [gameMode, step]);

    useEffect(() => {
        if (tutorial) canvasHandlerRef.current.game = tutorial.board;
    }, [tutorial]);

    useEffect(() => {
        if (tutorial) canvasHandlerRef.current.theme = theme;
    }, [tutorial, theme]);

    if (tutorial === null) return null;

    return (
        <div className='game'>
            <div className='sudoku'>
                <CanvasComponent canvasHandler={canvasHandlerRef.current} paused={false} />
            </div>
            <div className='tutorial'>
                <div className='tutorial__controls'>
                    <FontAwesomeIcon icon={faChevronLeft} style={{ visibility: step > 0 ? 'visible' : 'hidden' }} className='tutorial__controls__icon' onClick={() => { if (step > 0) setStep(s => s - 1); }} />
                    <p className='tutorial__controls__step-number'>{`${step + 1}/${GameModeDefinitions[gameMode].tutorial.length}`}</p>
                    <FontAwesomeIcon icon={faChevronRight} style={{ visibility: step < GameModeDefinitions[gameMode].tutorial.length - 1 ? 'visible' : 'hidden' }} className='tutorial__controls__icon' onClick={() => { if (step < GameModeDefinitions[gameMode].tutorial.length - 1) setStep(s => s + 1); }} />
                </div>
                <p className='tutorial__text'>{t(tutorial.text)}</p>
                <Button title={t('tutorial.exit')} onClick={quitTutorial} />
            </div>
        </div>
    );
}
