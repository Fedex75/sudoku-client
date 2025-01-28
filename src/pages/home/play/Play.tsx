import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronRight, faBookmark, faChartSimple, faPlay } from "@fortawesome/free-solid-svg-icons"
import GameHandler from "../../../utils/GameHandler"
import { ActionSheet, ActionSheetButton } from "../../../components"
import './play.css'
import { GameModeName } from "../../../utils/Difficulties"
import { AccentColor } from "../../../utils/Colors"
import Canvas from "../../../components/CanvasComponent"
import SVGSettings from "../../../svg/settings"
import { ThemeName } from '../../../game/Themes'
import { CanvasFactory } from '../../../game/gameModes/CanvasFactory'
import { BoardFactory } from '../../../game/gameModes/BoardFactory'

type Props = {
    theme: ThemeName
    accentColor: AccentColor
}

export default function Play({ theme, accentColor }: Props) {
    const [newGameMode, setNewGameMode] = useState<GameModeName>()
    const [snappedIndex, setSnappedIndex] = useState(2)

    const classicCanvasRef = useRef(CanvasFactory('classic', accentColor, true, 0))
    const killerCanvasRef = useRef(CanvasFactory('killer', accentColor, true, 0))
    const sudokuXCanvasRef = useRef(CanvasFactory('sudokuX', accentColor, true, 0))
    const sandwichCanvasRef = useRef(CanvasFactory('sandwich', accentColor, true, 0))
    const thermoCanvasRef = useRef(CanvasFactory('thermo', accentColor, true, 0))

    const [discardGameActionSheetIsOpen, setDiscardGameActionSheetIsOpen] = useState(false)

    const carouselRef = useRef<HTMLDivElement>(null)
    let navigate = useNavigate()

    const { t } = useTranslation()

    const classicBoard = useMemo(() => {
        const newClassicBoard = BoardFactory('classic', { id: 'cu0', mission: '3 1.3:4.8.' })
        newClassicBoard.get({ x: 1, y: 0 })!.value = 2
        newClassicBoard.get({ x: 0, y: 1 })!.value = 6
        newClassicBoard.get({ x: 0, y: 2 })!.value = 7
        newClassicBoard.get({ x: 2, y: 2 })!.value = 9
        return newClassicBoard
    }, [])

    const killerBoard = useMemo(() => {
        const newKillerBoard = BoardFactory('killer', { id: 'ku0', mission: '3 1.3:4.8. 123654789 0010,2021,0102,11,1222' })
        newKillerBoard.get({ x: 1, y: 0 })!.value = 2
        newKillerBoard.get({ x: 0, y: 1 })!.value = 6
        newKillerBoard.get({ x: 0, y: 2 })!.value = 7
        newKillerBoard.get({ x: 2, y: 2 })!.value = 9
        return newKillerBoard
    }, [])

    const sudokuXBoard = useMemo(() => {
        const newSudokuXBoard = BoardFactory('sudokuX', { id: 'wu0', mission: '3 1.3:4.8. 35,9,3 13,30,11' })
        newSudokuXBoard.get({ x: 1, y: 0 })!.value = 2
        newSudokuXBoard.get({ x: 0, y: 1 })!.value = 6
        newSudokuXBoard.get({ x: 0, y: 2 })!.value = 7
        newSudokuXBoard.get({ x: 2, y: 2 })!.value = 9
        return newSudokuXBoard
    }, [])

    const sandwichBoard = useMemo(() => {
        const newSandwichBoard = BoardFactory('sandwich', { id: 'wu0', mission: '3 1.3:4.8. 123456789 35,9,3 13,30,11' })
        newSandwichBoard.get({ x: 1, y: 0 })!.value = 2
        newSandwichBoard.get({ x: 0, y: 1 })!.value = 6
        newSandwichBoard.get({ x: 0, y: 2 })!.value = 7
        newSandwichBoard.get({ x: 2, y: 2 })!.value = 9
        return newSandwichBoard
    }, [])

    const thermoBoard = useMemo(() => {
        const newThermoBoard = BoardFactory('thermo', { id: 'tu0', mission: '3 1.3:4.8. 0,1,2,5;3,6,7,8' })
        newThermoBoard.get({ x: 1, y: 0 })!.value = 2
        newThermoBoard.get({ x: 0, y: 1 })!.value = 6
        newThermoBoard.get({ x: 0, y: 2 })!.value = 7
        newThermoBoard.get({ x: 2, y: 2 })!.value = 9
        return newThermoBoard
    }, [])

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
        classicCanvasRef.current.game = classicBoard
        classicCanvasRef.current.theme = 'light'
        killerCanvasRef.current.game = killerBoard
        killerCanvasRef.current.theme = 'light'
        sudokuXCanvasRef.current.game = sudokuXBoard
        sudokuXCanvasRef.current.theme = 'light'
        sandwichCanvasRef.current.game = sandwichBoard
        sandwichCanvasRef.current.theme = 'light'
        thermoCanvasRef.current.game = thermoBoard
        thermoCanvasRef.current.theme = 'light'
    }, [classicBoard, killerBoard, sudokuXBoard, sandwichBoard, thermoBoard])

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
                            <Canvas paused={false} canvasHandler={sandwichCanvasRef.current} />
                            <div className='home__gameMode__name'>{t('gameModes.sandwich')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 1 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('sudokuX', 1) }}>
                            <Canvas paused={false} canvasHandler={sudokuXCanvasRef.current} />
                            <div className='home__gameMode__name'>{t('gameModes.sudokuX')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 2 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('classic', 2) }}>
                            <Canvas paused={false} canvasHandler={classicCanvasRef.current} />
                            <div className='home__gameMode__name'>{t('gameModes.classic')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 3 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('killer', 3) }}>
                            <Canvas paused={false} canvasHandler={killerCanvasRef.current} />
                            <div className='home__gameMode__name'>{t('gameModes.killer')}</div>
                        </div>
                    </div>
                    <div className='home__carousel__item-wrapper'>
                        <div className={`home__gameMode ${snappedIndex === 4 ? 'snapped' : ''}`} onClick={() => { handleGameModeClick('thermo', 4) }}>
                            <Canvas paused={false} canvasHandler={thermoCanvasRef.current} />
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
