import { useState, useRef, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faBookmark, faChartSimple, faPlay } from "@fortawesome/free-solid-svg-icons"
import GameHandler from "../../../utils/GameHandler"
import { ActionSheet, ActionSheetButton } from "../../../components"
import './play.css'
import Board from "../../../game/Board"
import { GameModeName } from "../../../utils/Difficulties"
import { ThemeName } from "../../../utils/DataTypes"
import { AccentColor } from "../../../utils/Colors"
import CommonCanvas from "../../../game/Canvas"
import SVGSettings from "../../../svg/settings"
import { rulesets } from "../../../game/gameModes/Rulesets"

type Props = {
    theme: ThemeName
    accentColor: AccentColor
}

export default function Play({ theme, accentColor }: Props) {
    const [newGameMode, setNewGameMode] = useState<GameModeName>()
    const [snappedIndex, setSnappedIndex] = useState(2)


    const [discardGameActionSheetIsOpen, setDiscardGameActionSheetIsOpen] = useState(false)

    const carouselRef = useRef<HTMLDivElement>(null)
    let navigate = useNavigate()

    const { t } = useTranslation()

    let classicMiniature = new Board({ id: 'cu0', m: '1.3:4.8.' }, 3)
    classicMiniature.setValue([{ x: 1, y: 0 }], 2)
    classicMiniature.setValue([{ x: 0, y: 1 }], 6)
    classicMiniature.setValue([{ x: 0, y: 2 }], 7)
    classicMiniature.setValue([{ x: 2, y: 2 }], 9)

    let killerMiniature = new Board({ id: 'ku0', m: '1.3:4.8. 123654789 0010,2021,0102,11,1222' }, 3)
    killerMiniature.setValue([{ x: 1, y: 0 }], 2)
    killerMiniature.setValue([{ x: 0, y: 1 }], 6)
    killerMiniature.setValue([{ x: 0, y: 2 }], 7)
    killerMiniature.setValue([{ x: 2, y: 2 }], 9)

    const handleNewGame = useCallback((mode: GameModeName) => {
        GameHandler.newGame(mode, GameHandler.recommendations.perMode[mode])
        navigate('/sudoku')
    }, [navigate])

    const openNewGameActionSheet = useCallback((mode: GameModeName) => {
        setNewGameMode(mode)
        if (GameHandler.game === null || GameHandler.complete) handleNewGame(mode)
        else setDiscardGameActionSheetIsOpen(true)
    }, [handleNewGame])

    const handleScroll = useCallback(() => {
        if (!carouselRef.current) return
        const carousel = carouselRef.current
        const items = carousel.querySelectorAll('.home__gameMode')
        const carouselRect = carousel.getBoundingClientRect()
        const carouselCenter = carouselRect.left + carouselRect.width / 2

        let closestIndex = 0
        let closestDistance = Infinity

        items.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect()
            const itemCenter = itemRect.left + itemRect.width / 2
            const distance = Math.abs(carouselCenter - itemCenter)

            if (distance < closestDistance) {
                closestDistance = distance
                closestIndex = index
            }
        })

        setSnappedIndex(closestIndex)
    }, [])

    const handleGameModeClick = useCallback((mode: GameModeName, index: number) => {
        if (!carouselRef.current) return
        const carousel = carouselRef.current
        const items = carousel.querySelectorAll('.home__gameMode')
        const carouselRect = carousel.getBoundingClientRect()
        const carouselCenter = carouselRect.left + carouselRect.width / 2


        const itemRect = items[index].getBoundingClientRect()
        const itemCenter = itemRect.left + itemRect.width / 2

        carouselRef.current.scrollLeft += itemCenter - carouselCenter

        openNewGameActionSheet(mode)
        setSnappedIndex(index)
    }, [openNewGameActionSheet])

    useEffect(() => {
        if (carouselRef.current) {
            const carousel = carouselRef.current

            // Calculate the initial scroll position to center the first item
            const initialScrollPosition = (carousel.scrollWidth - carousel.clientWidth) / 2
            carousel.scrollLeft = initialScrollPosition

            carousel.addEventListener('scroll', handleScroll)

            return () => {
                carousel.removeEventListener('scroll', handleScroll)
            }
        }
    }, [handleScroll])

    return (
        <div className='home__play'>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto fit-content(0)', paddingRight: '10px' }}>
                <p className='home__section-title'>{t('home.play')}</p>
                <Link to='/settings'><SVGSettings className='home__play__settings' /></Link>
            </div>
            <div className='home__carousel-wrapper'>
                <div ref={carouselRef} className='home__carousel'>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 0 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('sandwich', 0) }}>
                            <CommonCanvas notPlayable boxBorderWidthFactor={0} game={classicMiniature} theme="light" accentColor={accentColor} ruleset={rulesets.classic} />
                            <div className='home__gameMode__name'>{t('gameModes.sandwich')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 1 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('sudokuX', 1) }}>
                            <CommonCanvas notPlayable boxBorderWidthFactor={0} game={classicMiniature} theme="light" accentColor={accentColor} ruleset={rulesets.sudokuX} />
                            <div className='home__gameMode__name'>{t('gameModes.sudokuX')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 2 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('classic', 2) }}>
                            <CommonCanvas notPlayable boxBorderWidthFactor={0} game={classicMiniature} theme="light" accentColor={accentColor} ruleset={rulesets.classic} />
                            <div className='home__gameMode__name'>{t('gameModes.classic')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 3 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('killer', 3) }}>
                            <CommonCanvas notPlayable boxBorderWidthFactor={0} game={killerMiniature} theme="light" accentColor={accentColor} ruleset={rulesets.killer} />
                            <div className='home__gameMode__name'>{t('gameModes.killer')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 4 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('thermo', 4) }}>
                            <CommonCanvas notPlayable boxBorderWidthFactor={0} game={classicMiniature} theme="light" accentColor={accentColor} ruleset={rulesets.classic} />
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
                    </> : <div></div>
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

            <ActionSheet isOpen={discardGameActionSheetIsOpen} title={t('common.discardGame')} cancelTitle={t('common.cancel')} cancelColor='var(--darkBlue)' onClose={() => setDiscardGameActionSheetIsOpen(false)} buttonsMode>
                <ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { if (newGameMode) handleNewGame(newGameMode) }} />
            </ActionSheet>
        </div>
    )
}
