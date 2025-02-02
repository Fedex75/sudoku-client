import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Section, SectionContent, Topbar } from '../../components'
import { GameModeName } from '../../utils/Difficulties'
import GameHandler from '../../utils/GameHandler'
import { convertMillisecondsToHMS } from '../../utils/Statistics'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './statistics.css'

export default function Statistics() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const gameMode = searchParams.get('mode')
    if (!gameMode) navigate('/home/statistics')

    const difficulties = useMemo(() => {
        const diffs = Object.entries(GameHandler.statistics[gameMode as GameModeName])
        if (diffs.length === 0) navigate('/home/statistics')
        return diffs
    }, [gameMode, navigate])

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
