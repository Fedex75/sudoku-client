import './sudoku.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Section, SectionContent, Topbar, ActionSheet, ActionSheetButton } from '../../components'
import GameHandler from '../../utils/GameHandler'
import { DifficultyName, difficulties } from '../../utils/Difficulties'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket, faBookmark as bookmarkSolid, faInfoCircle, faPlusSquare } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as bookmarkRegular } from '@fortawesome/free-regular-svg-icons'
import { useTranslation } from 'react-i18next'
import SVGMenu from '../../svg/menu'
import SVGRestart from '../../svg/restart'
import Game from '../../game/Game'
import { WinScreen } from './WinScreen'
import { Tutorial } from './Tutorial'
import Timer, { TimerRef } from '../../components/timer/Timer'

const BOARD_ANIMATION_DURATION = 1350

export default function Sudoku() {
    const [win, setWin] = useState(false)
    const [tutorialIsOpen, setTutorialIsOpen] = useState(false)

    const [bookmark, setBookmark] = useState(GameHandler.currentGameIsBookmarked())
    const [menuActionSheetIsOpen, setMenuActionSheetIsOpen] = useState(false)
    const [exportActionSheetIsOpen, setExportActionSheetIsOpen] = useState(false)

    const navigate = useNavigate()
    const [paused, setPaused] = useState(true)

    const timerRef = useRef<TimerRef>(null)

    const { t } = useTranslation()
    const hasDoneFadeInAnimation = useRef(false)

    const resetTimer = useCallback(() => {
        setPaused(false)
        timerRef.current?.resetTimer()
    }, [])

    const handleComplete = useCallback(() => {
        setTimeout(() => {
            setWin(true)
        }, BOARD_ANIMATION_DURATION)
    }, [])

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
        setBookmark(GameHandler.currentGameIsBookmarked())

        resetTimer()

        setMenuActionSheetIsOpen(false)
        setExportActionSheetIsOpen(false)
    }, [resetTimer])

    const handleNewGameClick = useCallback(() => {
        if (!GameHandler.game) return

        if (GameHandler.game.difficulty === 'unrated') {
            setMenuActionSheetIsOpen(true)
            setExportActionSheetIsOpen(false)
        }
        else handleNewGame(GameHandler.game.difficulty)
    }, [handleNewGame])

    const topbarMenuClick = useCallback(() => {
        setMenuActionSheetIsOpen(true)
        setExportActionSheetIsOpen(false)
        setPaused(true)
    }, [])

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

        setPaused(p => !p)
    }, [win])

    const handleMenuTutorialClick = useCallback(() => {
        GameHandler.saveGame()
        setTutorialIsOpen(t => !t)
        setMenuActionSheetIsOpen(false)
    }, [])

    const handleQuitTutorial = useCallback(() => {
        setTutorialIsOpen(false)
    }, [])

    const handleFullNotation = useCallback(() => {
        timerRef.current?.showMessage(t('sudoku.timerFullNotation'), 2000)
    }, [t])

    useEffect(() => {
        if (GameHandler.game === null) {
            navigate('/')
            return
        }

        const windowVisibilityChangeEvent = () => {
            if (GameHandler.game && !GameHandler.game.complete) GameHandler.saveGame()
            if (document.visibilityState === 'visible') {
                setPaused(true)
            } else {
                setPaused(false)
            }
        }

        window.addEventListener('visibilitychange', windowVisibilityChangeEvent)

        return () => {
            window.removeEventListener('visibilitychange', windowVisibilityChangeEvent)
            GameHandler.saveGame()
        }
    }, [navigate, paused])

    useEffect(() => {
        if (!menuActionSheetIsOpen) setPaused(false)
    }, [menuActionSheetIsOpen])

    useEffect(() => {
        setTimeout(() => {
            if (!hasDoneFadeInAnimation.current) {
                setPaused(false)
                hasDoneFadeInAnimation.current = true
            }
        }, Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gameSlideAnimationDuration')) * 1000)
    }, [])

    if (GameHandler.game === null) return null

    return (
        <Section>
            <Topbar
                title={t(`gameModes.${GameHandler.game.mode}`)}
                subtitle={tutorialIsOpen ? t('tutorial.tutorial') : t(`gameDifficulties.${GameHandler.game.difficulty}`)}
                backURL="/"
                buttons={[
                    !tutorialIsOpen && <div key={0} style={{ display: 'grid', placeItems: 'center', width: 44, height: 44 }} onClick={topbarMenuClick}><SVGMenu className='sudoku__open-menu-button' strokeTop='var(--primaryIconColor)' strokeBottom='var(--secondaryIconColor)' /></div>
                ]}
                onTitleClick={() => { if (!tutorialIsOpen) setMenuActionSheetIsOpen(true) }}
            >
                {!tutorialIsOpen && <Timer ref={timerRef} paused={paused} win={win} onClick={handleTimerClick} />}
            </Topbar>

            <SectionContent>
                {
                    win ?
                        <WinScreen handleNewGameClick={handleNewGameClick} handleNewGame={handleNewGame} game={GameHandler.game} /> :
                        tutorialIsOpen ? <Tutorial gameMode={GameHandler.game.mode} quitTutorial={handleQuitTutorial} /> :
                            <Game paused={paused} handleComplete={handleComplete} boardAnimationDuration={BOARD_ANIMATION_DURATION} game={GameHandler.game} handleFullNotation={handleFullNotation} />
                }
            </SectionContent>

            <ActionSheet
                isOpen={menuActionSheetIsOpen}
                onClose={() => setMenuActionSheetIsOpen(false)}
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
        </Section>
    )
}
