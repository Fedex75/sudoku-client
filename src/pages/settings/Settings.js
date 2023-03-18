import './settings.css'
import { useRef, useState } from 'react'
import { Section, SectionContent, Topbar, ExpandCard, ColorChooser, Button, ActionSheet, ActionSheetButton } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import { Link, Route, Routes } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faChevronRight, faBorderAll, faGear, faInfo, faHeart } from '@fortawesome/free-solid-svg-icons'
import SettingsItem from '../../components/settingsItem/SettingsItem'
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'
import GameHandler from '../../utils/GameHandler'

function SectionLink({color, icon, title, link}){
	return (
		<ExpandCard>
			<Link to={link} className='settings__section-link'>
				<div className='settings__section-link__icon' style={{backgroundColor: color}}><FontAwesomeIcon icon={icon} color={link === 'advanced' ? 'gray' : 'white'}/></div>
				<p>{title}</p>
				<FontAwesomeIcon icon={faChevronRight} color='gray'/>
			</Link>
		</ExpandCard>
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

function Appearance({handleSettingChange, theme, setTheme, accentColor, setAccentColor}){
	const {t} = useTranslation()
	
	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAppearance')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list" >
					<SettingsItem title='' name='' handleSettingChange={handleSettingChange} type='theme' theme={theme} setTheme={setTheme} accentColor={accentColor} />
					<SettingsItem title={t('settings.automatic')} name='autoTheme' handleSettingChange={handleSettingChange} />
				</div>

				<div className='settings__label'>{t('settings.accentColor')}</div>

				<ExpandCard style={{marginBottom: 30}}>
					<ColorChooser value={accentColor} colors={['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple']} onChange={setAccentColor} />
				</ExpandCard>

				<div className='settings__label'>{t('settings.candidates')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.highlightWithColor')} name='highlightCandidatesWithColor' handleSettingChange={handleSettingChange} />
				</div>
			</SectionContent>
		</Section>
	)
}

function Game({handleSettingChange}){
	const {t} = useTranslation()
	
	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionGame')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.showErrors')} name='checkMistakes' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.advancedHighlight')} name='advancedHighlight' handleSettingChange={handleSettingChange} />
				</div>
				
				<p className='settings__explanation'>{t('settings.advancedHighlightExplanation')}</p>

				<div className='settings__label'>{t('settings.candidates')}</div>
				
				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.autoRemove')} name='autoRemoveCandidates' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.showOnlyPossibleValues')} name='showPossibleValues' handleSettingChange={handleSettingChange} />
				</div>

				<p className='settings__explanation'>{t('settings.showOnlyPossibleValuesExplanation')}</p>

				<div className='settings__label'>{t('settings.killer')}</div>
				
				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.killerAutoSolveLastInCage')} name='killerAutoSolveLastInCage' handleSettingChange={handleSettingChange} />
				</div>

				<p className='settings__explanation'>{t('settings.killerAutoSolveLastInCageExplanation')}</p>
			</SectionContent>
		</Section>
	)
}

function Advanced({handleSettingChange}){
	const {t} = useTranslation()

	const resetStatisticsActionSheetRef = useRef()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAdvanced')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className='settings__label'>{t('settings.inputLock')}</div>
				
				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.autoChangeInputLock')} name='autoChangeInputLock' handleSettingChange={handleSettingChange} />
				</div>

				<p className='settings__explanation'>{t('settings.autoChangeInputLockExplanation')}</p>

				<div className='settings__label'>{t('settings.coloredCells')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.clearColorSolved')} name='clearColorOnInput' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.clearColorFullNotation')} name='clearColorFullNotation' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.lockColoredCells')} name='lockCellsWithColor' handleSettingChange={handleSettingChange} />
				</div>

				<p className='settings__explanation' style={{marginBottom: 10}}>{t('settings.lockColoredCellsExplanation')}</p>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.autoSolve')} name='autoSolveCellsWithColor' handleSettingChange={handleSettingChange} />
				</div>

				<p className='settings__explanation'>{t('settings.autoSolveColoredCellsExplanation')}</p>

				<div className='settings__label'>{t('settings.autoSolveTitle')}</div>

				<div className="settings__list" style={{marginBottom: 0}}>
					<SettingsItem title={t('settings.nakedSingle')} name='autoSolveNakedSingles' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.onlyInBox')} name='autoSolveOnlyInBox' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.fullNotation')} name='autoSolveCellsFullNotation' handleSettingChange={handleSettingChange} />
				</div>

				<p className='settings__explanation'>{t('settings.fullNotationExplanation')}</p>

				<div className='settings__label'>{t('settings.statistics')}</div>

				<Button title={t('settings.resetStatistics')} color='var(--red)' backgroundColor='transparent' borderColor='var(--secondaryTextColor)' fontSize={18} onClick={() => {
					resetStatisticsActionSheetRef.current.open()
				}} />
			</SectionContent>

			<ActionSheet
				reference={resetStatisticsActionSheetRef}
				cancelTitle={t('common.cancel')}
			>
				<ActionSheetButton title={t('settings.resetStatistics')} color='var(--red)' onClick={() => {
					GameHandler.resetStatistics()
					resetStatisticsActionSheetRef.current.close()
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

export default function Settings({theme, setTheme, accentColor, setAccentColor}){
	const [, setRender] = useState(0)

	function handleSettingChange(name, value){
		SettingsHandler.setSetting(name, value)
		setRender(r => r === 100 ? 0 : r+1)
	}

	return (
		<Routes>
			<Route path="/" element={<Main />} />
			<Route path='/appearance' element={<Appearance theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor}  handleSettingChange={handleSettingChange} />} />
			<Route path='/game' element={<Game handleSettingChange={handleSettingChange} />} />
			<Route path='/advanced' element={<Advanced handleSettingChange={handleSettingChange} />} />
			<Route path='/about' element={<About/>} />
		</Routes>
	)
}