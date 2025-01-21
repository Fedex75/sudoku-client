import { useMemo, useRef, useState } from "react"
import Canvas from "../../game/Canvas"
import { AccentColor } from "../../utils/Colors"
import { ThemeName, Ruleset } from "../../utils/DataTypes"
import { GameModeName } from "../../utils/Difficulties"
import Board from "../../game/Board"
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import './tutorial.css'
import { Button } from '../../components'
import { commonDetectErrorsByVisibility } from '../../game/gameModes/Common'
import { rulesets } from '../../game/gameModes/Rulesets'

interface TutorialProps {
    gameMode: GameModeName
    theme: ThemeName
    accentColor: AccentColor
    ruleset: Ruleset
    quitTutorial: () => void
}

interface TutorialStep {
    board: Board,
    text: string
}

export function Tutorial({ gameMode, theme, accentColor, ruleset, quitTutorial }: TutorialProps) {
    const [step, setStep] = useState(0)
    const canvasRef = useRef(null)

    const { t } = useTranslation()

    const tutorialGames = useMemo(() => {
        const newTutorialGames: Record<GameModeName, TutorialStep[]> = {
            classic: [
                {
                    board: new Board({ id: 'cu0', m: '(3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }, 9),
                    text: t('tutorial.classic.rows')
                },
                {
                    board: new Board({ id: 'cu0', m: '(3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }, 9),
                    text: t('tutorial.classic.columns')
                },
                {
                    board: new Board({ id: 'cu0', m: '(3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }, 9),
                    text: t('tutorial.classic.boxes')
                },
                {
                    board: new Board({ id: 'cu0', m: '(3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }, 9),
                    text: t('tutorial.classic.solve')
                }
            ],
            killer: [
                {
                    board: new Board({ id: 'ku0', m: '.1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }, 9),
                    text: t('tutorial.classic.rows')
                },
                {
                    board: new Board({ id: 'ku0', m: '.1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }, 9),
                    text: t('tutorial.classic.columns')
                },
                {
                    board: new Board({ id: 'ku0', m: '.1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }, 9),
                    text: t('tutorial.classic.boxes')
                },
                {
                    board: new Board({ id: 'ku0', m: '.1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }, 9),
                    text: t('tutorial.killer.cages')
                },
                {
                    board: new Board({ id: 'ku0', m: '.1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }, 9),
                    text: t('tutorial.killer.cageSum')
                },
                {
                    board: new Board({ id: 'ku0', m: '.1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }, 9),
                    text: t('tutorial.classic.solve')
                }
            ],
            sudokuX: [
                {
                    board: new Board({ id: 'xu0', m: '*12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }, 9),
                    text: t('tutorial.classic.rows')
                },
                {
                    board: new Board({ id: 'xu0', m: '*12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }, 9),
                    text: t('tutorial.classic.columns')
                },
                {
                    board: new Board({ id: 'xu0', m: '*12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }, 9),
                    text: t('tutorial.classic.boxes')
                },
                {
                    board: new Board({ id: 'xu0', m: '*12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }, 9),
                    text: t('tutorial.sudokux.diagonals')
                },
                {
                    board: new Board({ id: 'xu0', m: '*12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }, 9),
                    text: t('tutorial.classic.solve')
                }
            ],
            sandwich: [
                {
                    board: new Board({ id: 'wu0', m: '93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }, 9),
                    text: t('tutorial.classic.rows')
                },
                {
                    board: new Board({ id: 'wu0', m: '93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }, 9),
                    text: t('tutorial.classic.columns')
                },
                {
                    board: new Board({ id: 'wu0', m: '93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }, 9),
                    text: t('tutorial.classic.boxes')
                },
                {
                    board: new Board({ id: 'wu0', m: '93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }, 9),
                    text: t('tutorial.sandwich.sum')
                },
                {
                    board: new Board({ id: 'wu0', m: '93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }, 9),
                    text: t('tutorial.classic.solve')
                }
            ],
            thermo: [
                {
                    board: new Board({ id: 'tu0', m: ':2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }, 9),
                    text: t('tutorial.classic.rows')
                },
                {
                    board: new Board({ id: 'tu0', m: ':2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }, 9),
                    text: t('tutorial.classic.columns')
                },
                {
                    board: new Board({ id: 'tu0', m: ':2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }, 9),
                    text: t('tutorial.classic.boxes')
                },
                {
                    board: new Board({ id: 'tu0', m: ':2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }, 9),
                    text: t('tutorial.thermo.thermometers1')
                },
                {
                    board: new Board({ id: 'tu0', m: ':2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }, 9),
                    text: t('tutorial.thermo.thermometers2')
                },
                {
                    board: new Board({ id: 'tu0', m: ':2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }, 9),
                    text: t('tutorial.classic.solve')
                }
            ]
        }

        // CLASSIC
        newTutorialGames.classic[0].board.setValue([{ x: 2, y: 3 }], 4)
        for (let x = 0; x < 9; x++) newTutorialGames.classic[0].board.selectedCells.push({ x, y: 3 })

        newTutorialGames.classic[1].board.setValue([{ x: 1, y: 7 }], 6)
        for (let y = 0; y < 9; y++) newTutorialGames.classic[1].board.selectedCells.push({ x: 1, y })

        newTutorialGames.classic[2].board.setValue([{ x: 8, y: 5 }], 5)
        newTutorialGames.classic[2].board.selectedCells = rulesets.classic.game.getBoxCellsCoordinates({ x: 6, y: 3 })

        newTutorialGames.classic[3].board.iterateAllCells(cell => cell.value = cell.cache.solution)

        // KILLER

        newTutorialGames.killer[0].board.setValue([{ x: 6, y: 1 }], 7)
        for (let x = 0; x < 9; x++) newTutorialGames.killer[0].board.selectedCells.push({ x, y: 1 })

        newTutorialGames.killer[1].board.setValue([{ x: 6, y: 2 }], 5)
        for (let y = 0; y < 9; y++) newTutorialGames.killer[1].board.selectedCells.push({ x: 6, y })

        newTutorialGames.killer[2].board.setValue([{ x: 8, y: 8 }], 6)
        newTutorialGames.killer[2].board.selectedCells = newTutorialGames.killer[2].board.ruleset.game.getBoxCellsCoordinates({ x: 6, y: 6 })

        newTutorialGames.killer[3].board.setValue([{ x: 3, y: 3 }], 7)
        newTutorialGames.killer[3].board.selectedCells = newTutorialGames.killer[3].board.get({ x: 2, y: 1 }).cache.cage!.members
        newTutorialGames.killer[3].board.get({ x: 2, y: 1 }).cache.isError = true
        newTutorialGames.killer[3].board.get({ x: 3, y: 3 }).cache.isError = true

        newTutorialGames.killer[4].board.setValue([{ x: 7, y: 7 }], 2)
        newTutorialGames.killer[4].board.setValue([{ x: 8, y: 6 }], 3)
        newTutorialGames.killer[4].board.selectedCells = newTutorialGames.killer[4].board.get({ x: 7, y: 7 }).cache.cage!.members

        newTutorialGames.killer[5].board.iterateAllCells(cell => cell.value = cell.cache.solution)

        // SUDOKU X

        newTutorialGames.sudokuX[0].board.setValue([{ x: 5, y: 2 }], 4)
        for (let x = 0; x < 9; x++) newTutorialGames.sudokuX[0].board.selectedCells.push({ x, y: 2 })

        newTutorialGames.sudokuX[1].board.setValue([{ x: 4, y: 1 }], 8)
        for (let y = 0; y < 9; y++) newTutorialGames.sudokuX[1].board.selectedCells.push({ x: 4, y })

        newTutorialGames.sudokuX[2].board.setValue([{ x: 5, y: 6 }], 4)
        newTutorialGames.sudokuX[2].board.selectedCells = rulesets.sudokuX.game.getBoxCellsCoordinates({ x: 3, y: 6 })

        newTutorialGames.sudokuX[3].board.setValue([{ x: 8, y: 0 }], 1)
        newTutorialGames.sudokuX[3].board.setValue([{ x: 7, y: 7 }], 6)

        rulesets.sudokuX.game.checkErrors(newTutorialGames.sudokuX[3].board)

        const sudokuXSolution = '958324617712856934346719825173295468865143279429687351631978542597432186284561793'
        newTutorialGames.sudokuX[4].board.iterateAllCells((cell, coords) => cell.value = Number.parseInt(sudokuXSolution[coords.y * 9 + coords.x]))

        // SANDWICH

        newTutorialGames.sandwich[0].board.setValue([{ x: 6, y: 2 }], 2)
        for (let x = 0; x < 9; x++) newTutorialGames.sandwich[0].board.selectedCells.push({ x, y: 2 })

        newTutorialGames.sandwich[1].board.setValue([{ x: 2, y: 7 }], 5)
        for (let y = 0; y < 9; y++) newTutorialGames.sandwich[1].board.selectedCells.push({ x: 2, y })

        newTutorialGames.sandwich[2].board.setValue([{ x: 8, y: 5 }], 6)
        newTutorialGames.sandwich[2].board.selectedCells = rulesets.sandwich.game.getBoxCellsCoordinates({ x: 6, y: 3 })

        newTutorialGames.sandwich[3].board.setValue([{ x: 3, y: 5 }], 8)
        newTutorialGames.sandwich[3].board.setValue([{ x: 4, y: 5 }], 2)
        newTutorialGames.sandwich[3].board.setValue([{ x: 5, y: 5 }], 6)
        newTutorialGames.sandwich[3].board.selectedCells = [{ x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }]

        // THERMO

        newTutorialGames.thermo[0].board.setValue([{ x: 6, y: 3 }], 4)
        for (let x = 0; x < 9; x++) newTutorialGames.thermo[0].board.selectedCells.push({ x, y: 3 })

        newTutorialGames.thermo[1].board.setValue([{ x: 0, y: 1 }], 3)
        for (let y = 0; y < 9; y++) newTutorialGames.thermo[1].board.selectedCells.push({ x: 0, y })

        newTutorialGames.thermo[2].board.setValue([{ x: 5, y: 1 }], 6)
        newTutorialGames.thermo[2].board.selectedCells = rulesets.thermo.game.getBoxCellsCoordinates({ x: 3, y: 0 })

        newTutorialGames.thermo[3].board.selectedCells = [{ x: 4, y: 0 }, { x: 4, y: 3 }]

        newTutorialGames.thermo[4].board.setValue([{ x: 6, y: 3 }], 1)
        newTutorialGames.thermo[4].board.setValue([{ x: 6, y: 4 }], 3)
        newTutorialGames.thermo[4].board.setValue([{ x: 7, y: 4 }], 4)
        newTutorialGames.thermo[4].board.setValue([{ x: 8, y: 4 }], 6)
        newTutorialGames.thermo[4].board.setValue([{ x: 8, y: 3 }], 8)
        newTutorialGames.thermo[4].board.setValue([{ x: 8, y: 2 }], 9)
        newTutorialGames.thermo[4].board.setValue([{ x: 1, y: 0 }], 1)
        newTutorialGames.thermo[4].board.selectedCells = [{ x: 6, y: 3 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]
        rulesets.thermo.game.checkErrors(newTutorialGames.thermo[4].board)

        const thermoSolution = '932781645576942183184635729649528317218379456357164298795216834823457961461893572'
        newTutorialGames.thermo[4].board.iterateAllCells((cell, coords) => cell.value = Number.parseInt(thermoSolution[coords.y * 9 + coords.x]))

        for (const mode in newTutorialGames) {
            for (const step of newTutorialGames[mode as GameModeName]) {
                commonDetectErrorsByVisibility(step.board)
            }
        }

        return newTutorialGames
    }, [t])

    const tutorial = useMemo(() => {
        if (step < 0 || step >= tutorialGames[gameMode].length) return null
        return tutorialGames[gameMode]
    }, [gameMode, step, tutorialGames])

    if (tutorial === null) return null

    return (
        <div className='game'>
            <div className='sudoku'>
                <Canvas
                    ref={canvasRef}
                    game={tutorial[step].board}
                    theme={theme}
                    accentColor={accentColor}
                    ruleset={ruleset}
                />
            </div>
            <div className='tutorial'>
                <div className='tutorial__controls'>
                    <FontAwesomeIcon icon={faChevronLeft} style={{ visibility: step > 0 ? 'visible' : 'hidden' }} className='tutorial__controls__icon' onClick={() => { if (step > 0) setStep(s => s - 1) }} />
                    <p className='tutorial__controls__step-number'>{`${step + 1}/${tutorial.length}`}</p>
                    <FontAwesomeIcon icon={faChevronRight} style={{ visibility: step < tutorial.length - 1 ? 'visible' : 'hidden' }} className='tutorial__controls__icon' onClick={() => { if (step < tutorial.length - 1) setStep(s => s + 1) }} />
                </div>
                <p className='tutorial__text'>{tutorial[step].text}</p>
                <Button title={t('tutorial.exit')} onClick={quitTutorial} />
            </div>
        </div>
    )
}
