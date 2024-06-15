import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faBookmark, faChartSimple, faPlay } from "@fortawesome/free-solid-svg-icons";
import Board from "../../../utils/Board";
import GameHandler from "../../../utils/GameHandler";
import { Canvas, ActionSheet, ActionSheetButton } from "../../../components";
import './play.css';

export default function Play({ theme, accentColor }) {
    const [newGameMode, setNewGameMode] = useState(null);
    const [snappedIndex, setSnappedIndex] = useState(2);

    const discardGameActionSheetRef = useRef();
    const carouselRef = useRef(null);
    let navigate = useNavigate()

    const { t } = useTranslation()

    let classicMiniature = new Board({ id: 'ce0', m: '1.3:4.8.' }, true, 3)
    classicMiniature.setValue({ x: 1, y: 0 }, 2)
    classicMiniature.setValue({ x: 0, y: 1 }, 6)
    classicMiniature.setValue({ x: 0, y: 2 }, 7)
    classicMiniature.setValue({ x: 2, y: 2 }, 9)

    let killerMiniature = new Board({ id: 'ke0', m: '1.3:4.8.', s: '123654789', c: '0010,2021,0102,11,1222' }, true, 3)
    killerMiniature.setValue({ x: 1, y: 0 }, 2)
    killerMiniature.setValue({ x: 0, y: 1 }, 6)
    killerMiniature.setValue({ x: 0, y: 2 }, 7)
    killerMiniature.setValue({ x: 2, y: 2 }, 9)

    function openNewGameActionSheet(mode) {
        setNewGameMode(mode)
        if (GameHandler.game === null || GameHandler.complete) handleNewGame(mode)
        else discardGameActionSheetRef.current.open()
    }

    function handleNewGame(mode) {
        GameHandler.newGame(mode, GameHandler.recommendations.perMode[mode])
        navigate('/sudoku')
    }

    const handleScroll = () => {
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
    };

    useEffect(() => {
        const carousel = carouselRef.current;

        // Calculate the initial scroll position to center the first item
        const initialScrollPosition = (carousel.scrollWidth - carousel.clientWidth) / 2;
        carousel.scrollLeft = initialScrollPosition;

        carousel.addEventListener('scroll', handleScroll);

        return () => {
            carousel.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className='home__play'>
            <p className='home__section-title'>{t('home.play')}</p>
            <div className='home__carousel-wrapper'>
                <div ref={carouselRef} className='home__carousel'>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 0 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('sandwich') }}>
                            <Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
                            <div className='home__gameMode__name'>{t('gameModes.sandwich')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 1 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('sudokux') }}>
                            <Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
                            <div className='home__gameMode__name'>{t('gameModes.sudokuX')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 2 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('classic') }}>
                            <Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
                            <div className='home__gameMode__name'>{t('gameModes.classic')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 3 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('killer') }}>
                            <Canvas noTouch boxBorderWidthFactor={0} game={killerMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
                            <div className='home__gameMode__name'>{t('gameModes.killer')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 4 ? 'snapped' : ''}`} onClick={() => { openNewGameActionSheet('thermo') }}>
                            <Canvas noTouch boxBorderWidthFactor={0} game={classicMiniature} nSquares={3} showSelectedCell={false} theme="light" accentColor={accentColor} />
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


            {
                GameHandler.game && !GameHandler.complete ?
                    <>
                        <Link to="/sudoku">
                            {/*<div className="home__continue-wrapper">
                                <div className='home__continue'>
                                    <div className='home__continue__timer'>
                                        <FontAwesomeIcon className='home__continue__timer__icon' icon={faClock} />
                                        <p className='home__continue__timer__time'>{millisecondsToHMS(GameHandler.game.timer)}</p>
                                    </div>
                                    <div className='home__continue__inner'>
                                        <p className='home__continue__gameMode'>{t(`gameModes.${GameHandler.game.mode}`)}</p>
                                        <p className='home__continue__difficulty'>{t(`gameDifficulties.${GameHandler.game.difficulty}`)}</p>
                                        <p className='home__continue__button'>
                                            {t('home.continue')}
                                            <FontAwesomeIcon className='home__continue__icon' icon={faChevronRight} />
                                        </p>
                                    </div>
                                </div>
                            </div>*/}
                            <div className='home__continue'>
                                <p>{t('home.continue')}</p>
                                <FontAwesomeIcon className='home__continue__icon' icon={faChevronRight} />
                            </div>
                        </Link>
                    </> : null
            }

            <div className='home__tabSwitcher-wrapper'>
                <div className='home__tabSwitcher'>
                    <Link to="/home">
                        <div className='home__tabSwitcher__tab selected'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faPlay} />
                        </div>
                    </Link>
                    <Link to="/home/bookmarks">
                        <div className='home__tabSwitcher__tab'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faBookmark} />
                        </div>
                    </Link>
                    <Link to="/home/statistics">
                        <div className='home__tabSwitcher__tab'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faChartSimple} />
                        </div>
                    </Link>
                </div>
            </div>

            <ActionSheet reference={discardGameActionSheetRef} title={t('common.discardGame')} cancelTitle={t('common.cancel')} cancelColor='var(--darkBlue)'>
                <ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { handleNewGame(newGameMode) }} />
            </ActionSheet>
        </div>
    );
}
