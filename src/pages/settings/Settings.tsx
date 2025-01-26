import './settings.css'
import { useCallback } from 'react'
import { Section, SectionContent, Topbar, ColorChooser, Button } from '../../components'
import { Link, Route, Routes } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faChevronRight, faBorderAll, faGear, faInfo, faHeart, faGlobe } from '@fortawesome/free-solid-svg-icons'
import SettingsItem from '../../components/settingsItem/SettingsItem'
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'
import { colorNames } from '../../utils/Colors'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { AccentColor } from '../../utils/Colors'
import FlagArg from '../../svg/flag_arg'
import FlagUKSVG from '../../svg/flag_uk'
import FlagSpainSVG from '../../svg/flag_spain'
import { useServiceWorker } from '../../components/serviceWorker/useServiceWorker'
import { ThemeName } from '../../game/Themes'
import { Language, useSettings } from '../../utils/SettingsHandler'

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

type AppearanceSettingsProps = {
	theme: ThemeName
	setTheme: (t: ThemeName) => void
	accentColor: AccentColor
	setAccentColor: (c: AccentColor) => void
	accentColorHex: string
}

function AppearanceSettings({ theme, setTheme, accentColor, setAccentColor, accentColorHex }: AppearanceSettingsProps) {
	const { t } = useTranslation()
	const { settings, updateSettings } = useSettings()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAppearance')} backURL="/settings" />
			<SectionContent id="settings">
				<div className="settings__list" >
					<SettingsItem type='theme' theme={theme} onChange={t => { setTheme(t) }} value='' accentColor={accentColor} />
					<SettingsItem title={t('settings.automatic')} onChange={v => { updateSettings({ autoTheme: v }) }} value={settings.autoTheme} accentColorHex={accentColorHex} />
				</div>

				<div className='settings__label'>{t('settings.accentColor')}</div>

				<div style={{ marginBottom: 30 }}>
					<ColorChooser value={accentColor} colors={colorNames.filter(cn => cn !== 'default')} onChange={(c: string) => { setAccentColor(c as AccentColor) }} />
				</div>

				<div className='settings__label'>{t('settings.highContrast')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.candidates')} onChange={v => { updateSettings({ highlightCandidatesWithColor: v }) }} value={settings.highlightCandidatesWithColor} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.grid')} onChange={v => { updateSettings({ highContrastGrid: v }) }} value={settings.highContrastGrid} accentColorHex={accentColorHex} />
				</div>
			</SectionContent>
		</Section>
	)
}

type GameProps = {
	accentColorHex: string
}

function Game({ accentColorHex }: GameProps) {
	const { t } = useTranslation()
	const { settings, updateSettings } = useSettings()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionGame')} backURL="/settings" />
			<SectionContent id="settings">
				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.showErrors')} onChange={v => { updateSettings({ checkErrors: v }) }} value={settings.checkErrors} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.advancedHighlight')} onChange={v => { updateSettings({ advancedHighlight: v }) }} value={settings.advancedHighlight} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.advancedHighlightExplanation')}</p>

				<div className='settings__label'>{t('settings.candidates')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.autoRemove')} onChange={v => { updateSettings({ autoRemoveCandidates: v }) }} value={settings.autoRemoveCandidates} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.showOnlyPossibleValues')} onChange={v => { updateSettings({ showPossibleValues: v }) }} value={settings.showPossibleValues} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.showOnlyPossibleValuesExplanation')}</p>

				<div className='settings__label'>{t('settings.killer')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.killerAutoSolveLastInCage')} onChange={v => { updateSettings({ killerAutoSolveLastInCage: v }) }} value={settings.killerAutoSolveLastInCage} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.killerAutoSolveLastInCageExplanation')}</p>
			</SectionContent>
		</Section>
	)
}

type AdvancedProps = {
	accentColorHex: string
}

function AdvancedSettings({ accentColorHex }: AdvancedProps) {
	const { t } = useTranslation()
	const { settings, updateSettings } = useSettings()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAdvanced')} backURL="/settings" />
			<SectionContent id="settings">
				<div className='settings__label'>{t('settings.inputLock')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.autoChangeInputLock')} onChange={v => { updateSettings({ autoChangeInputLock: v }) }} value={settings.autoChangeInputLock} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.autoChangeInputLockExplanation')}</p>

				<div className='settings__label'>{t('settings.coloredCells')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.clearColorSolved')} onChange={v => { updateSettings({ clearColorOnInput: v }) }} value={settings.clearColorOnInput} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.clearColorFullNotation')} onChange={v => { updateSettings({ clearColorFullNotation: v }) }} value={settings.clearColorFullNotation} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.lockColoredCells')} onChange={v => { updateSettings({ lockCellsWithColor: v }) }} value={settings.lockCellsWithColor} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation' style={{ marginBottom: 10 }}>{t('settings.lockColoredCellsExplanation')}</p>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.autoSolve')} onChange={v => { updateSettings({ autoSolveCellsWithColor: v }) }} value={settings.autoSolveCellsWithColor} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.autoSolveColoredCellsExplanation')}</p>

				<div className='settings__label'>{t('settings.autoSolveTitle')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem title={t('settings.nakedSingle')} onChange={v => { updateSettings({ autoSolveNakedSingles: v }) }} value={settings.autoSolveNakedSingles} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.onlyInBox')} onChange={v => { updateSettings({ autoSolveOnlyInBox: v }) }} value={settings.autoSolveOnlyInBox} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.fullNotation')} onChange={v => { updateSettings({ autoSolveCellsFullNotation: v }) }} value={settings.autoSolveCellsFullNotation} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.fullNotationExplanation')}</p>
			</SectionContent>
		</Section>
	)
}

function LanguageSettings({ accentColorHex }: AdvancedProps) {
	const { t, i18n } = useTranslation()
	const { settings, updateSettings } = useSettings()

	const handleChangeLanguage = useCallback((newLang: Language) => {
		updateSettings({ language: newLang })
		if (newLang === 'auto') {
			i18n.changeLanguage(navigator.language.split('-')[0])
		} else {
			i18n.changeLanguage(newLang)
		}
	}, [i18n, updateSettings])

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionLanguage')} backURL="/settings" />
			<SectionContent id="settings">
				<div className='settings__label'>{t('settings.language')}</div>

				<div className="settings__list" style={{ marginBottom: 0 }}>
					<SettingsItem type='language' language='auto' title={t('settings.languageAuto')} onChange={handleChangeLanguage} value={settings.language === 'auto'} accentColorHex={accentColorHex} />
					<SettingsItem type='language' language='en' icon={<FlagUKSVG className='settings__item__icon' />} title={t('settings.languageEnglish')} onChange={handleChangeLanguage} value={settings.language === 'en'} accentColorHex={accentColorHex} />
					<SettingsItem type='language' language='es' icon={<FlagSpainSVG className='settings__item__icon' />} title={t('settings.languageSpanish')} onChange={handleChangeLanguage} value={settings.language === 'es'} accentColorHex={accentColorHex} />
				</div>
			</SectionContent>
		</Section>
	)
}

function AboutSection() {
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
	const accentColorHex = getComputedStyle(document.documentElement).getPropertyValue(`--${accentColor}`)

	return (
		<Routes>
			<Route path="/" element={<Main />} />
			<Route path='/appearance' element={<AppearanceSettings theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} accentColorHex={accentColorHex} />} />
			<Route path='/game' element={<Game accentColorHex={accentColorHex} />} />
			<Route path='/advanced' element={<AdvancedSettings accentColorHex={accentColorHex} />} />
			<Route path='/language' element={<LanguageSettings accentColorHex={accentColorHex} />} />
			<Route path='/about' element={<AboutSection />} />
		</Routes>
	)
}
