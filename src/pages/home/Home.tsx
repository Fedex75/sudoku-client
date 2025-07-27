import './home.css';
import { Route, Routes } from 'react-router';
import { Section, SectionContent, Topbar } from "../../components";
import Play from './play/Play';
import Bookmarks from './bookmarks/Bookmarks';
import MainStatistics from './statistics/MainStatistics';
import MainSettings from './settings/MainSettings';
import Navbar, { NavbarAction } from '../../components/navbar/Navbar';
import { useState, useCallback } from 'react';
import Board from '../../utils/Board';
import GameHandler from '../../utils/GameHandler';
import PlayButton, { PlayButtonAction } from '../../components/playButton/PlayButton';
import Sudoku from '../sudoku/Sudoku';
import { GAME_SLIDE_ANIMATION_DURATION_SECONDS } from '../../utils/Constants';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function Home() {
    const [shouldRenderHome, setShouldRenderHome] = useState(true);
    const [shouldRenderGame, setShouldRenderGame] = useState(false);

    const [playButtonAction, setPlayButtonAction] = useState<PlayButtonAction>('default');
    const [navbarAction, setNavbarAction] = useState<NavbarAction>('default');
    const [navbarText, setNavbarText] = useState('');
    const [navbarCallbacks, setNavbarCallbacks] = useState<{ onConfirm: () => void, onCancel: () => void; }>({ onConfirm: () => { }, onCancel: () => { } });

    const { t } = useTranslation();

    const showGame = useCallback(() => {
        setShouldRenderGame(true);
        setTimeout(() => {
            setShouldRenderHome(false);
        }, GAME_SLIDE_ANIMATION_DURATION_SECONDS * 1000);
    }, []);

    const hideGame = useCallback(() => {
        setShouldRenderGame(false);
        setPlayButtonAction('default');
        setShouldRenderHome(true);
    }, []);

    const handleNewGame = useCallback((newGame: Board) => {
        GameHandler.setCurrentGame(newGame);
        showGame();
    }, [showGame]);

    const handleContinueRequest = useCallback(() => {
        showGame();
    }, [showGame]);

    const handlePlayButtonClick = useCallback(() => {
        if (!GameHandler.game || GameHandler.game.complete) {
            const newGame = GameHandler.createNewGame();
            if (!newGame) return;
            GameHandler.setCurrentGame(newGame);
        }
        handleContinueRequest();
    }, [handleContinueRequest]);

    const handleConfirmButtonClick = useCallback(() => {
        setPlayButtonAction('default');
        setNavbarAction('default');
        navbarCallbacks.onConfirm();
    }, [navbarCallbacks]);

    const handleCancelButtonClick = useCallback(() => {
        setPlayButtonAction('default');
        setNavbarAction('default');
        navbarCallbacks.onCancel();
    }, [navbarCallbacks]);

    const handleGoBack = useCallback(() => {
        hideGame();
    }, [hideGame]);

    const handlePromptRequest = useCallback((prompt: string, onConfirm: () => void, onCancel: () => void) => {
        setNavbarText(prompt);
        setNavbarAction('prompt');
        setPlayButtonAction('hide');
        setNavbarCallbacks({ onConfirm, onCancel });
    }, []);

    const handleNewGameRequest = useCallback((newGame: Board) => {
        if (GameHandler.game && !GameHandler.game.complete) {
            handlePromptRequest(
                t('common.discardGame'),
                () => {
                    GameHandler.setCurrentGame(newGame);
                    showGame();
                },
                () => { }
            );
        } else {
            handleNewGame(newGame);
        }
    }, [handleNewGame, t, showGame, handlePromptRequest]);

    return (
        <>
            {
                shouldRenderHome ?
                    <Section className="home">
                        <Topbar logo />

                        <SectionContent id="home">
                            <Routes>
                                <Route path="/" element={<Play requestNewGame={handleNewGameRequest} />} />
                                <Route path="/bookmarks" element={<Bookmarks requestContinue={handleContinueRequest} requestNewGame={handleNewGameRequest} requestPrompt={handlePromptRequest} />} />
                                <Route path="/statistics" element={<MainStatistics requestPrompt={handlePromptRequest} />} />
                                <Route path="/settings" element={<MainSettings />} />
                            </Routes>
                        </SectionContent>
                    </Section>
                    : null
            }

            <Navbar action={navbarAction} onConfirm={handleConfirmButtonClick} onCancel={handleCancelButtonClick} text={navbarText} color='var(--primaryTextColor)' />

            <PlayButton action={playButtonAction} onPlay={handlePlayButtonClick} />

            <AnimatePresence>
                {shouldRenderGame && <Sudoku requestGoBack={handleGoBack} />}
            </AnimatePresence>
        </>
    );
}

export default Home;
