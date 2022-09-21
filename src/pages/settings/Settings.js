import './settings.css'
import { useState } from 'react'
import { Section, SectionContent, Topbar, ExpandCard, ColorChooser } from '../../components'
import SettingsHandler from '../../utils/SettingsHandler'
import { Link, Route, Routes } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faChevronRight, faBorderAll, faGear, faInfo, faHeart } from '@fortawesome/free-solid-svg-icons'
import SettingsItem from '../../components/settingsItem/SettingsItem'
import API from '../../utils/API'

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
	return (
		<Section>
			<Topbar title='Opciones' backURL="/" />
			<SectionContent id="settings">
				<div className="settings__section__list fade_in">
					<SectionLink color='var(--darkBlue)' icon={faPalette} title='Apariencia' link='appearance'/>
					<SectionLink color='var(--red)' icon={faBorderAll} title='Juego' link='game'/>
					<SectionLink color='var(--lightGray)' icon={faGear} title='Avanzado' link='advanced'/>
					<SectionLink color='var(--darkBlue)' icon={faInfo} title='Acerca de' link='about'/>
				</div>
			</SectionContent>
		</Section>
	)
}

function Appearance({handleSettingChange, theme, setTheme, accentColor, setAccentColor}){
	return (
		<Section>
			<Topbar title='Opciones' subtitle='Apariencia' backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list fade_in" >
					<SettingsItem title='' name='' handleSettingChange={handleSettingChange} type='theme' theme={theme} setTheme={setTheme} accentColor={accentColor} />
					<SettingsItem title='Automático' name='autoTheme' handleSettingChange={handleSettingChange} />
				</div>

				<div className='settings__label fade_in'>COLOR DE ACENTO</div>

				<ExpandCard className='fade_in'>
					<ColorChooser value={accentColor} colors={['red', 'orange', 'yellow', 'green', 'blueGreen', 'lightBlue', 'darkBlue', 'purple']} onChange={setAccentColor} />
				</ExpandCard>
			</SectionContent>
		</Section>
	)
}

function Game({handleSettingChange}){
	return (
		<Section>
			<Topbar title='Opciones' subtitle='Juego' backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list fade_in">
					<SettingsItem title='Mostrar errores' name='checkMistakes' handleSettingChange={handleSettingChange} />
					<SettingsItem title='Señalamiento completo' name='advancedHighlight' handleSettingChange={handleSettingChange} />
				</div>
				
				<div className='settings__label fade_in'>CANDIDATOS</div>
				
				<div className="settings__list fade_in">
					<SettingsItem title='Mostrar solo posibles' name='showPossibleValues' handleSettingChange={handleSettingChange} />
					<SettingsItem title='Remover automáticamente' name='autoRemoveCandidates' handleSettingChange={handleSettingChange} />
				</div>
			</SectionContent>
		</Section>
	)
}

function Advanced({handleSettingChange}){
	return (
		<Section>
			<Topbar title='Opciones' subtitle='Avanzado' backURL="/settings"/>
			<SectionContent id="settings">
				<div className='settings__label fade_in'>BLOQUEO DE ENTRADA</div>
				
				<div className="settings__list fade_in">
					<SettingsItem title='Cambiar automáticamente' name='autoChangeInputLock' handleSettingChange={handleSettingChange} />
				</div>

				<div className='settings__label fade_in'>CELDAS CON COLOR</div>

				<div className="settings__list fade_in">
					<SettingsItem title='Bloquear' name='lockCellsWithColor' handleSettingChange={handleSettingChange} />
					<SettingsItem title='Solución automática' name='autoSolveCellsWithColor' handleSettingChange={handleSettingChange} />
					<SettingsItem title='Eliminar color al resolver' name='clearColorOnInput' handleSettingChange={handleSettingChange} />
				</div>

				<div className='settings__label fade_in'>SOLUCIÓN AUTOMÁTICA</div>

				<div className="settings__list fade_in">
					<SettingsItem title='Notación completa' name='autoSolveCellsFullNotation' handleSettingChange={handleSettingChange} />
					<SettingsItem title='Candidato único' name='autoSolveNakedSingles' handleSettingChange={handleSettingChange} />
					<SettingsItem title='Único en cuadrante' name='autoSolveOnlyInQuadrant' handleSettingChange={handleSettingChange} />
				</div>
			</SectionContent>
		</Section>
	)
}

function About(){
	return (
		<Section>
			<Topbar title='Opciones' subtitle='Acerca de' backURL="/settings"/>
			<SectionContent id="settings">
				<div className="settings__list fade_in">
					<SettingsItem type='info' title='Versión' info={API.clientVersion} />
				</div>

				<p style={{color: 'var(--primaryTextColor)', textAlign: 'center'}}>Hecho con <FontAwesomeIcon icon={faHeart} color='var(--darkRed)' /> en 🇦🇷 </p>
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