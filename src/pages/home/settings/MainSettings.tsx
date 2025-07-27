import { faMoon, faPencilAlt, faPalette, faXmark, faToolbox, faGear } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components';
import { useServiceWorker } from '../../../components/serviceWorker/useServiceWorker';
import { SettingsContext } from '../../../utils/hooks/SettingsHandler';
import './mainSettings.css';
import SectionLink from '../../../components/sectionLink/SectionLink';
import { useContext } from 'react';

export default function MainSettings() {
    const { t } = useTranslation();
    const { isUpdateAvailable, updateAssets } = useServiceWorker();
    const { settings } = useContext(SettingsContext);

    return (
        <div className='home__settings'>
            <div className='home__section__title-wrapper'>
                <p className='home__section-title'>{t('sectionNames.settings')}</p>
            </div>

            <div className='home__settings-wrapper'>
                <div className="settings__list">
                    <SectionLink color='var(--purple)' icon={faMoon} iconColor='white' title={t('settings.sectionAppearance')} link='/settings/appearance' />
                    <SectionLink color='var(--darkBlue)' icon={faPencilAlt} iconColor='white' title={t('settings.sectionAnnotations')} link='/settings/annotations' />
                    <SectionLink color='var(--green)' icon={faPalette} iconColor='white' title={t('settings.sectionColor')} link='/settings/color' />
                    <SectionLink color='var(--red)' icon={faXmark} iconColor='white' title={t('settings.sectionErrors')} link='/settings/errors' additionalInfo={settings.showErrors ? t('settings.errorsOn') : t('settings.errorsOff')} />
                </div>

                <div className="settings__list">
                    <SectionLink color='var(--lightGray)' icon={faToolbox} iconColor='darkGray' title={t('settings.sectionAdvanced')} link='/settings/advanced' />
                    <SectionLink color='var(--lightGray)' icon={faGear} iconColor='darkGray' title={t('settings.sectionGeneral')} link='/settings/general' />
                </div>

                {
                    isUpdateAvailable && (
                        <Button title={t('settings.update')} backgroundColor='var(--green)' onClick={updateAssets} />
                    )
                }
            </div>
        </div>
    );
}
