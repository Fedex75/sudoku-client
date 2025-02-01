import { useTranslation } from "react-i18next"
import './mainStatistics.css'
import GameHandler from "../../../utils/GameHandler"
import { useCallback } from "react"
import { Button } from "../../../components"
import SectionLink from '../../../components/sectionLink/SectionLink'

type Props = {
    requestPrompt: (prompt: string, onConfirm: () => void, onCancel: () => void) => void
}

export default function MainStatistics({ requestPrompt }: Props) {
    const { t } = useTranslation()

    const handleResetStatistics = useCallback(() => {
        requestPrompt(
            t('statistics.promptReset'),
            () => {
                GameHandler.resetStatistics()
            },
            () => { }
        )
    }, [t, requestPrompt])

    return (
        <div className='home__statistics'>
            <div className='home__section__title-wrapper'>
                <p className='home__section-title'>{t('sectionNames.statistics')}</p>
            </div>

            <div className='home__statistics-wrapper'>
                <div className='settings__list'>
                    {
                        Object.entries(GameHandler.statistics).map(([gameMode]) => (
                            <SectionLink key={gameMode} title={t(`gameModes.${gameMode}`)} link={`/statistics?mode=${gameMode}`} />
                        ))
                    }
                </div>

                <Button title={t('common.reset')} backgroundColor='var(--red)' color='white' onClick={() => { handleResetStatistics() }} />
            </div>
        </div>
    )
}
