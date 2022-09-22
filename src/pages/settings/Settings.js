import './settings.css'
import { useState } from 'react'
import { Section, SectionContent, Topbar, ExpandCard, ColorChooser } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import { Link, Route, Routes } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faChevronRight, faBorderAll, faGear, faInfo, faHeart } from '@fortawesome/free-solid-svg-icons'
import SettingsItem from '../../components/settingsItem/SettingsItem'
import API from '../../utils/API'
import { useTranslation } from 'react-i18next'

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
				<div className="settings__section__list fade_in">
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
				<div className="settings__list fade_in" >
					<SettingsItem title='' name='' handleSettingChange={handleSettingChange} type='theme' theme={theme} setTheme={setTheme} accentColor={accentColor} />
					<SettingsItem title={t('settings.automatic')} name='autoTheme' handleSettingChange={handleSettingChange} />
				</div>

				<div className='settings__label fade_in'>{t('settings.accentColor')}</div>

				<ExpandCard className='fade_in'>
					<ColorChooser value={accentColor} colors={['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple']} onChange={setAccentColor} />
				</ExpandCard>
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
				<div className="settings__list fade_in">
					<SettingsItem title={t('settings.showErrors')} name='checkMistakes' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.advancedHighlight')} name='advancedHighlight' handleSettingChange={handleSettingChange} />
				</div>
				
				<div className='settings__label fade_in'>{t('settings.candidates')}</div>
				
				<div className="settings__list fade_in">
					<SettingsItem title={t('settings.showOnlyPossibleValues')} name='showPossibleValues' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.autoRemove')} name='autoRemoveCandidates' handleSettingChange={handleSettingChange} />
				</div>
			</SectionContent>
		</Section>
	)
}

function Advanced({handleSettingChange}){
	const {t} = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAdvanced')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className='settings__label fade_in'>{t('settings.inputLock')}</div>
				
				<div className="settings__list fade_in">
					<SettingsItem title={t('settings.autoChange')} name='autoChangeInputLock' handleSettingChange={handleSettingChange} />
				</div>

				<div className='settings__label fade_in'>{t('settings.coloredCells')}</div>

				<div className="settings__list fade_in">
					<SettingsItem title={t('settings.lock')} name='lockCellsWithColor' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.autoSolve')} name='autoSolveCellsWithColor' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.clearColorSolved')} name='clearColorOnInput' handleSettingChange={handleSettingChange} />
				</div>

				<div className='settings__label fade_in'>{t('settings.autoSolveTitle')}</div>

				<div className="settings__list fade_in">
					<SettingsItem title={t('settings.fullNotation')} name='autoSolveCellsFullNotation' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.nakedSingle')} name='autoSolveNakedSingles' handleSettingChange={handleSettingChange} />
					<SettingsItem title={t('settings.onlyInBox')} name='autoSolveOnlyInBox' handleSettingChange={handleSettingChange} />
				</div>
			</SectionContent>
		</Section>
	)
}

function About(){
	const {t} = useTranslation()

	return (
		<Section>
			<Topbar title={t('sectionNames.settings')} subtitle={t('settings.sectionAbout')} backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list fade_in">
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