import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash } from "@fortawesome/free-solid-svg-icons"
import './mainStatistics.css'
import GameHandler from "../../../utils/GameHandler"
import { useCallback, useState } from "react"
import { ActionSheet, ActionSheetButton, Button } from "../../../components"
import TabSwitcher from '../../../components/tabSwitcher/TabSwitcher'
import SectionLink from '../../../components/sectionLink/SectionLink'

export default function MainStatistics() {
    const [resetStatisticsActionSheetIsOpen, setResetStatisticsActionSheetIsOpen] = useState(false)

    const { t } = useTranslation()

    const resetStatistics = useCallback(() => {
        GameHandler.resetStatistics()
        setResetStatisticsActionSheetIsOpen(false)
    }, [])

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

                <Button title={t('common.reset')} backgroundColor='var(--red)' color='white' onClick={() => { setResetStatisticsActionSheetIsOpen(true) }} />
            </div>

            <TabSwitcher selected='statistics' />

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
