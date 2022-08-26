import React, { useState } from 'react'
import { Section, SectionContent, Topbar } from '../../components/section'
import ReactSwitch from 'react-switch'
import SettingsHandler from '../../utils/SettingsHandler'
import ThemeSwitch from '../../components/ThemeSwitch'

function Settings({themeName, toggleTheme}){
	const [, setRender] = useState(0)

	function handleChange(name, value){
		SettingsHandler.setSetting(name, value)
		setRender(r => r === 100 ? 0 : r+1)
	}

	return (
		<Section>
			<Topbar title="Opciones" backURL="/">
				<ThemeSwitch themeName={themeName} toggleTheme={toggleTheme} />
			</Topbar>
			<SectionContent id="settings">
				<div className="settings__list">
					{SettingsHandler.template.map((t, key) => (
						<div className="settings__item" key={key}>
							<div className="settings__item__title">{t.translation}</div>
							{
								t.type === 'boolean' ? <ReactSwitch className="react-switch" width={50} onColor='#00d039' checkedIcon={false} uncheckedIcon={false} handleDiameter={24} activeBoxShadow={null} onChange={checked => {handleChange(t.name, checked)}} checked={SettingsHandler.settings[t.name]} />
								: null
							}
						</div>
					))}
				</div>
				<p className='settings__version'>Versión: 1.8.3</p>
			</SectionContent>
		</Section>
	)
}

export default Settings