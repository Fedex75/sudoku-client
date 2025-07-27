import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { forwardRef, useState, useImperativeHandle, useEffect } from 'react';
import GameHandler from '../../utils/GameHandler';
import { convertMillisecondsToHMS } from '../../utils/Statistics';

type TimerProps = {
    isTimerRunning: boolean;
    paused: boolean;
    win: boolean;
    onClick: () => void;
};

export type TimerRef = {
    resetTimer: () => void;
    showMessage: (text: string, duration: number) => void;
};

const Timer = forwardRef<TimerRef, TimerProps>(({ paused, isTimerRunning, win, onClick }, ref) => {
    const [time, setTime] = useState(GameHandler.game?.timer || 0);
    const [showingMessage, setShowingMessage] = useState(false);
    const [message, setMessage] = useState('');

    useImperativeHandle(ref, () => ({
        resetTimer() {
            setTime(0);
        },
        showMessage(text, duration) {
            setMessage(text);
            setShowingMessage(true);
            setTimeout(() => {
                setShowingMessage(false);
            }, duration);
        },
    }));

    useEffect(() => {
        let interval = null;

        if (isTimerRunning && !paused) {
            interval = setInterval(() => {
                setTime((time: number) => {
                    if (GameHandler.game) GameHandler.game.timer = time + 100;
                    return time + 100;
                });
            }, 100);
        } else {
            if (interval) clearInterval(interval);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [isTimerRunning, paused]);

    return (
        <div className='sudoku__timer' style={{ color: paused ? 'white' : 'var(--topbarFontColor)', backgroundColor: paused ? 'var(--red)' : 'var(--darkBackground)' }} onClick={() => { onClick(); }}>
            {(!win && !showingMessage) ? <FontAwesomeIcon icon={paused ? faPlay : faPause} fontSize={18} /> : null}
            {!showingMessage ? <p className='sudoku__timer__time'>{convertMillisecondsToHMS(time)}</p> : null}
            {showingMessage ? <p className='sudoku__timer__message'>{message}</p> : null}
        </div>
    );
});

export default Timer;
