import { lightTheme, darkTheme } from "../components/Themes"

class ThemeHandler {
	constructor(){
		this.themeName = 'dark'; //Default
		let themeData = localStorage.getItem('theme');
		if (themeData){
			themeData = JSON.parse(themeData);
			if (themeData?.name) this.setTheme(themeData.name);
			else this.setTheme('dark');
		}
		else this.setTheme('dark');
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