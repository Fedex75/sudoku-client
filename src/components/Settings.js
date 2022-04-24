import React, { useState } from 'react';
import ReactSwitch from 'react-switch';
import Section from './Section';
import SettingsHandler from '../utils/SettingsHandler';

function Settings(props){
	const [, setRender] = useState(0);

	function handleChange(name, value){
		SettingsHandler.setSetting(name, value);
		setRender(r => r === 100 ? 0 : r+1);
	}

	return (
		<Section name="settings" themeName={props.themeName} toggleTheme={props.toggleTheme}>
			<div className="settings">
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
			</div>
		</Section>
	);
}

export default Settings;