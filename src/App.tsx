import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import './utils/SettingsHandler'
import { Home, Sudoku, Settings } from './pages'
import { AccentColor } from './utils/Colors'
import { ThemeName } from './game/Themes'
import { useLocalStorage } from './utils/LocalStorageHandler'

const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)')

const parser = (str: string) => {
	let parsed = JSON.parse(str)
	if (typeof parsed === 'string') return parsed as ThemeName
	return 'dark'
}

function App() {
	const [theme, setTheme] = useLocalStorage<ThemeName>('theme', 1, matchMediaColorScheme?.matches ? 'dark' : 'light', parser)
	const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('accent_color', 1, 'darkBlue')

	useEffect(() => {
		const handleScroll = (e: Event) => {
			e.preventDefault()
			window.scrollTo(0, 0)
		}

		document.body.addEventListener('scroll', handleScroll, { passive: false })

		if (matchMediaColorScheme) matchMediaColorScheme.onchange = event => { setTheme(event.matches ? 'dark' : 'light') }

		return () => {
			document.body.removeEventListener('scroll', handleScroll)
			if (matchMediaColorScheme) matchMediaColorScheme.onchange = () => { }
		}
	}, [setTheme])

	return (
		<div id='app' className='app' data-theme={theme} data-accent-color={accentColor} onClick={() => { }}>
			<Routes>
				<Route path="/" element={<Navigate to="/home" replace />} />
				<Route path="/home/*" element={<Home theme={theme} accentColor={accentColor} />} />
				<Route path="/sudoku" element={<Sudoku theme={theme} accentColor={accentColor} />} />
				<Route path="/settings/*" element={<Settings theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} />} />
			</Routes>
		</div>
	)
}

export default App
