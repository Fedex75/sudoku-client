import './settings.css'
import { useState } from 'react'
import { Section, SectionContent, Topbar, ThemeSwitch } from '../../components'
import ReactSwitch from 'react-switch'
import SettingsHandler from '../../utils/SettingsHandler'
import API from '../../utils/API'

export default function Settings({theme, toggleTheme}){
	const [, setRender] = useState(0)

	function handleChange(name, value){
		SettingsHandler.setSetting(name, value)
		setRender(r => r === 100 ? 0 : r+1)
	}

	return (
		<Section>
			<Topbar title="Opciones" backURL="/" buttons={[<ThemeSwitch key={0} theme={theme} toggleTheme={toggleTheme} />]} />
			<SectionContent id="settings">
				<div className="settings__list">
					{SettingsHandler.template.map((t, key) => (
						<div className="settings__item" key={key}>
							<p className="settings__item__title">{t.translation}</p>
							{
								t.type === 'boolean' ? <ReactSwitch className="react-switch" width={50} onColor='#00d039' checkedIcon={false} uncheckedIcon={false} handleDiameter={24} activeBoxShadow={null} onChange={checked => {handleChange(t.name, checked)}} checked={SettingsHandler.settings[t.name]} />
								: null
							}
						</div>
					))}
					<div className="settings__item" key='version' style={{padding: 10}}>
						<p className="settings__item__title" style={{textAlign: 'center', margin: 0}}>{API.clientVersion}</p>
					</div>
				</div>
			</SectionContent>
		</Section>
	)
}