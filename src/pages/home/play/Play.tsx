import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import GameHandler from "../../../utils/GameHandler";
import './play.css';
import Canvas from "../../../components/CanvasComponent";
import Board from '../../../utils/Board';
import { AccentColorContext } from '../../../utils/hooks/useAccentColor';
import { GameModeDefinitions } from '../../../game/Definitions';
import { GameModeName, gameModeOrder } from '../../../game/types';

type Props = {
    requestNewGame: (newGame: Board) => void;
};

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

    useEffect(() => {
        gameModeOrder.forEach(gameMode => {
            GameModeDefinitions[gameMode].homeScreenCanvas.accentColor = accentColor;
        });
    }, [accentColor]);

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
                    {
                        gameModeOrder.map((gameMode, i) => (
                            <div key={gameMode} className='home__carousel__item-wrapper'>
                                <div className={`home__gameMode ${snappedIndex === i ? 'snapped' : ''}`} onClick={() => { handleGameModeClick(gameMode, i); }}>
                                    <Canvas paused={false} canvasHandler={GameModeDefinitions[gameMode].homeScreenCanvas} />
                                    <div className='home__gameMode__name'>{t(`gameModes.${gameMode}`)}</div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className='home__carousel-dots'>
                    {
                        gameModeOrder.map((_, i) => (
                            <div key={i} className={`home__carousel-dots__dot ${snappedIndex === i ? 'selected' : ''}`}></div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
