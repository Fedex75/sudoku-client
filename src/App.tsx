import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import './utils/SettingsHandler';
import { Home, Sudoku, Settings } from './pages';
import useLocalStorage from 'use-local-storage';
import GameHandler from './utils/GameHandler';
import { ThemeName } from './utils/DataTypes';
import { AccentColor } from './utils/Colors';

GameHandler.init();

const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)');

const options = {
	parser: (str: string) => {
		let parsed = JSON.parse(str);
		if (typeof parsed === 'string') return parsed as ThemeName;
		return 'dark';
 	}
}

function App() {
	const [theme, setTheme] = useLocalStorage<ThemeName>('theme', matchMediaColorScheme?.matches ? 'dark' : 'light', options);
	const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('accent_color', 'darkBlue');

	useEffect(() => {
		const handleScroll = (e: Event) => {
			e.preventDefault();
			window.scrollTo(0, 0);
		}

		document.body.addEventListener('scroll', handleScroll, {passive: false});

		if (matchMediaColorScheme) matchMediaColorScheme.onchange = event => { setTheme(event.matches ? 'dark' : 'light') };

		return () => {
			document.body.removeEventListener('scroll', handleScroll);
			if (matchMediaColorScheme) matchMediaColorScheme.onchange = () => {};
		}
		// eslint-disable-next-line
	}, []);

  return (
		<div className='app' data-theme={theme} data-accent-color={accentColor} onClick={()=>{}}>
			<Routes>
				<Route path="/" element={<Navigate to="/home" replace />} />
				<Route path="/home/*" element={<Home theme={theme} accentColor={accentColor} />} />
				<Route path="/sudoku" element={<Sudoku theme={theme} accentColor={accentColor} />} />
				<Route path="/settings/*" element={<Settings theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor}/>} />
			</Routes>
		</div>
  );
}

export default App
