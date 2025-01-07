import './settings.css'
import { useRef, useState } from 'react'
import { Section, SectionContent, Topbar, ColorChooser, Button, ActionSheet, ActionSheetButton } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import { Link, Route, Routes } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faChevronRight, faBorderAll, faGear, faInfo, faHeart } from '@fortawesome/free-solid-svg-icons'
import SettingsItem from '../../components/settingsItem/SettingsItem'
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'
import GameHandler from '../../utils/GameHandler'
import { colorNames } from '../../utils/Colors'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { ActionSheetRef } from 'actionsheet-react'
import { ThemeName } from '../../utils/DataTypes'
import { AccentColor } from '../../utils/Colors'

type SectionLinkProps = {
	color: string;
	icon: IconDefinition;
	title: string;
	link: string;
}

function SectionLink({color, icon, title, link}: SectionLinkProps){
	return (
		<div>
			<Link to={link} className='settings__section-link'>
				<div className='settings__section-link__icon' style={{backgroundColor: color}}><FontAwesomeIcon icon={icon} color={link === 'advanced' ? 'gray' : 'white'}/></div>
				<p>{title}</p>
				<FontAwesomeIcon icon={faChevronRight} color='gray'/>
			</Link>
		</div>
	)
}

function Main(){
	const {t} = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} backURL="/" />
			<SectionContent id="settings">
				<div className="settings__section__list">
					<SectionLink color='var(--darkBlue)' icon={faPalette} title={t('settings.sectionAppearance')} link='appearance'/>
					<SectionLink color='var(--red)' icon={faBorderAll} title={t('settings.sectionGame')} link='game'/>
					<SectionLink color='var(--lightGray)' icon={faGear} title={t('settings.sectionAdvanced')} link='advanced'/>
					<SectionLink color='var(--darkBlue)' icon={faInfo} title={t('settings.sectionAbout')} link='about'/>
				</div>
			</SectionContent>
		</Section>
	)
}

type AppearanceProps = {
	handleSettingChange: (name: string, c: any) => void;
	theme: ThemeName;
	setTheme: (t: ThemeName) => void;
	accentColor: AccentColor;
	setAccentColor: (c: AccentColor) => void;
	accentColorHex: string;
}

function Appearance({handleSettingChange, theme, setTheme, accentColor, setAccentColor, accentColorHex}: AppearanceProps){
	const {t} = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAppearance')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list" >
					<SettingsItem title='' name='' handleSettingChange={handleSettingChange} type='theme' theme={theme} setTheme={(t: string) => {setTheme(t as ThemeName)}} accentColor={accentColor} />
					<SettingsItem title={t('settings.automatic')} name='autoTheme' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<div className='settings__label'>{t('settings.accentColor')}</div>

				<div style={{marginBottom: 30}}>
					<ColorChooser value={accentColor} colors={colorNames.filter(cn => cn !== 'default')} onChange={(c: string) => {setAccentColor(c as AccentColor)}} />
				</div>

				<div className='settings__label'>{t('settings.highContrast')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.candidates')} name='highlightCandidatesWithColor' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.grid')} name='highContrastGrid' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>
			</SectionContent>
		</Section>
	)
}

type GameProps = {
	handleSettingChange: (name: string, c: any) => void;
	accentColorHex: string;
}

function Game({handleSettingChange, accentColorHex}: GameProps){
	const {t} = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionGame')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.showErrors')} name='checkMistakes' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.advancedHighlight')} name='advancedHighlight' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.advancedHighlightExplanation')}</p>

				<div className='settings__label'>{t('settings.candidates')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.autoRemove')} name='autoRemoveCandidates' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.showOnlyPossibleValues')} name='showPossibleValues' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.showOnlyPossibleValuesExplanation')}</p>

				<div className='settings__label'>{t('settings.killer')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.killerAutoSolveLastInCage')} name='killerAutoSolveLastInCage' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.killerAutoSolveLastInCageExplanation')}</p>
			</SectionContent>
		</Section>
	)
}

type AdvancedProps = {
	handleSettingChange: (name: string, c: any) => void;
	accentColorHex: string;
}

function Advanced({handleSettingChange, accentColorHex}: AdvancedProps){
	const [resetStatisticsActionSheetIsOpen, setResetStatisticsActionSheetIsOpen] = useState(false)

	const {t} = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAdvanced')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className='settings__label'>{t('settings.inputLock')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.autoChangeInputLock')} name='autoChangeInputLock' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.autoChangeInputLockExplanation')}</p>

				<div className='settings__label'>{t('settings.coloredCells')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.clearColorSolved')} name='clearColorOnInput' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.clearColorFullNotation')} name='clearColorFullNotation' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.lockColoredCells')} name='lockCellsWithColor' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation' style={{marginBottom: 10}}>{t('settings.lockColoredCellsExplanation')}</p>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.autoSolve')} name='autoSolveCellsWithColor' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.autoSolveColoredCellsExplanation')}</p>

				<div className='settings__label'>{t('settings.autoSolveTitle')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.nakedSingle')} name='autoSolveNakedSingles' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.onlyInBox')} name='autoSolveOnlyInBox' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
					<SettingsItem title={t('settings.fullNotation')} name='autoSolveCellsFullNotation' handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />
				</div>

				<p className='settings__explanation'>{t('settings.fullNotationExplanation')}</p>

				<div className='settings__label'>{t('settings.statistics')}</div>

				<Button title={t('settings.resetStatistics')} color='white' backgroundColor='var(--red)' fontSize={18} onClick={() => {
					setResetStatisticsActionSheetIsOpen(true)
				}} />
			</SectionContent>

			<ActionSheet
				isOpen={resetStatisticsActionSheetIsOpen}
				cancelTitle={t('common.cancel')}
				onClose={() => {setResetStatisticsActionSheetIsOpen(false)}}
			>
				<ActionSheetButton title={t('settings.resetStatistics')} color='var(--red)' onClick={() => {
					GameHandler.resetStatistics()
					setResetStatisticsActionSheetIsOpen(false)
				}} />
			</ActionSheet>
		</Section>
	)
}

function About(){
	const {t} = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAbout')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list">
					<SettingsItem type='info' title={t('settings.version')} info={API.clientVersion} />
				</div>

				<p style={{color: 'var(--primaryTextColor)', textAlign: 'center'}}>{t('settings.madeWith')} <FontAwesomeIcon icon={faHeart} color='var(--darkRed)' /> {t('settings.inArgentina')} 🇦🇷 </p>
			</SectionContent>
		</Section>
	)
}

type SettingsProps = {
	theme: ThemeName;
	setTheme: (t: ThemeName) => void;
	accentColor: AccentColor;
	setAccentColor: (c: AccentColor) => void;
}

export default function Settings({theme, setTheme, accentColor, setAccentColor}: SettingsProps){
	const [, setRender] = useState(0)

	const accentColorHex = getComputedStyle(document.documentElement).getPropertyValue(`--${accentColor}`)

	function handleSettingChange(name: string, value: any){
		SettingsHandler.setSetting(name, value)
		setRender(r => r === 100 ? 0 : r+1)
	}

	return (
		<Routes>
			<Route path="/" element={<Main />} />
			<Route path='/appearance' element={<Appearance theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor}  handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />} />
			<Route path='/game' element={<Game handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />} />
			<Route path='/advanced' element={<Advanced handleSettingChange={handleSettingChange} accentColorHex={accentColorHex} />} />
			<Route path='/about' element={<About />} />
		</Routes>
	)
}
