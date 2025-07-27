import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import GameHandler from "../utils/GameHandler";
import Numpad from "../components/numpad/Numpad";
import { MouseButtonType } from "../utils/DataTypes";
import { Navigate } from "react-router";
import { Colors, ColorName, colorNames } from "../utils/Colors";
import { isTouchDevice } from "../utils/hooks/isTouchDevice";
import MagicWandSVG from "../svg/magic_wand";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import ColorCircleSVG from "../svg/color_circle";
import brightness from "../utils/Utils";
import { themes } from './Themes';
import { Cell, CellCoordinates } from '../utils/Cell';
import CanvasComponent from '../components/CanvasComponent';
import { CanvasFactory } from './gameModes/CanvasFactory';
import { SettingsContext } from '../utils/hooks/SettingsHandler';
import Board from '../utils/Board';
import { ThemeContext } from '../utils/hooks/useTheme';
import { AccentColorContext } from '../utils/hooks/useAccentColor';
import { BOARD_WIN_ANIMATION_DURATION_MS } from '../utils/Constants';

type Props = {
    paused: boolean;
    handleComplete: () => void;
    game: Board;
    handleFullNotation: () => void;
};

function Game({ paused, handleComplete, game, handleFullNotation }: Props) {
    const { theme } = useContext(ThemeContext);
    const { accentColor } = useContext(AccentColorContext);
    const { settings } = useContext(SettingsContext);

    const [noteMode, setNoteMode] = useState(isTouchDevice); //If it's a touch device, start with notes on, otherwise off
    const [showLinks, setShowLinks] = useState(false);
    const [lockedInput, setLockedInput] = useState(0);
    const [colorMode, setColorMode] = useState(false);
    const [lockedColor, setLockedColor] = useState<ColorName | null>(null);
    const [magicWandHighlighted, setMagicWandHighlighted] = useState(false);

    const [dragMode, setDragMode] = useState<boolean | null>(null);

    const [magicWandMode, setMagicWandMode] = useState<'disabled' | 'links' | 'setColor' | 'clearColors'>();
    const [magicWandColor, setMagicWandColor] = useState<ColorName | null>(null);
    const [calculatorValue, setCalculatorValue] = useState<number>(0);

    const [selectMode, setSelectMode] = useState(false);
    const [selectedCellBeforeSelectMode, setSelectedCellBeforeSelectMode] = useState<Cell | null>(null);

    const [possibleValues, setPossibleValues] = useState<Set<number>>(new Set());

    const canvasHandlerRef = useRef(CanvasFactory(game.mode, accentColor, false, 0.01));

    const updateCalculatorValue = useCallback(() => {
        if (!game) return;

        if (game.selectedCells.size < 2) {
            setCalculatorValue(0);
            return;
        }

        setCalculatorValue(game.calculatorValue);
    }, [game]);

    const updatePossibleValues = useCallback(() => {
        if (!game) return;

        const newPossibleValues =
            game.settings.showPossibleValues ?
                [...game.selectedCells].filter(cell => !cell.clue).map(cell => cell.possibleValues).reduce((a, b) => a.union(b), new Set())
                : new Set(Array.from({ length: game.nSquares }, (_, i) => i + 1));

        setPossibleValues(newPossibleValues);
    }, [game]);

    const shuffleMagicWandColor = useCallback(() => {
        if (!game) return;

        let selectedColors: ColorName[] = [];
        for (const cell of game.selectedCells) {
            if (cell.color && !selectedColors.includes(cell.color)) {
                selectedColors.push(cell.color);
            }

        }

        if (selectedColors.length > 2) {
            setMagicWandMode('disabled');
            setMagicWandColor(accentColor);
        } else {
            if (selectedColors.length === 1) {
                setMagicWandColor(selectedColors[0]);
            } else {
                let possibleColorNames: ColorName[] = [...colorNames];
                const orthogonalCells = [...game.selectedCells].map(cell => cell.orthogonalCells).reduce((a, b) => a.union(b), new Set());

                let colorsAlreadyOnBoard: ColorName[] = [];
                for (const cell of game.allCells) {
                    if (cell.color && !colorsAlreadyOnBoard.includes(cell.color)) colorsAlreadyOnBoard.push(cell.color);
                }

                const possibleColorNamesWithoutAlreadyOnBoard = possibleColorNames.filter(c => !colorsAlreadyOnBoard.includes(c));
                if (possibleColorNamesWithoutAlreadyOnBoard.length > 0) {
                    possibleColorNames = possibleColorNamesWithoutAlreadyOnBoard;
                } else {
                    for (const cell of orthogonalCells) {
                        if (cell.color) possibleColorNames = possibleColorNames.filter(cn => cn !== cell.color);
                    }
                }

                if (magicWandColor === null || !possibleColorNames.includes(magicWandColor)) {
                    if (possibleColorNames.length > 0) setMagicWandColor(possibleColorNames[Math.floor(Math.random() * possibleColorNames.length)]);
                    else setMagicWandColor(accentColor);
                }
            }
        }
    }, [accentColor, magicWandColor, game]);

    const updateMagicWandMode = useCallback(() => {
        if (!game) return;

        if (colorMode) {
            setMagicWandMode('clearColors');
        } else if (lockedInput !== 0 || (game.selectedCells.size === 1 && [...game.selectedCells][0].value > 0)) {
            setMagicWandMode('links');
        } else {
            let selectedColors: ColorName[] = [];
            for (const cell of game.selectedCells) {
                if (cell.color && !selectedColors.includes(cell.color)) {
                    selectedColors.push(cell.color);
                }

            }
            const length = game.selectedCells.size;
            if (length === 0 || (length === 1 && [...game.selectedCells][0].color) || selectedColors.length > 1) {
                setMagicWandMode("disabled");
                setMagicWandColor(null);
            } else {
                setMagicWandMode('setColor');
                shuffleMagicWandColor();
            }
        }
        updateCalculatorValue();
    }, [colorMode, lockedInput, updateCalculatorValue, shuffleMagicWandColor, game]);

    const handleUserInteraction = useCallback((func: () => void, lastInteractedCell: Cell | null) => {
        if (!game || game.complete || paused) return;

        func();

        if (game.hasChanged) {
            //if (process.env.NODE_ENV === 'development') GameHandler.saveGame()

            if (game.complete) {
                const center: CellCoordinates = lastInteractedCell?.coords || { x: Math.floor(game.nSquares / 2), y: Math.floor(game.nSquares / 2) };

                game.animations = [{
                    type: 'board',
                    startTime: null,
                    duration: BOARD_WIN_ANIMATION_DURATION_MS,
                    func: ({ theme, progress }) => {
                        if (!game) return;
                        for (const cell of game.allCells) { cell.animationColor = `rgba(${themes[theme].animationBaseColor}, ${brightness(Math.max(Math.abs(center.x - cell.coords.x), Math.abs(center.y - cell.coords.y)), progress, 8, 8)})`; }
                    }
                }];
                GameHandler.setComplete();
                handleComplete();
            }

            if (game.animations.length > 0) {
                canvasHandlerRef.current.addAnimations(game.animations);
                game.animations = [];
            }
        }

        updatePossibleValues();
        updateMagicWandMode();

        canvasHandlerRef.current.renderFrame();
    }, [handleComplete, updateMagicWandMode, updatePossibleValues, game, paused]);

    const handleSelect = useCallback((withState: boolean | null) => {
        if (!game || game.complete || paused) return;

        const newState = (withState === null) ? !selectMode : withState;
        if (newState) {
            if (game.selectedCells.size > 0) setSelectedCellBeforeSelectMode([...game.selectedCells][0]);
            else setSelectedCellBeforeSelectMode(null);
            game.selectedCells = new Set();
        } else {
            if (selectedCellBeforeSelectMode) game.selectedCells = new Set([selectedCellBeforeSelectMode]);
            else game.selectedCells = new Set();
        }

        setSelectMode(newState);
        updatePossibleValues();
        updateMagicWandMode();
    }, [selectMode, selectedCellBeforeSelectMode, updateMagicWandMode, game, updatePossibleValues, paused]);

    const handleSetColor = useCallback((selectedCells: Set<Cell>, color: ColorName | null = accentColor) => {
        if (!game || game.complete || selectedCells.size === 0) return;

        let selectedGroups = [...selectedCells].map(cell => cell.colorGroups).reduce((a, b) => a.union(b), new Set());

        // Coincidence is full or coincidence is partial and color is different: remove the group
        const groupsToRemove = new Set([...selectedGroups].filter(cg => [...cg.members].every(cell => !selectedCells.has(cell)) || (color !== [...cg.members][0].color)));
        game.removeColorGroups({ from: groupsToRemove, causedByUser: false });

        if (color && selectedCells.size > 1) {
            game.createColorGroup({ withCells: selectedCells, painted: color, causedByUser: true });
            handleSelect(false);
            setColorMode(false);
        } else game.setColor({ of: [...selectedCells][0], to: color, causedByUser: true });
    }, [accentColor, handleSelect, game]);

    const onCanvasClick = useCallback((cellSet: Set<Cell>, type: MouseButtonType, hold: boolean) => {
        if (!game || game.complete || paused) return;

        const cells = [...cellSet];

        if (cells.length === 2) {
            //Select rectangular area
            setSelectMode(true);
            game.selectBox(cells[0], cells[1]);
        } else if (cells.length === 1) {
            const cellPossibleValues = cells[0].possibleValues;

            if (selectMode) {
                if (hold) {
                    game.select(cells[0], dragMode);
                } else {
                    setDragMode(game.select(cells[0]));
                }
            } else if (type === 'tertiary') {
                // Middle mouse button, set color
                handleUserInteraction(() => { handleSetColor(cellSet); }, cells[0]);
            } else {
                if (colorMode) {
                    if (lockedColor) {
                        if (hold) {
                            if ((cells[0].color === lockedColor) !== dragMode) {
                                handleUserInteraction(() => { handleSetColor(cellSet, lockedColor); }, cells[0]);
                            }
                        } else {
                            setDragMode(cells[0].color !== lockedColor);
                            handleUserInteraction(() => { handleSetColor(cellSet, lockedColor); }, cells[0]);
                            game.selectedCells = cellSet;
                        }
                    } else {
                        game.selectedCells = cellSet;
                    }
                } else {
                    if (lockedInput === 0) {
                        // No locked input, so select this cell (or its color group) and set the locked input if applicable
                        if (hold) {
                            game.select(cells[0]);
                            setDragMode(true);
                            setSelectMode(true);
                        } else {
                            game.selectedCells = cellSet;

                            if (cells[0].value > 0 && game.settings.inputLock) setLockedInput(cells[0].value);
                        }
                    } else {
                        if (hold) {
                            // If the user is dragging the cursor...
                            if (!game.settings.showPossibleValues || cellPossibleValues.has(lockedInput)) {
                                if ((noteMode || type === 'secondary') && (cellPossibleValues.size > 1)) {
                                    // If we're in note mode and the cell has more than one possible value or the user doesn't want to auto solve single possibility cells, set a note
                                    if (game.onlyAvailableInAnyUnit(cells[0], lockedInput)) {
                                        game.setNote({ withValue: lockedInput, of: cellSet, to: true, checkingAutoSolution: true, causedByUser: true });
                                    } else {
                                        game.setNote({ withValue: lockedInput, of: cellSet, to: dragMode, checkingAutoSolution: true, causedByUser: true });
                                    }

                                } else {
                                    // If we're not in note mode or the cell has only one possible value, set the value if the cell doesn't already have a value (this helps with dragging)
                                    if (cells[0].value === 0) {
                                        game.setValue({ of: cells[0], to: lockedInput, causedByUser: true });
                                    }
                                }
                            }
                        } else {
                            // The user is not dragging, select the cell and lock the input
                            game.selectedCells = cellSet;
                            if (cells[0].value > 0) {
                                setLockedInput(li => cells[0].value === li ? 0 : cells[0].value);
                            } else {
                                if ((noteMode || type === 'secondary')) {
                                    if (game.settings.showPossibleValues && game.settings.autoSolveNakedSingles && cellPossibleValues.size === 1) {
                                        if (!game.settings.showPossibleValues || cellPossibleValues.has(lockedInput)) {
                                            game.setValue({ of: cellSet, to: lockedInput, causedByUser: true });
                                        }
                                    } else {
                                        if (!game.settings.showPossibleValues || cells[0].notes.has(lockedInput) || cellPossibleValues.has(lockedInput)) {
                                            setDragMode(game.setNote({ withValue: lockedInput, of: cellSet, to: null, checkingAutoSolution: true, causedByUser: true }));
                                        }
                                    }
                                } else {
                                    if (!game.settings.showPossibleValues || cellPossibleValues.has(lockedInput)) {
                                        game.setValue({ of: cellSet, to: lockedInput, causedByUser: true });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, [dragMode, colorMode, handleSetColor, lockedColor, lockedInput, noteMode, selectMode, handleUserInteraction, game, paused]);

    const onNote = useCallback(() => {
        if (paused) return;

        setNoteMode(n => !n);
    }, [paused]);

    const onHint = useCallback(() => {
        if (!game || game.complete || paused) return;

        game.giveHint({ forCells: game.selectedCells, causedByUser: true });
    }, [game, paused]);

    const onMagicWand = useCallback(() => {
        if (!game || game.complete || paused) return;

        switch (magicWandMode) {
            case 'links':
                setShowLinks(l => !l);
                break;
            case 'clearColors':
                handleUserInteraction(() => {
                    if (game && !GameHandler.game?.complete) game.clearColors({ causedByUser: true });
                }, null);
                break;
            case 'setColor':
                handleUserInteraction(() => {
                    if (!game) return;

                    handleSetColor(game.selectedCells, magicWandColor || accentColor);
                    shuffleMagicWandColor();
                }, [...game.selectedCells][0]);
                break;
        }
    }, [magicWandMode, handleUserInteraction, accentColor, handleSetColor, magicWandColor, shuffleMagicWandColor, game, paused]);

    const onColor = useCallback(() => {
        if (paused) return;

        if (colorMode) {
            setColorMode(false);
        } else {
            setColorMode(true);
        }
    }, [colorMode, paused]);

    const onColorButtonClick = useCallback((color: ColorName | null, type: MouseButtonType) => {
        if (paused) return;

        if (type === 'primary') {
            handleUserInteraction(() => { if (game) handleSetColor(game.selectedCells, color); }, (game ? (game.selectedCells.size > 0 ? [...game.selectedCells][0] : null) : null));
        } else {
            setLockedColor(lc => lc === color ? null : color);
        }
    }, [handleSetColor, handleUserInteraction, game, paused]);

    const onUndo = useCallback(() => {
        if (!game || game.complete || paused) return;

        game.popBoard();
        canvasHandlerRef.current.stopAnimations();
    }, [game, paused]);

    const onErase = useCallback(() => {
        if (!game || game.complete || paused) return;

        game.erase({ cells: game.selectedCells, causedByUser: true });
        canvasHandlerRef.current.stopAnimations();
    }, [game, paused]);

    const onNumpadButtonClick = useCallback((number: number, type: MouseButtonType) => {
        if (!game || game.complete || paused) return;

        if (type === 'primary') {
            if (possibleValues.has(number)) {
                if (noteMode && (possibleValues.size > 1 || !game.settings.autoSolveNakedSingles)) {
                    game.setNote({ withValue: number, of: game.selectedCells, to: null, checkingAutoSolution: true, causedByUser: true });
                } else {
                    if (lockedInput > 0) setLockedInput(number);
                    game.setValue({ of: game.selectedCells, to: number, causedByUser: true });
                }
            }
        } else setLockedInput(li => li === number ? 0 : number);
    }, [noteMode, possibleValues, lockedInput, game, paused]);

    useEffect(() => {
        if (magicWandMode !== 'links') setShowLinks(false);
    }, [magicWandMode]);

    useEffect(() => {
        canvasHandlerRef.current.renderFrame();
    });

    const magicWandIcon = useMemo(() => {
        if (magicWandMode === 'links') {
            return <FontAwesomeIcon icon={faLink} fontSize={30} color={magicWandHighlighted ? 'white' : 'var(--primaryIconColor)'} />;
        } else if (magicWandMode === 'clearColors') {
            return <ColorCircleSVG />;
        } else {
            return <MagicWandSVG fill={magicWandMode === 'setColor' && !game.fullNotation ? Colors[magicWandColor || accentColor] : 'var(--primaryIconColor)'} />;
        }
    }, [magicWandMode, magicWandColor, accentColor, game.fullNotation, magicWandHighlighted]);

    useEffect(() => {
        updateMagicWandMode();
    }, [updateMagicWandMode]);

    useEffect(() => {
        updateCalculatorValue();
        updatePossibleValues();
    }, [game.selectedCells, updateCalculatorValue, updatePossibleValues]);

    useEffect(() => {
        if (game) game.settings = settings;
        canvasHandlerRef.current.game = game;
    }, [game, settings]);

    useEffect(() => {
        canvasHandlerRef.current.theme = theme;
    }, [theme]);

    useEffect(() => {
        if (game.completedNumbers.has(lockedInput)) {
            setLockedInput(0);
        }
    }, [game.completedNumbers, lockedInput, setLockedInput]);

    useEffect(() => {
        canvasHandlerRef.current.lockedInput = lockedInput;
    }, [lockedInput]);

    useEffect(() => {
        canvasHandlerRef.current.showLinks = showLinks;
    }, [showLinks]);

    useEffect(() => {
        canvasHandlerRef.current.onClick = (coords, type, hold) => { handleUserInteraction(() => { onCanvasClick(coords, type, hold); }, [...coords][0]); };
    }, [onCanvasClick, handleUserInteraction]);

    useEffect(() => {
        if (game.fullNotation) handleFullNotation();
    }, [game.fullNotation, handleFullNotation]);

    useEffect(() => {
        setMagicWandHighlighted(showLinks);
    }, [showLinks]);

    if (!game) return <Navigate to="/"></Navigate>;

    return (
        <div className="game">
            <div className="sudoku">
                <CanvasComponent canvasHandler={canvasHandlerRef.current} paused={paused} />
            </div>
            <Numpad
                paused={paused}
                onUndo={() => { handleUserInteraction(onUndo, null); }}
                onErase={() => { handleUserInteraction(onErase, null); }}
                onNote={onNote}
                onHint={() => { handleUserInteraction(onHint, null); }}
                onMagicWand={onMagicWand}
                onSelect={() => { handleSelect(null); }}
                onColor={onColor}
                onColorButtonClick={onColorButtonClick}
                onNumpadButtonClick={(number, type) => { handleUserInteraction(() => { onNumpadButtonClick(number, type); }, null); }}

                noteHighlighted={noteMode}
                magicWandHighlighted={showLinks}
                magicWandIcon={magicWandIcon}
                magicWandDisabled={magicWandMode === 'disabled'}
                selectHighlighted={selectMode}

                undoDisabled={!game || game.complete || !game.hasHistory}
                eraseDisabled={!game || game.complete || !game.canErase}
                hintDisabled={!game || game.complete || !game.canGiveHint}
                colorDisabled={false}

                colorMode={colorMode}
                lockedColor={lockedColor}

                lockedInput={lockedInput}
                possibleValues={possibleValues}
                completedNumbers={game.completedNumbers}

                calculatorValue={calculatorValue}
            />
        </div>
    );
}

export default Game;
