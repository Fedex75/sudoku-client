import { useMemo, useRef, useState } from "react"
import Canvas from "../../game/Canvas"
import { AccentColor } from "../../utils/Colors"
import { Ruleset } from "../../utils/DataTypes"
import { GameModeName } from "../../utils/Difficulties"
import Board from "../../game/Board"
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import './tutorial.css'
import { Button } from '../../components'
import { rulesets } from '../../game/gameModes/Rulesets'
import { ThemeName } from '../../game/Themes'
import { commonCalculatePossibleValuesByVisibility } from '../../game/gameModes/Common'
import { thermoCalculatePossibleValues } from '../../game/gameModes/Thermo'

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
        let board = newTutorialGames.classic[0].board
        board.get({ x: 2, y: 3 }).value = 4
        for (let x = 0; x < 9; x++) newTutorialGames.classic[0].board.selectedCells.push(board.get({ x, y: 3 }))

        board = newTutorialGames.classic[1].board
        board.get({ x: 1, y: 7 }).value = 6
        for (let y = 0; y < 9; y++) newTutorialGames.classic[1].board.selectedCells.push(board.get({ x: 1, y }))

        board = newTutorialGames.classic[2].board
        board.setValue([board.get({ x: 8, y: 5 })], 5)
        board.selectedCells = rulesets.classic.game.getBoxCellsCoordinates(board, board.get({ x: 6, y: 3 }))

        newTutorialGames.classic[3].board.iterateAllCells(cell => cell.value = cell.cache.solution)

        for (const game of newTutorialGames.classic) commonCalculatePossibleValuesByVisibility(game.board)

        // KILLER

        board = newTutorialGames.killer[0].board
        board.get({ x: 6, y: 1 }).value = 7
        for (let x = 0; x < 9; x++) board.selectedCells.push(board.get({ x, y: 1 }))

        board = newTutorialGames.killer[1].board
        board.get({ x: 6, y: 2 }).value = 5
        for (let y = 0; y < 9; y++) board.selectedCells.push(board.get({ x: 6, y }))

        board = newTutorialGames.killer[2].board
        board.get({ x: 8, y: 8 }).value = 6
        board.selectedCells = board.ruleset.game.getBoxCellsCoordinates(board, board.get({ x: 6, y: 6 }))

        board = newTutorialGames.killer[3].board
        board.get({ x: 3, y: 3 }).value = 7
        board.selectedCells = board.get({ x: 2, y: 1 }).cache.cage!.members
        board.get({ x: 2, y: 1 }).cache.isError = true
        board.get({ x: 3, y: 3 }).cache.isError = true

        board = newTutorialGames.killer[4].board
        board.get({ x: 7, y: 7 }).value = 2
        board.get({ x: 8, y: 6 }).value = 3
        board.selectedCells = board.get({ x: 7, y: 7 }).cache.cage!.members

        newTutorialGames.killer[5].board.iterateAllCells(cell => cell.value = cell.cache.solution)

        for (const game of newTutorialGames.killer) commonCalculatePossibleValuesByVisibility(game.board)

        // SUDOKU X

        board = newTutorialGames.sudokuX[0].board
        board.get({ x: 5, y: 2 }).value = 4
        for (let x = 0; x < 9; x++) board.selectedCells.push(board.get({ x, y: 2 }))

        board = newTutorialGames.sudokuX[1].board
        board.get({ x: 4, y: 1 }).value = 8
        for (let y = 0; y < 9; y++) board.selectedCells.push(board.get({ x: 4, y }))

        board = newTutorialGames.sudokuX[2].board
        board.get({ x: 5, y: 6 }).value = 4
        board.selectedCells = rulesets.sudokuX.game.getBoxCellsCoordinates(board, board.get({ x: 3, y: 6 }))

        board = newTutorialGames.sudokuX[3].board
        board.get({ x: 8, y: 0 }).value = 1
        board.get({ x: 7, y: 7 }).value = 6

        rulesets.sudokuX.game.checkAdditionalErrors(newTutorialGames.sudokuX[3].board)

        const sudokuXSolution = '958324617712856934346719825173295468865143279429687351631978542597432186284561793'
        newTutorialGames.sudokuX[4].board.iterateAllCells((cell) => cell.value = Number.parseInt(sudokuXSolution[cell.cache.coords.y * 9 + cell.cache.coords.x]))

        for (const game of newTutorialGames.sudokuX) commonCalculatePossibleValuesByVisibility(game.board)

        // SANDWICH

        board = newTutorialGames.sandwich[0].board
        board.get({ x: 6, y: 2 }).value = 2
        for (let x = 0; x < 9; x++) newTutorialGames.sandwich[0].board.selectedCells.push(board.get({ x, y: 2 }))

        board = newTutorialGames.sandwich[1].board
        board.get({ x: 2, y: 7 }).value = 5
        for (let y = 0; y < 9; y++) newTutorialGames.sandwich[1].board.selectedCells.push(board.get({ x: 2, y }))

        board = newTutorialGames.sandwich[2].board
        board.get({ x: 8, y: 5 }).value = 6
        board.selectedCells = rulesets.sandwich.game.getBoxCellsCoordinates(board, board.get({ x: 6, y: 3 }))

        board = newTutorialGames.sandwich[3].board
        board.get({ x: 3, y: 5 }).value = 8
        board.get({ x: 4, y: 5 }).value = 2
        board.get({ x: 5, y: 5 }).value = 6
        newTutorialGames.sandwich[3].board.selectedCells = [board.get({ x: 2, y: 5 }), board.get({ x: 3, y: 5 }), board.get({ x: 4, y: 5 }), board.get({ x: 5, y: 5 }), board.get({ x: 6, y: 5 })]

        for (const game of newTutorialGames.sandwich) commonCalculatePossibleValuesByVisibility(game.board)

        const sandwichSolution = '931682574465713928827459613183597462652341789749268135374125896518936247296874351'
        newTutorialGames.sandwich[4].board.iterateAllCells(cell => cell.value = Number.parseInt(sandwichSolution[cell.cache.coords.y * 9 + cell.cache.coords.x]))

        // THERMO

        board = newTutorialGames.thermo[0].board
        board.get({ x: 6, y: 3 }).value = 4
        for (let x = 0; x < 9; x++) board.selectedCells.push(board.get({ x, y: 3 }))

        board = newTutorialGames.thermo[1].board
        board.get({ x: 0, y: 1 }).value = 3
        for (let y = 0; y < 9; y++) board.selectedCells.push(board.get({ x: 0, y }))

        board = newTutorialGames.thermo[2].board
        board.get({ x: 5, y: 1 }).value = 6
        board.selectedCells = rulesets.thermo.game.getBoxCellsCoordinates(board, board.get({ x: 3, y: 0 }))

        board = newTutorialGames.thermo[3].board
        board.selectedCells = [board.get({ x: 4, y: 0 }), board.get({ x: 4, y: 3 })]

        board = newTutorialGames.thermo[4].board
        board.get({ x: 6, y: 3 }).value = 1
        board.get({ x: 6, y: 4 }).value = 3
        board.get({ x: 7, y: 4 }).value = 4
        board.get({ x: 8, y: 4 }).value = 6
        board.get({ x: 8, y: 3 }).value = 8
        board.get({ x: 8, y: 2 }).value = 9
        board.get({ x: 1, y: 0 }).value = 1

        board.selectedCells = [board.get({ x: 6, y: 3 }), board.get({ x: 6, y: 4 }), board.get({ x: 7, y: 4 }), board.get({ x: 8, y: 4 }), board.get({ x: 8, y: 3 }), board.get({ x: 8, y: 2 }), board.get({ x: 0, y: 0 }), board.get({ x: 1, y: 0 }), board.get({ x: 2, y: 0 })]

        const thermoSolution = '932781645576942183184635729649528317218379456357164298795216834823457961461893572'
        newTutorialGames.thermo[5].board.iterateAllCells(cell => cell.value = Number.parseInt(thermoSolution[cell.cache.coords.y * 9 + cell.cache.coords.x]))

        for (const game of newTutorialGames.thermo) {
            commonCalculatePossibleValuesByVisibility(game.board)
            thermoCalculatePossibleValues(game.board)
        }

        for (const mode in newTutorialGames) {
            for (const step of newTutorialGames[mode as GameModeName]) {
                step.board.checkErrors()
            }
        }

        rulesets.thermo.game.checkAdditionalErrors(newTutorialGames.thermo[4].board)

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
