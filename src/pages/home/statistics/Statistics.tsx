import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBookmark, faChartSimple, faChevronLeft, faChevronRight, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons"
import './statistics.css'
import { ThemeName } from "../../../utils/DataTypes"
import { AccentColor } from "../../../utils/Colors"
import GameHandler from "../../../utils/GameHandler"
import { useCallback, useState } from "react"
import { GameModeName } from "../../../utils/Difficulties"
import { convertMillisecondsToHMS } from "../../../utils/Statistics"
import { ActionSheet, ActionSheetButton } from "../../../components"

type Props = {
    theme: ThemeName
    accentColor: AccentColor
}

type SelectedDifficulties = { [key: string]: number }

export default function Statistics({ theme, accentColor }: Props) {
    const [selectedDifficulties, setSelectedDifficulties] = useState<SelectedDifficulties>(Object.fromEntries(Object.entries(GameHandler.statistics).map(([gameMode, difficulties]) => [gameMode, 0])))
    const [resetStatisticsActionSheetIsOpen, setResetStatisticsActionSheetIsOpen] = useState(false)

    const { t } = useTranslation()

    const decreaseDifficulty = useCallback((gameMode: GameModeName) => {
        if (selectedDifficulties[gameMode] > 0) {
            setSelectedDifficulties({
                ...selectedDifficulties,
                [gameMode]: selectedDifficulties[gameMode] - 1
            })
        }
    }, [selectedDifficulties])

    const increaseDifficulty = useCallback((gameMode: GameModeName) => {
        if (selectedDifficulties[gameMode] < Object.entries(GameHandler.statistics[gameMode]).length - 1) {
            setSelectedDifficulties({
                ...selectedDifficulties,
                [gameMode]: selectedDifficulties[gameMode] + 1
            })
        }
    }, [selectedDifficulties])

    const resetStatistics = useCallback(() => {
        GameHandler.resetStatistics()
        setResetStatisticsActionSheetIsOpen(false)
    }, [])

    return (
        <div className='home__statistics'>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto fit-content(0)', paddingRight: 10, alignItems: 'center' }}>
                <p className='home__section-title'>{t('home.statistics')}</p>
                <FontAwesomeIcon icon={faTrash} style={{ color: 'var(--red)' }} fontSize={20} onClick={() => { setResetStatisticsActionSheetIsOpen(true) }} />
            </div>

            <div className='home__statistics-list'>
                {
                    Object.entries(GameHandler.statistics).map(([gameMode, difficulties]) => {
                        const [selectedDifficultyName, data] = Object.entries(GameHandler.statistics[gameMode as GameModeName])[selectedDifficulties[gameMode]]
                        return (
                            <div key={gameMode} className='home__statistics-list__item' >
                                <p className='home__statistics-list__item__title'>{t(`gameModes.${gameMode}`)}</p>
                                <div className='home__statistics-list__item__difficulty-wrapper'>
                                    <div className='home__statistics-list__item__difficulty-control' onClick={() => { decreaseDifficulty(gameMode as GameModeName) }}><FontAwesomeIcon icon={faChevronLeft} /></div>
                                    <div className='home__statistics-list__item__difficulty-name'>{selectedDifficulties ? t(`gameDifficulties.${selectedDifficultyName}`) : ''}</div>
                                    <div className='home__statistics-list__item__difficulty-control' onClick={() => { increaseDifficulty(gameMode as GameModeName) }}><FontAwesomeIcon icon={faChevronRight} /></div>
                                </div>
                                <div className='home__statistics-list__item__data'>
                                    <div className='home__statistics-list__item__data__item'>
                                        <p>Games played</p>
                                        <p>{data.count}</p>
                                    </div>
                                    <div className='home__statistics-list__item__data__item'>
                                        <p>Average time</p>
                                        <p>{convertMillisecondsToHMS(data.average)}</p>
                                    </div>
                                    <div className='home__statistics-list__item__data__item'>
                                        <p>Best time</p>
                                        <p>{convertMillisecondsToHMS(data.best)}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <div className='home__tabSwitcher-wrapper'>
                <div className='home__tabSwitcher'>
                    <Link to="/home">
                        <div className='home__tabSwitcher__tab'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faPlay} />
                        </div>
                    </Link>
                    <Link to="/home/bookmarks">
                        <div className='home__tabSwitcher__tab'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faBookmark} />
                        </div>
                    </Link>
                    <Link to="/home/statistics">
                        <div className='home__tabSwitcher__tab selected'>
                            <FontAwesomeIcon className='home__tabSwitcher__icon' icon={faChartSimple} />
                        </div>
                    </Link>
                </div>
            </div>

            <ActionSheet
                isOpen={resetStatisticsActionSheetIsOpen}
                title={t('statistics.promptReset')}
                cancelTitle={t('common.cancel')}
                buttonsMode
                onClose={() => { setResetStatisticsActionSheetIsOpen(false) }}
            >
                <ActionSheetButton title={t('common.reset')} color="var(--red)" onClick={resetStatistics} />
            </ActionSheet>
        </div>
    )
}
