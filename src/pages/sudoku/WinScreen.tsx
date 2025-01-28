import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../../components"
import { AccentColor } from "../../utils/Colors"
import { DifficultyName, difficulties } from "../../utils/Difficulties"
import GameHandler from "../../utils/GameHandler"
import { convertMillisecondsToHMS } from "../../utils/Statistics"
import Board from '../../utils/Board'

interface WinScreenProps {
    handleNewGameClick: () => void
    handleNewGame: (diff: DifficultyName) => void
    game: Board
    accentColor: AccentColor
}

export function WinScreen({ handleNewGameClick, handleNewGame, game, accentColor }: WinScreenProps) {
    const { t } = useTranslation()

    const nextDifficulty = useMemo(() => {
        if (!game) return null
        const diffs = difficulties[game.mode]
        const index = diffs.indexOf(game.difficulty)
        if (index !== -1 && index < diffs.length - 1) {
            return diffs[index + 1]
        } else {
            return null
        }
    }, [game])

    if (!game) return null
    if (!GameHandler.complete) return null

    return (
        <div className='sudoku__win-screen-wrapper'>
            <div className='sudoku__win-screen'>
                <div className='sudoku__win-screen__title'>{t('sudoku.excellent')}</div>
                <div className='sudoku__win-screen__stats'>
                    <div className='sudoku__win-screen__stat'>
                        <div className='sudoku__win-screen__stat__title'>{t('sudoku.time')}</div>
                        <div className='sudoku__win-screen__stat__value'>{convertMillisecondsToHMS(game.timer)}</div>
                    </div>
                    <div className='sudoku__win-screen__stat'>
                        <div className='sudoku__win-screen__stat__title'>{t('sudoku.average')}</div>
                        <div className='sudoku__win-screen__stat__value'>{convertMillisecondsToHMS(GameHandler.statistics[game.mode][game.difficulty]!.average)}</div>
                    </div>
                    <div className='sudoku__win-screen__stat'>
                        <div className='sudoku__win-screen__stat__title'>{t('sudoku.best')}</div>
                        <div className='sudoku__win-screen__stat__value'>{convertMillisecondsToHMS(GameHandler.statistics[game.mode][game.difficulty]!.best)}</div>
                    </div>
                </div>
                <Button title={t('sudoku.newGame')} onClick={handleNewGameClick} marginBottom={30} />
                {
                    nextDifficulty !== null ?
                        <Button title={t('sudoku.increaseDifficulty') + ' ' + t(`gameDifficulties.${nextDifficulty}`)} fontSize={16} backgroundColor={accentColor === 'purple' ? 'var(--orange)' : 'var(--purple)'} onClick={() => { handleNewGame(nextDifficulty) }} />
                        : null
                }
            </div>
        </div>
    )
}
