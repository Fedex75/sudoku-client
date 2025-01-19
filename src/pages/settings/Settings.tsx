import './settings.css'
import { useCallback, useState } from 'react'
import { Section, SectionContent, Topbar, ColorChooser, Button } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import { Link, Route, Routes } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faChevronRight, faBorderAll, faGear, faInfo, faHeart, faGlobe } from '@fortawesome/free-solid-svg-icons'
import SettingsItem from '../../components/settingsItem/SettingsItem'
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'
import { colorNames } from '../../utils/Colors'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { ThemeName } from '../../utils/DataTypes'
import { AccentColor } from '../../utils/Colors'
import FlagArg from '../../svg/flag_arg'
import FlagUKSVG from '../../svg/flag_uk'
import FlagSpainSVG from '../../svg/flag_spain'
import { useServiceWorker } from '../../components/serviceWorker/useServiceWorker'

type SectionLinkProps = {
	color: string
	icon: IconDefinition
	title: string
	link: string
}

function SectionLink({ color, icon, title, link }: SectionLinkProps) {
	return (
		<Link to={link} className='settings__section-link'>
			<div className='settings__section-link__icon' style={{ backgroundColor: color }}><FontAwesomeIcon icon={icon} color={link === 'advanced' ? 'gray' : 'white'} /></div>
			<div className='settings__section-link__right-wrapper'>
				<p>{title}</p>
				<FontAwesomeIcon icon={faChevronRight} color='gray' />
			</div>
		</Link>
	)
}

function Main() {
	const { t } = useTranslation()
	const { isUpdateAvailable, updateAssets } = useServiceWorker()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} backURL="/" />
			<SectionContent id="settings">
				<div className="settings__section__list">
					<SectionLink color='var(--darkBlue)' icon={faPalette} title={t('settings.sectionAppearance')} link='appearance' />
					<SectionLink color='var(--red)' icon={faBorderAll} title={t('settings.sectionGame')} link='game' />
					<SectionLink color='var(--lightGray)' icon={faGear} title={t('settings.sectionAdvanced')} link='advanced' />
					<SectionLink color='var(--darkBlue)' icon={faGlobe} title={t('settings.sectionLanguage')} link='language' />
					<SectionLink color='var(--darkBlue)' icon={faInfo} title={t('settings.sectionAbout')} link='about' />
				</div>

				{
					isUpdateAvailable && (
						<Button title={t('settings.update')} backgroundColor='var(--green)' onClick={updateAssets} />
					)
				}
			</SectionContent>
		</Section>
	)
}

type AppearanceProps = {
	handleSettingChange: (name: string, c: any) => void
	theme: ThemeName
	setTheme: (t: ThemeName) => void
	accentColor: AccentColor
	setAccentColor: (c: AccentColor) => void
	accentColorHex: string
}

function Appearance({ handleSettingChange, theme, setTheme, accentColor, setAccentColor, accentColorHex }: AppearanceProps) {
	const { t } = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAppearance')} backURL="/settings" />
			<SectionContent id="settings">
				<div className="settings__list" >
					<SettingsItem title='' name='' handleSettingChange={handleSettingChange} type='theme' theme={theme} setTheme={(t: string) => { setTheme(t as ThemeName) }} accentColor={accentColor} />
					<SettingsItem title={t('settings.automatic')} name='autoTheme' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<div className='settings__label'>{t('settings.accentColor')}</div>

				<div style={{ marginBottom: 30 }}>
					<ColorChooser value={accentColor} colors={colorNames.filter(cn => cn !== 'default')} onChange={(c: string) => { setAccentColor(c as AccentColor) }} />
				</div>

				<div className='settings__label'>{t('settings.highContrast')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.candidates')} name='highlightCandidatesWithColor' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.grid')} name='highContrastGrid' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>
			</SectionContent>
		</Section>
	)
}

type GameProps = {
	handleSettingChange: (name: string, c: any) => void
	accentColorHex: string
}

function Game({ handleSettingChange, accentColorHex }: GameProps) {
	const { t } = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionGame')} backURL="/settings" />
			<SectionContent id="settings">
				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.showErrors')} name='checkMistakes' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.advancedHighlight')} name='advancedHighlight' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.advancedHighlightExplanation')}</p>

				<div className='settings__label'>{t('settings.candidates')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.autoRemove')} name='autoRemoveCandidates' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.showOnlyPossibleValues')} name='showPossibleValues' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.showOnlyPossibleValuesExplanation')}</p>

				<div className='settings__label'>{t('settings.killer')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.killerAutoSolveLastInCage')} name='killerAutoSolveLastInCage' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.killerAutoSolveLastInCageExplanation')}</p>
			</SectionContent>
		</Section>
	)
}

type AdvancedProps = {
	handleSettingChange: (name: string, c: any) => void
	accentColorHex: string
}

function Advanced({ handleSettingChange, accentColorHex }: AdvancedProps) {
	const { t } = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAdvanced')} backURL="/settings" />
			<SectionContent id="settings">
				<div className='settings__label'>{t('settings.inputLock')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.autoChangeInputLock')} name='autoChangeInputLock' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.autoChangeInputLockExplanation')}</p>

				<div className='settings__label'>{t('settings.coloredCells')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.clearColorSolved')} name='clearColorOnInput' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.clearColorFullNotation')} name='clearColorFullNotation' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.lockColoredCells')} name='lockCellsWithColor' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation' style={{ marginBottom: 10 }}>{t('settings.lockColoredCellsExplanation')}</p>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.autoSolve')} name='autoSolveCellsWithColor' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.autoSolveColoredCellsExplanation')}</p>

				<div className='settings__label'>{t('settings.autoSolveTitle')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.nakedSingle')} name='autoSolveNakedSingles' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.onlyInBox')} name='autoSolveOnlyInBox' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.fullNotation')} name='autoSolveCellsFullNotation' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.fullNotationExplanation')}</p>
			</SectionContent>
		</Section>
	)
}

function Language({ handleSettingChange, accentColorHex }: AdvancedProps) {
	const { t, i18n } = useTranslation()

	const handleChangeLanguage = useCallback((settingName: string, newLang: string) => {
		handleSettingChange('language', newLang)
		if (newLang === 'auto') {
			i18n.changeLanguage(navigator.language.split('-')[0])
		} else {
			i18n.changeLanguage(newLang)
		}
	}, [handleSettingChange, i18n])

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionLanguage')} backURL="/settings" />
			<SectionContent id="settings">
				<div className='settings__label'>{t('settings.language')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem type='language' language='auto' title={t('settings.languageAuto')} handleSettingChange={handleChangeLanguage} accentColorHex={accentColorHex} />
					<SettingsItem type='language' language='en' icon={<FlagUKSVG className='settings__item__icon' />} title={t('settings.languageEnglish')} handleSettingChange={handleChangeLanguage} accentColorHex={accentColorHex} />
					<SettingsItem type='language' language='es' icon={<FlagSpainSVG className='settings__item__icon' />} title={t('settings.languageSpanish')} handleSettingChange={handleChangeLanguage} accentColorHex={accentColorHex} />
				</div>
			</SectionContent>
		</Section>
	)
}

function About() {
	const { t } = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAbout')} backURL="/settings" />
			<SectionContent id="settings">
				<div className="settings__list">
					<SettingsItem type='info' title={t('settings.version')} info={API.clientVersion} />
				</div>

				<p style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', gap: 7, alignItems: 'center', color: 'var(--primaryTextColor)', textAlign: 'center' }}>{t('settings.madeWith')} <FontAwesomeIcon icon={faHeart} color='var(--darkRed)' /> {t('settings.inArgentina')} <FlagArg className='about__flag-argentina' /> </p>
			</SectionContent>
		</Section>
	)
}

type SettingsProps = {
	theme: ThemeName
	setTheme: (t: ThemeName) => void
	accentColor: AccentColor
	setAccentColor: (c: AccentColor) => void
}

export default function Settings({ theme, setTheme, accentColor, setAccentColor }: SettingsProps) {
	const [, setRender] = useState(0)

	const accentColorHex = getComputedStyle(document.documentElement).getPropertyValue(`--${accentColor}`)

	const handleSettingChange = useCallback((name: string, value: any) => {
		SettingsHandler.setSetting(name, value)
		setRender(r => r === 100 ? 0 : r + 1)
	}, [])

	return (
		<Routes>
			<Route path="/" element={<Main />} />
			<Route path='/appearance' element={<Appearance theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />} />
			<Route path='/game' element={<Game handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />} />
			<Route path='/advanced' element={<Advanced handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />} />
			<Route path='/language' element={<Language handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />} />
			<Route path='/about' element={<About />} />
		</Routes>
	)
}
