import './sudoku.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Section, SectionContent, Topbar, ActionSheet, ActionSheetButton } from '../../components'
import GameHandler from '../../utils/GameHandler'
import { DifficultyName, difficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark as bookmarkSolid, faInfoCircle, faPlusSquare, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as bookmarkRegular } from '@fortawesome/free-regular-svg-icons'
import { useTranslation } from 'react-i18next'
import SVGMenu from '../../svg/menu'
import SVGRestart from '../../svg/restart'
import Game from '../../game/Game'
import { WinScreen } from './WinScreen'
import { Tutorial } from './Tutorial'
import Timer, { TimerRef } from '../../components/timer/Timer'
import { BOARD_WIN_ANIMATION_DURATION_MS, GAME_SLIDE_ANIMATION_DURATION_SECONDS } from '../../utils/Constants'
import { motion } from 'framer-motion'

type Props = {
    requestGoBack: () => void
}

export default function Sudoku({ requestGoBack }: Props) {
    const [win, setWin] = useState(false)
    const [tutorialIsOpen, setTutorialIsOpen] = useState(false)

    const [bookmark, setBookmark] = useState(GameHandler.currentGameIsBookmarked())
    const [menuActionSheetIsOpen, setMenuActionSheetIsOpen] = useState(false)
    const [exportActionSheetIsOpen, setExportActionSheetIsOpen] = useState(false)
    const [winActionSheetIsOpen, setWinActionSheetIsOpen] = useState(false)

    const navigate = useNavigate()

    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [paused, setPaused] = useState(true)

    const timerRef = useRef<TimerRef>(null)

    const { t } = useTranslation()

    const resumeGame = useCallback(() => {
        if (win) return
        setPaused(false)
        setIsTimerRunning(true)
    }, [win])

    const pauseGame = useCallback(() => {
        if (win) return
        setPaused(true)
        setIsTimerRunning(false)
    }, [win])

    const resetTimer = useCallback(() => {
        resumeGame()
        timerRef.current?.resetTimer()
    }, [resumeGame])

    const handleComplete = useCallback(() => {
        setIsTimerRunning(false)
        setTimeout(() => {
            setWin(true)
            setWinActionSheetIsOpen(true)
        }, BOARD_WIN_ANIMATION_DURATION_MS)
    }, [])

    const openMenuActionSheet = useCallback(() => {
        setMenuActionSheetIsOpen(true)
        pauseGame()
    }, [pauseGame])

    const closeMenuActionSheet = useCallback(() => {
        setMenuActionSheetIsOpen(false)
        resumeGame()
    }, [resumeGame])

    const handleNewGame = useCallback((difficulty: DifficultyName | 'restart') => {
        if (!GameHandler.game) return
        if (difficulty === 'restart') {
            GameHandler.game.restart()
        } else {
            const newGame = GameHandler.createNewGame(GameHandler.game.mode, difficulty)
            if (!newGame) return
            GameHandler.setCurrentGame(newGame)
        }

        setWin(false)
        resumeGame()
        setBookmark(GameHandler.currentGameIsBookmarked())

        resetTimer()

        setMenuActionSheetIsOpen(false)
        setExportActionSheetIsOpen(false)
    }, [resetTimer, resumeGame])

    const handleNewGameClick = useCallback(() => {
        if (!GameHandler.game) return

        if (GameHandler.game.difficulty === 'unrated') {
            openMenuActionSheet()
            setExportActionSheetIsOpen(false)
        }
        else handleNewGame(GameHandler.game.difficulty)
    }, [handleNewGame, openMenuActionSheet])

    const topbarMenuClick = useCallback(() => {
        openMenuActionSheet()
    }, [openMenuActionSheet])

    const menuShareClick = useCallback(() => {
        setMenuActionSheetIsOpen(false)
        setExportActionSheetIsOpen(true)
    }, [])

    const menuBookmarkClick = useCallback(() => {
        if (!GameHandler.game) return

        if (bookmark) {
            setBookmark(false)
            GameHandler.removeBookmark({
                id: GameHandler.game.id,
                m: GameHandler.game.mission
            })
        } else {
            setBookmark(true)
            GameHandler.bookmarkCurrentGame()
        }

        setMenuActionSheetIsOpen(false)
    }, [bookmark])

    const handleTimerClick = useCallback(() => {
        if (win) return

        if (paused) resumeGame()
        else pauseGame()
    }, [win, pauseGame, paused, resumeGame])

    const handleMenuTutorialClick = useCallback(() => {
        GameHandler.saveGame()
        setTutorialIsOpen(t => !t)
        setMenuActionSheetIsOpen(false)
    }, [])

    const handleQuitTutorial = useCallback(() => {
        setTutorialIsOpen(false)
        resumeGame()
    }, [resumeGame])

    const handleFullNotation = useCallback(() => {
        timerRef.current?.showMessage(t('sudoku.timerFullNotation'), 2000)
    }, [t])

    const handleAnimationFinished = useCallback(() => {
        resumeGame()
    }, [resumeGame])

    useEffect(() => {
        if (GameHandler.game === null) {
            navigate('/')
            return
        }

        const windowVisibilityChangeEvent = () => {
            if (document.visibilityState === 'visible') {
                if (!paused) setIsTimerRunning(true)
            } else {
                if (GameHandler.game && !GameHandler.game.complete) GameHandler.saveGame()
                setIsTimerRunning(false)
            }
        }

        window.addEventListener('visibilitychange', windowVisibilityChangeEvent)

        return () => {
            window.removeEventListener('visibilitychange', windowVisibilityChangeEvent)
            GameHandler.saveGame()
        }
    }, [navigate, paused, pauseGame, resumeGame])

    if (GameHandler.game === null) return null

    return (
        <>
            <motion.div
                key='sudoku-wrapper'
                initial={{ top: '100vh' }}
                animate={{ top: 0 }}
                exit={{ top: '100vh', transition: { duration: GAME_SLIDE_ANIMATION_DURATION_SECONDS, ease: 'linear' } }}
                transition={{ duration: GAME_SLIDE_ANIMATION_DURATION_SECONDS, ease: 'linear' }}
                className='home__sudoku-wrapper'
                onAnimationComplete={handleAnimationFinished}
            >
                <Section>
                    <Topbar
                        title={t(`gameModes.${GameHandler.game.mode}`)}
                        subtitle={tutorialIsOpen ? t('tutorial.tutorial') : t(`gameDifficulties.${GameHandler.game.difficulty}`)}
                        onBack={requestGoBack}
                        backIcon={<FontAwesomeIcon icon={faChevronDown} style={{ color: 'var(--themeColor)', fontSize: 24 }} />}
                        buttons={[
                            !tutorialIsOpen && <div key={0} style={{ display: 'grid', placeItems: 'center', width: 44, height: 44 }} onClick={topbarMenuClick}><SVGMenu className='sudoku__open-menu-button' strokeTop='var(--primaryIconColor)' strokeBottom='var(--secondaryIconColor)' /></div>
                        ]}
                        onTitleClick={() => { if (!tutorialIsOpen) openMenuActionSheet() }}
                    >
                        {!tutorialIsOpen && <Timer ref={timerRef} isTimerRunning={isTimerRunning} paused={paused} win={win} onClick={handleTimerClick} />}
                    </Topbar>

                    <SectionContent id='sudoku'>
                        {
                            tutorialIsOpen ? <Tutorial gameMode={GameHandler.game.mode} quitTutorial={handleQuitTutorial} /> :
                                <Game paused={paused} handleComplete={handleComplete} game={GameHandler.game} handleFullNotation={handleFullNotation} />
                        }
                    </SectionContent>
                </Section>
            </motion.div>

            <ActionSheet
                isOpen={menuActionSheetIsOpen}
                onClose={() => closeMenuActionSheet()}
            >
                <div className='sudoku__context-menu'>
                    <div className='context-menu__button vertical' style={{ gridArea: 'save' }} onClick={menuBookmarkClick}>
                        <FontAwesomeIcon icon={bookmark ? bookmarkSolid : bookmarkRegular} fontSize={24} />
                        <p>{t('common.save')}</p>
                    </div>
                    <div className='context-menu__button vertical' style={{ gridArea: 'share' }} onClick={menuShareClick}>
                        <FontAwesomeIcon icon={faArrowUpFromBracket} fontSize={24} />
                        <p>{t('common.share')}</p>
                    </div>
                    <div className='context-menu__button' style={{ gridArea: 'rules', marginTop: 25, marginBottom: 25 }} onClick={handleMenuTutorialClick}>
                        <FontAwesomeIcon icon={faInfoCircle} fontSize={24} />
                        <p>{t('sudoku.howToPlay')}</p>
                    </div>
                    <div className='sudoku__context-menu__buttons' style={{ gridArea: 'buttons' }}>
                        {
                            difficulties[GameHandler.game.mode].map(diff => (
                                <div key={diff} className='context-menu__button' onClick={() => handleNewGame(diff)}>
                                    <FontAwesomeIcon icon={faPlusSquare} fontSize={24} />
                                    <p>{t(`gameDifficulties.${diff}`)}</p>
                                </div>
                            ))
                        }
                        <div className='context-menu__button' style={{ color: 'white', backgroundColor: 'var(--red)' }} onClick={() => { handleNewGame('restart') }}>
                            <SVGRestart className='sudoku__restart-icon' stroke='white' />
                            <p>{t('gameDifficulties.restart')}</p>
                        </div>
                    </div>
                </div>
            </ActionSheet>

            <ActionSheet
                isOpen={exportActionSheetIsOpen}
                cancelTitle={t('common.cancel')}
                onClose={() => setExportActionSheetIsOpen(false)}
                buttonsMode
                title={t('common.share')}
            >
                <ActionSheetButton title={t('sudoku.copyClues')} onClick={() => {
                    try {
                        if (GameHandler.game) copy(GameHandler.game.getTextRepresentation(true))
                        setExportActionSheetIsOpen(false)
                    } catch (e) {
                        alert(t('sudoku.exportError'))
                    }
                }} />
                <ActionSheetButton title={t('sudoku.copyFullBoard')} onClick={() => {
                    try {
                        if (GameHandler.game) copy(GameHandler.game.getTextRepresentation(false))
                        setExportActionSheetIsOpen(false)
                    } catch (e) {
                        alert(t('sudoku.exportError'))
                    }
                }} />
                {
                    GameHandler.game.difficulty !== 'unrated' ?
                        <ActionSheetButton title={t('sudoku.copyMission')} onClick={() => {
                            try {
                                if (GameHandler.game) copy(GameHandler.exportMission())
                                setExportActionSheetIsOpen(false)
                            } catch (e) {
                                alert(t('sudoku.exportError'))
                            }
                        }} /> : null
                }
            </ActionSheet>

            <ActionSheet
                isOpen={winActionSheetIsOpen}
                showBackButton
                backTitle={t('sudoku.goHome')}
                backURL='/home'
                onBack={() => {
                    setWinActionSheetIsOpen(false)
                    requestGoBack()
                }}
                onClose={() => setWinActionSheetIsOpen(false)}
            >
                <WinScreen handleNewGameClick={handleNewGameClick} handleNewGame={handleNewGame} game={GameHandler.game} />
            </ActionSheet>
        </>
    )
}
