import { lightTheme, darkTheme } from "../components/Themes"
import SettingsHandler from "./SettingsHandler";

class ThemeHandler {
	constructor(){
		this.themeName = 'light' //Default
		if (SettingsHandler.settings.autoTheme) this.updateAutoTheme()
		else {
			let themeData = localStorage.getItem('theme');
			if (themeData){
				themeData = JSON.parse(themeData);
				if (themeData?.name) this.themeName = themeData.name;
			}
		}
		this.setTheme(this.themeName)
	}

	updateAutoTheme(){
		if (SettingsHandler.settings.autoTheme) this.setTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
	}

	setTheme(newThemeName){
		this.themeName = newThemeName;
		localStorage.setItem('theme', JSON.stringify({name: newThemeName}));
		this.theme = newThemeName === 'light' ? lightTheme : darkTheme;
	}

	toggleTheme(){
		this.setTheme(this.themeName === 'light' ? 'dark' : 'light');
	}
}

export default new ThemeHandler();