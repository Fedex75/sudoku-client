import './home.css'
import { Route, Routes } from 'react-router'
import { ActionSheet, ActionSheetButton, Section, SectionContent, Topbar } from "../../components"
import Play from './play/Play'
import Bookmarks from './bookmarks/Bookmarks'
import MainStatistics from './statistics/MainStatistics'
import MainSettings from './settings/MainSettings'
import TabSwitcher from '../../components/tabSwitcher/TabSwitcher'
import { t } from 'i18next'
import { useState, useCallback, useEffect } from 'react'
import Board from '../../utils/Board'
import GameHandler from '../../utils/GameHandler'
import PlayButton, { PlayButtonAction } from '../../components/playButton/PlayButton'
import Sudoku from '../sudoku/Sudoku'

function Home() {
    const [playingGame, setPlayingGame] = useState(false)
    const [shouldRenderHome, setShouldRenderHome] = useState(true)
    const [shouldRenderGame, setShouldRenderGame] = useState(false)

    const [discardGameActionSheetIsOpen, setDiscardGameActionSheetIsOpen] = useState(false)
    const [pendingNewGame, setPendingNewGame] = useState<Board | null>()

    const [playButtonAction, setPlayButtonAction] = useState<PlayButtonAction>('default')

    const handleNewGame = useCallback((newGame: Board) => {
        GameHandler.setCurrentGame(newGame)
        setPlayingGame(true)
    }, [])

    const handleNewGameRequest = useCallback((newGame: Board) => {
        if (GameHandler.game && !GameHandler.game.complete) {
            setPendingNewGame(newGame)
            setDiscardGameActionSheetIsOpen(true)
        } else {
            handleNewGame(newGame)
        }
    }, [handleNewGame])

    const handleContinueRequest = useCallback(() => {
        setPlayingGame(true)
    }, [])

    const handlePlayButtonClick = useCallback(() => {
        switch (playButtonAction) {
            case 'default':
                handleContinueRequest()
                break
            case 'confirm':
                break
            case 'moveToTop':
                break
        }
    }, [handleContinueRequest, playButtonAction])

    useEffect(() => {
        if (playingGame) {
            setPlayButtonAction('moveToTop')
            setShouldRenderGame(true)
            setTimeout(() => {
                setShouldRenderHome(false)
            }, Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gameSlideAnimationDuration')) * 1000)
        }
    }, [playingGame])

    return (
        <>
            {
                shouldRenderHome ?
                    <Section className="home">
                        <Topbar logo />

                        <SectionContent id="home">
                            <Routes>
                                <Route path="/" element={<Play requestNewGame={handleNewGameRequest} />} />
                                <Route path="/bookmarks" element={<Bookmarks requestContinue={handleContinueRequest} requestNewGame={handleNewGameRequest} />} />
                                <Route path="/statistics" element={<MainStatistics />} />
                                <Route path="/settings" element={<MainSettings />} />
                            </Routes>
                        </SectionContent>

                        <TabSwitcher />
                    </Section>
                    : null
            }

            <PlayButton onPlayButtonClick={handlePlayButtonClick} action={playButtonAction} variant={playButtonAction === 'default' ? 'defaultVariant' : 'confirmVariant'} />


            <div className={`home__sudoku-wrapper ${playingGame ? 'show' : 'hidden'}`} >
                {shouldRenderGame ? <Sudoku /> : null}
            </div>

            <ActionSheet isOpen={discardGameActionSheetIsOpen} title={t('common.discardGame')} cancelTitle={t('common.cancel')} cancelColor='var(--darkBlue)' onClose={() => setDiscardGameActionSheetIsOpen(false)} buttonsMode>
                <ActionSheetButton title={t('common.discard')} color="var(--red)" onClick={() => { if (pendingNewGame) handleNewGame(pendingNewGame) }} />
            </ActionSheet>
        </>
    )
}

export default Home
