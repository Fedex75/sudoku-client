import { faTrash, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionSheet, ActionSheetButton, ColorChooser, Section, SectionContent, SettingsItem, Topbar } from '../../components'
import TabSwitcher from '../../components/tabSwitcher/TabSwitcher'
import { GameModeName } from '../../utils/Difficulties'
import GameHandler from '../../utils/GameHandler'
import { convertMillisecondsToHMS } from '../../utils/Statistics'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './statistics.css'

export default function Statistics() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const gameMode = searchParams.get('mode')

    useEffect(() => {
        if (!gameMode) {
            navigate('/home/statistics')
        }
    }, [navigate, gameMode])

    const difficulties = useMemo(() => {
        return Object.entries(GameHandler.statistics[gameMode as GameModeName])
    }, [gameMode])

    useEffect(() => {
        if (difficulties.length === 0) navigate('/home/statistics')
    }, [difficulties])

    const { t } = useTranslation()

    return (
        <Section>
            <Topbar title={t('sectionNames.statistics')} subtitle={t(`gameModes.${gameMode}`)} backURL="/home/statistics" />
            <SectionContent id="statistics">
                <div className='home__statistics-list'>
                    {
                        difficulties.map(([diff, data]) => (
                            <div key={diff} className='home__statistics-list__item' >
                                <div className='home__statistics-list__item__difficulty-name'>{t(`gameDifficulties.${diff}`)}</div>

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
                        ))
                    }
                </div>
            </SectionContent>
        </Section>
    )
}
