import React from 'react';
import ReactSwitch from 'react-switch';
import Section from './Section';

function Settings(props){
	return (
		<Section name="settings">
			<div className="settings">
				<div className="settings__list">
					<div className="settings__item">
						<div className="settings__item__title">Auto-check for mistakes</div>
						<ReactSwitch className="react-switch"/>
					</div>
				</div>
			</div>
		</Section>
	);
}

export default Settings;