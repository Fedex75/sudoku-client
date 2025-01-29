import { useEffect, useMemo, useRef, useState } from "react"
import { AccentColor } from "../../utils/Colors"
import { GameModeName } from "../../utils/Difficulties"
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import './tutorial.css'
import { Button } from '../../components'
import { ThemeName } from '../../game/Themes'
import CanvasComponent from '../../components/CanvasComponent'
import { CanvasFactory } from '../../game/gameModes/CanvasFactory'
import Board from '../../utils/Board'
import { BoardFactory } from '../../game/gameModes/BoardFactory'

interface TutorialStep {
    game: Board,
    text: string
}

interface TutorialProps {
    gameMode: GameModeName
    theme: ThemeName
    accentColor: AccentColor
    quitTutorial: () => void
}

export function Tutorial({ gameMode, theme, accentColor, quitTutorial }: TutorialProps) {
    const [step, setStep] = useState(0)
    const canvasHandlerRef = useRef(CanvasFactory(gameMode, accentColor, true))

    const { t } = useTranslation()

    const tutorialGames = useMemo(() => {
        const newTutorialGames: Record<GameModeName, TutorialStep[]> = {
            classic: [
                {
                    game: BoardFactory('classic', { id: 'cu0', mission: '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }),
                    text: 'tutorial.classic.rows'
                },
                {
                    game: BoardFactory('classic', { id: 'cu0', mission: '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }),
                    text: 'tutorial.classic.columns'
                },
                {
                    game: BoardFactory('classic', { id: 'cu0', mission: '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }),
                    text: 'tutorial.classic.boxes'
                },
                {
                    game: BoardFactory('classic', { id: 'cu0', mission: '9 (3:87%6:4.29:9:2.54(1.6!9!5%17:4:35$3;6' }),
                    text: 'tutorial.classic.solve'
                }
            ],
            killer: [
                {
                    game: BoardFactory('killer', { id: 'ku0', mission: '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }),
                    text: 'tutorial.classic.rows'
                },
                {
                    game: BoardFactory('killer', { id: 'ku0', mission: '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }),
                    text: 'tutorial.classic.columns'
                },
                {
                    game: BoardFactory('killer', { id: 'ku0', mission: '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }),
                    text: 'tutorial.classic.boxes'
                },
                {
                    game: BoardFactory('killer', { id: 'ku0', mission: '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }),
                    text: 'tutorial.killer.cages'
                },
                {
                    game: BoardFactory('killer', { id: 'ku0', mission: '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }),
                    text: 'tutorial.killer.cageSum'
                },
                {
                    game: BoardFactory('killer', { id: 'ku0', mission: '9 .1)7!4=38%84(9;4.8.7.6$4.5:2$89. 514962738367185249829374651751496382693218475482753916945827163138649527276531894 00010212,0304,0506,0818,1011,212232132333,1424,1626,07172728,2030,31,344445,152535,40,414252,4656,3637473848,5060,51,57,586878,70617172,43535464,5565,6667,7585,768677,80,8182,62637383,7484,8788' }),
                    text: 'tutorial.classic.solve'
                }
            ],
            sudokuX: [
                {
                    game: BoardFactory('sudokuX', { id: 'xu0', mission: '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }),
                    text: 'tutorial.classic.rows'
                },
                {
                    game: BoardFactory('sudokuX', { id: 'xu0', mission: '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }),
                    text: 'tutorial.classic.columns'
                },
                {
                    game: BoardFactory('sudokuX', { id: 'xu0', mission: '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }),
                    text: 'tutorial.classic.boxes'
                },
                {
                    game: BoardFactory('sudokuX', { id: 'xu0', mission: '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }),
                    text: 'tutorial.sudokux.diagonals'
                },
                {
                    game: BoardFactory('sudokuX', { id: 'xu0', mission: '9 *12$4.4671;5;2$8:1;7$8.3!1;5.2;43(6!' }),
                    text: 'tutorial.classic.solve'
                }
            ],
            sandwich: [
                {
                    game: BoardFactory('sandwich', { id: 'wu0', mission: '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }),
                    text: 'tutorial.classic.rows'
                },
                {
                    game: BoardFactory('sandwich', { id: 'wu0', mission: '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }),
                    text: 'tutorial.classic.columns'
                },
                {
                    game: BoardFactory('sandwich', { id: 'wu0', mission: '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }),
                    text: 'tutorial.classic.boxes'
                },
                {
                    game: BoardFactory('sandwich', { id: 'wu0', mission: '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }),
                    text: 'tutorial.sandwich.sum'
                },
                {
                    game: BoardFactory('sandwich', { id: 'wu0', mission: '9 93:82.7;5.1!82;9.13:35;6;2!8:49;1;7;58,9$5. 931682574465713928827459613183597462652341789749268135374125896518936247296874351 3,3,6,16,15,16,15,8,33 12,0,17,0,5,7,17,17,18' }),
                    text: 'tutorial.classic.solve'
                }
            ],
            thermo: [
                {
                    game: BoardFactory('thermo', { id: 'tu0', mission: '9 :2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }),
                    text: 'tutorial.classic.rows'
                },
                {
                    game: BoardFactory('thermo', { id: 'tu0', mission: '9 :2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }),
                    text: 'tutorial.classic.columns'
                },
                {
                    game: BoardFactory('thermo', { id: 'tu0', mission: '9 :2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }),
                    text: 'tutorial.classic.boxes'
                },
                {
                    game: BoardFactory('thermo', { id: 'tu0', mission: '9 :2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }),
                    text: 'tutorial.thermo.thermometers1'
                },
                {
                    game: BoardFactory('thermo', { id: 'tu0', mission: '9 :2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }),
                    text: 'tutorial.thermo.thermometers2'
                },
                {
                    game: BoardFactory('thermo', { id: 'tu0', mission: '9 :2)9(6%4=3(7g 33,42,43,44,35,26;74,65,56,47,38,29;58,57,66,67,68,69;37,36,45,46,55;5,14,23,32,41;48,39,30,21,12;20,11,10,19;31,22,13,4;71,62,53,52;51,50,49,40;61,70,79;2,1,0;34,25,16' }),
                    text: 'tutorial.classic.solve'
                }
            ]
        }

        // CLASSIC
        let game = newTutorialGames.classic[0].game
        game.setValue({ of: game.get({ x: 2, y: 3 })!, to: 4, causedByUser: true })
        game.selectedCells = game.get({ x: 2, y: 3 })!.row

        game = newTutorialGames.classic[1].game
        game.setValue({ of: game.get({ x: 1, y: 7 })!, to: 6, causedByUser: true })
        game.selectedCells = game.get({ x: 1, y: 7 })!.column

        game = newTutorialGames.classic[2].game
        game.setValue({ of: game.get({ x: 8, y: 5 })!, to: 5, causedByUser: true })
        game.selectedCells = game.get({ x: 6, y: 3 })!.box

        for (const cell of newTutorialGames.classic[3].game.allCells) {
            game.setValue({ of: cell, to: cell.solution, causedByUser: true })
        }

        // KILLER
        game = newTutorialGames.killer[0].game
        game.setValue({ of: game.get({ x: 6, y: 1 })!, to: 7, causedByUser: true })
        for (let x = 0; x < 9; x++) game.selectedCells.add(game.get({ x, y: 1 })!)

        game = newTutorialGames.killer[1].game
        game.setValue({ of: game.get({ x: 6, y: 2 })!, to: 5, causedByUser: true })
        for (let y = 0; y < 9; y++) game.selectedCells.add(game.get({ x: 6, y })!)

        game = newTutorialGames.killer[2].game
        game.setValue({ of: game.get({ x: 8, y: 8 })!, to: 6, causedByUser: true })
        game.selectedCells = game.get({ x: 6, y: 6 })!.box

        game = newTutorialGames.killer[3].game
        game.setValue({ of: game.get({ x: 3, y: 3 })!, to: 7, causedByUser: true })
        game.selectedCells = game.get({ x: 2, y: 1 })!.cage!.members
        game.get({ x: 2, y: 1 })!.logicError = true
        game.get({ x: 3, y: 3 })!.logicError = true

        game = newTutorialGames.killer[4].game
        game.setValue({ of: game.get({ x: 7, y: 7 })!, to: 2, causedByUser: true })
        game.setValue({ of: game.get({ x: 8, y: 6 })!, to: 3, causedByUser: true })
        game.selectedCells = game.get({ x: 7, y: 7 })!.cage!.members

        for (const cell of newTutorialGames.killer[5].game.allCells) {
            game.setValue({ of: cell, to: cell.solution, causedByUser: true })
        }

        // SUDOKU X
        game = newTutorialGames.sudokuX[0].game
        game.setValue({ of: game.get({ x: 5, y: 2 })!, to: 4, causedByUser: true })
        for (let x = 0; x < 9; x++) game.selectedCells.add(game.get({ x, y: 2 })!)

        game = newTutorialGames.sudokuX[1].game
        game.setValue({ of: game.get({ x: 4, y: 1 })!, to: 8, causedByUser: true })
        for (let y = 0; y < 9; y++) game.selectedCells.add(game.get({ x: 4, y })!)

        game = newTutorialGames.sudokuX[2].game
        game.setValue({ of: game.get({ x: 5, y: 6 })!, to: 4, causedByUser: true })
        game.selectedCells = game.get({ x: 3, y: 6 })!.box

        game = newTutorialGames.sudokuX[3].game
        game.setValue({ of: game.get({ x: 8, y: 0 })!, to: 1, causedByUser: true })
        game.setValue({ of: game.get({ x: 7, y: 7 })!, to: 6, causedByUser: true })

        const sudokuXSolution = "958324617712856934346719825173295468865143279429687351631978542597432186284561793"
        for (const cell of newTutorialGames.sudokuX[4].game.allCells) {
            game.setValue({ of: cell, to: Number.parseInt(sudokuXSolution[cell.coords.y * 9 + cell.coords.x]), causedByUser: true })
        }

        // SANDWICH
        game = newTutorialGames.sandwich[0].game
        game.setValue({ of: game.get({ x: 1, y: 3 })!, to: 6, causedByUser: true })
        game.selectedCells = game.get({ x: 1, y: 3 })!.row

        game = newTutorialGames.sandwich[1].game
        game.setValue({ of: game.get({ x: 2, y: 7 })!, to: 5, causedByUser: true })
        game.selectedCells = game.get({ x: 2, y: 7 })!.column

        game = newTutorialGames.sandwich[2].game
        game.setValue({ of: game.get({ x: 8, y: 5 })!, to: 6, causedByUser: true })
        game.selectedCells = game.get({ x: 6, y: 3 })!.box

        game = newTutorialGames.sandwich[3].game
        game.setValue({ of: game.get({ x: 3, y: 5 })!, to: 8, causedByUser: true })
        game.setValue({ of: game.get({ x: 4, y: 5 })!, to: 2, causedByUser: true })
        game.setValue({ of: game.get({ x: 5, y: 5 })!, to: 6, causedByUser: true })
        for (let x = 2; x <= 6; x++) game.selectedCells.add(game.get({ x, y: 5 })!)

        for (const cell of newTutorialGames.sandwich[4].game.allCells) {
            game.setValue({ of: cell, to: cell.solution, causedByUser: true })
        }

        // THERMO
        game = newTutorialGames.thermo[0].game
        game.setValue({ of: game.get({ x: 6, y: 3 })!, to: 4, causedByUser: true })
        game.selectedCells = game.get({ x: 6, y: 3 })!.row

        game = newTutorialGames.thermo[1].game
        game.setValue({ of: game.get({ x: 0, y: 1 })!, to: 3, causedByUser: true })
        game.selectedCells = game.get({ x: 0, y: 1 })!.column

        game = newTutorialGames.thermo[2].game
        game.setValue({ of: game.get({ x: 5, y: 1 })!, to: 6, causedByUser: true })
        game.selectedCells = game.get({ x: 3, y: 0 })!.box

        game = newTutorialGames.thermo[3].game
        game.selectedCells = new Set([
            game.get({ x: 4, y: 0 })!,
            game.get({ x: 4, y: 3 })!,
        ])

        game = newTutorialGames.thermo[4].game
        game.setValue({ of: game.get({ x: 6, y: 3 })!, to: 1, causedByUser: true })
        game.setValue({ of: game.get({ x: 6, y: 4 })!, to: 3, causedByUser: true })
        game.setValue({ of: game.get({ x: 7, y: 4 })!, to: 4, causedByUser: true })
        game.setValue({ of: game.get({ x: 8, y: 4 })!, to: 6, causedByUser: true })
        game.setValue({ of: game.get({ x: 8, y: 3 })!, to: 8, causedByUser: true })
        game.setValue({ of: game.get({ x: 8, y: 2 })!, to: 9, causedByUser: true })
        game.setValue({ of: game.get({ x: 1, y: 0 })!, to: 1, causedByUser: true })


        game.selectedCells = game.get({ x: 0, y: 0 })!.thermometer!.members.union(game.get({ x: 8, y: 2 })!.thermometer!.members)

        const thermoSolution = '932781645576942183184635729649528317218379456357164298795216834823457961461893572'
        for (const cell of newTutorialGames.thermo[5].game.allCells) cell.value = Number.parseInt(thermoSolution[cell.coords.y * 9 + cell.coords.x])

        return newTutorialGames
    }, [])

    const tutorial = useMemo(() => {
        if (step < 0 || step >= tutorialGames[gameMode].length) return null
        return tutorialGames[gameMode]
    }, [gameMode, step, tutorialGames])

    useEffect(() => {
        if (tutorial) canvasHandlerRef.current.game = tutorial[step].game
    }, [tutorial, step])

    useEffect(() => {
        if (tutorial) canvasHandlerRef.current.theme = theme
    }, [tutorial, theme])

    if (tutorial === null) return null

    return (
        <div className='game'>
            <div className='sudoku'>
                <CanvasComponent canvasHandler={canvasHandlerRef.current} paused={false} />
            </div>
            <div className='tutorial'>
                <div className='tutorial__controls'>
                    <FontAwesomeIcon icon={faChevronLeft} style={{ visibility: step > 0 ? 'visible' : 'hidden' }} className='tutorial__controls__icon' onClick={() => { if (step > 0) setStep(s => s - 1) }} />
                    <p className='tutorial__controls__step-number'>{`${step + 1}/${tutorial.length}`}</p>
                    <FontAwesomeIcon icon={faChevronRight} style={{ visibility: step < tutorial.length - 1 ? 'visible' : 'hidden' }} className='tutorial__controls__icon' onClick={() => { if (step < tutorial.length - 1) setStep(s => s + 1) }} />
                </div>
                <p className='tutorial__text'>{t(tutorial[step].text)}</p>
                <Button title={t('tutorial.exit')} onClick={quitTutorial} />
            </div>
        </div>
    )
}
