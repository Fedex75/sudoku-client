import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import './utils/SettingsHandler'
import { Home, Sudoku, Settings } from './pages'
import useLocalStorage from 'use-local-storage'

const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)')

const options = {
	parser: (str) => {
		let parsed = JSON.parse(str)
		if (typeof parsed === 'string') return parsed
		return 'dark'
 	}
}

function App() {
	const [theme, setTheme] = useLocalStorage('theme', matchMediaColorScheme?.matches ? 'dark' : 'light', options)
	const [accentColor, setAccentColor] = useLocalStorage('accent_color', 'darkBlue')

	useEffect(() => {
		const scrollEvent = document.body.addEventListener('scroll', (e) => {
			e.preventDefault()
			window.scrollTo(0, 0)
		}, {passive: false})

		if (matchMediaColorScheme) matchMediaColorScheme.onchange = event => { setTheme(event.matches ? 'dark' : 'light') }

		return () => {
			document.body.removeEventListener('scroll', scrollEvent)
			if (matchMediaColorScheme) matchMediaColorScheme.onchange = () => {}
		}
		// eslint-disable-next-line
	}, [])

  return (
		<div className='app' data-theme={theme} data-accent-color={accentColor} onClick={()=>{}}>
			<Routes>
				<Route exact path="/" element={<Navigate to="/home" replace />} />
				<Route path="/home/*" element={<Home theme={theme} accentColor={accentColor} />} />
				<Route exact path="/sudoku" element={<Sudoku theme={theme} accentColor={accentColor} />} />
				<Route path="/settings/*" element={<Settings theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor}/>} />
			</Routes>
		</div>
  )
}

export default App
