import { useState, useRef, useEffect, useCallback, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import GameHandler from "../../../utils/GameHandler";
import './play.css';
import { GameModeName } from "../../../utils/Difficulties";
import Canvas from "../../../components/CanvasComponent";
import { CanvasFactory } from '../../../game/gameModes/CanvasFactory';
import { BoardFactory } from '../../../game/gameModes/BoardFactory';
import Board from '../../../utils/Board';
import { AccentColorContext } from '../../../utils/hooks/useAccentColor';

type Props = {
    requestNewGame: (newGame: Board) => void;
};

const gameModeOrder: GameModeName[] = ['sandwich', 'sudokuX', 'classic', 'killer', 'thermo'];

export default function Play({ requestNewGame }: Props) {
    const { accentColor } = useContext(AccentColorContext);
    let initialSnappedIndex = 2;
    if (GameHandler.game && !GameHandler.game.complete) {
        initialSnappedIndex = gameModeOrder.indexOf(GameHandler.game.mode);
    } else {
        initialSnappedIndex = gameModeOrder.indexOf(GameHandler.recommendations.newGame.mode);
    }
    const [snappedIndex, setSnappedIndex] = useState(initialSnappedIndex);

    const carouselRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation();

    const classicCanvas = useMemo(() => {
        const newClassicBoard = BoardFactory('classic', { id: 'cu0', mission: '3 1.3:4.8.' });
        newClassicBoard.get({ x: 1, y: 0 })!.value = 2;
        newClassicBoard.get({ x: 0, y: 1 })!.value = 6;
        newClassicBoard.get({ x: 0, y: 2 })!.value = 7;
        newClassicBoard.get({ x: 2, y: 2 })!.value = 9;
        const canvas = CanvasFactory('classic', 'darkBlue', true, 0);
        canvas.game = newClassicBoard;
        canvas.theme = 'light';
        return canvas;
    }, []);

    const killerCanvas = useMemo(() => {
        const newKillerBoard = BoardFactory('killer', { id: 'ku0', mission: '3 1.3:4.8. 123654789 0010,2021,0102,11,1222' });
        newKillerBoard.get({ x: 1, y: 0 })!.value = 2;
        newKillerBoard.get({ x: 0, y: 1 })!.value = 6;
        newKillerBoard.get({ x: 0, y: 2 })!.value = 7;
        newKillerBoard.get({ x: 2, y: 2 })!.value = 9;
        const canvas = CanvasFactory('killer', 'darkBlue', true, 0);
        canvas.game = newKillerBoard;
        canvas.theme = 'light';
        return canvas;
    }, []);

    const sudokuXCanvas = useMemo(() => {
        const newSudokuXBoard = BoardFactory('sudokuX', { id: 'wu0', mission: '3 1.3:4.8. 123654789' });
        newSudokuXBoard.get({ x: 1, y: 0 })!.value = 2;
        newSudokuXBoard.get({ x: 0, y: 1 })!.value = 6;
        newSudokuXBoard.get({ x: 0, y: 2 })!.value = 7;
        newSudokuXBoard.get({ x: 2, y: 2 })!.value = 9;
        const canvas = CanvasFactory('sudokuX', 'darkBlue', true, 0);
        canvas.game = newSudokuXBoard;
        canvas.theme = 'light';
        return canvas;
    }, []);

    const sandwichCanvas = useMemo(() => {
        const newSandwichBoard = BoardFactory('sandwich', { id: 'wu0', mission: '3 1.3:4.8. 123654789 35,9,3 13,30,11' });
        newSandwichBoard.get({ x: 1, y: 0 })!.value = 2;
        newSandwichBoard.get({ x: 0, y: 1 })!.value = 6;
        newSandwichBoard.get({ x: 0, y: 2 })!.value = 7;
        newSandwichBoard.get({ x: 2, y: 2 })!.value = 9;
        const canvas = CanvasFactory('sandwich', 'darkBlue', true, 0);
        canvas.game = newSandwichBoard;
        canvas.theme = 'light';
        return canvas;
    }, []);

    const thermoCanvas = useMemo(() => {
        const newThermoBoard = BoardFactory('thermo', { id: 'tu0', mission: '3 1.3:4.8. 123654789 0,1,2,5;3,6,7,8' });
        newThermoBoard.get({ x: 1, y: 0 })!.value = 2;
        newThermoBoard.get({ x: 0, y: 1 })!.value = 6;
        newThermoBoard.get({ x: 0, y: 2 })!.value = 7;
        newThermoBoard.get({ x: 2, y: 2 })!.value = 9;
        const canvas = CanvasFactory('thermo', 'darkBlue', true, 0);
        canvas.game = newThermoBoard;
        canvas.theme = 'light';
        return canvas;
    }, []);

    useEffect(() => {
        classicCanvas.accentColor = accentColor;
        killerCanvas.accentColor = accentColor;
        sudokuXCanvas.accentColor = accentColor;
        sandwichCanvas.accentColor = accentColor;
        thermoCanvas.accentColor = accentColor;
    }, [accentColor, classicCanvas, killerCanvas, sudokuXCanvas, sandwichCanvas, thermoCanvas]);

    function scrollToIndex(index: number) {
        if (!carouselRef.current) return;
        const carousel = carouselRef.current;
        const items = carousel.querySelectorAll('.home__gameMode');
        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;


        const itemRect = items[index].getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;

        carouselRef.current.scrollLeft += itemCenter - carouselCenter;
    }


    const handleScroll = useCallback(() => {
        if (!carouselRef.current) return;
        const carousel = carouselRef.current;
        const items = carousel.querySelectorAll('.home__gameMode');
        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        items.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + itemRect.width / 2;
            const distance = Math.abs(carouselCenter - itemCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        setSnappedIndex(closestIndex);
    }, []);

    const handleGameModeClick = useCallback((mode: GameModeName, index: number) => {
        const newGame = GameHandler.createNewGame(mode);
        if (newGame) requestNewGame(newGame);

        scrollToIndex(index);
        setSnappedIndex(index);
    }, [requestNewGame]);

    useEffect(() => {
        if (carouselRef.current) {
            const carousel = carouselRef.current;

            scrollToIndex(initialSnappedIndex);

            carousel.addEventListener('scroll', handleScroll);

            return () => {
                carousel.removeEventListener('scroll', handleScroll);
            };
        }
    }, [handleScroll, initialSnappedIndex]);

    return (
        <div className='home__play'>
            <div className='home__section__title-wrapper'>
                <p className='home__section-title'>{t('sectionNames.play')}</p>
            </div>
            <div className='home__carousel-wrapper'>
                <div ref={carouselRef} className='home__carousel'>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 0 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('sandwich', 0); }}>
                            <Canvas paused={false} canvasHandler={sandwichCanvas} />
                            <div className='home__gameMode__name'>{t('gameModes.sandwich')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 1 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('sudokuX', 1); }}>
                            <Canvas paused={false} canvasHandler={sudokuXCanvas} />
                            <div className='home__gameMode__name'>{t('gameModes.sudokuX')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 2 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('classic', 2); }}>
                            <Canvas paused={false} canvasHandler={classicCanvas} />
                            <div className='home__gameMode__name'>{t('gameModes.classic')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 3 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('killer', 3); }}>
                            <Canvas paused={false} canvasHandler={killerCanvas} />
                            <div className='home__gameMode__name'>{t('gameModes.killer')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 4 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('thermo', 4); }}>
                            <Canvas paused={false} canvasHandler={thermoCanvas} />
                            <div className='home__gameMode__name'>{t('gameModes.thermo')}</div>
                        </div>
                    </div>
                </div>

                <div className='home__carousel-dots'>
                    <div className={`home__carousel-dots__dot ${snappedIndex === 0 ? 'selected' : ''}`}></div>
                    <div className={`home__carousel-dots__dot ${snappedIndex === 1 ? 'selected' : ''}`}></div>
                    <div className={`home__carousel-dots__dot ${snappedIndex === 2 ? 'selected' : ''}`}></div>
                    <div className={`home__carousel-dots__dot ${snappedIndex === 3 ? 'selected' : ''}`}></div>
                    <div className={`home__carousel-dots__dot ${snappedIndex === 4 ? 'selected' : ''}`}></div>
                </div>
            </div>
        </div>
    );
}
