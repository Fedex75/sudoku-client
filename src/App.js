import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router'
import './utils/SettingsHandler'
import o9n from 'o9n'
import { Home, Sudoku, Settings, Bookmarks } from './pages'
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

		o9n.orientation.lock('portrait').then(() => {}).catch(() => {})

		return () => {
			document.body.removeEventListener('scroll', scrollEvent)
			if (matchMediaColorScheme) matchMediaColorScheme.onchange = () => {}
		}
		// eslint-disable-next-line
	}, [])

  return (
		<div className='app' data-theme={theme} data-accent-color={accentColor} onClick={()=>{}}>
			<Routes>
				<Route exact path="/" element={<Home theme={theme} accentColor={accentColor} />} />
				<Route exact path="/sudoku" element={<Sudoku theme={theme} accentColor={accentColor} />} />
				<Route path="/settings/*" element={<Settings theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor}/>} />
				<Route exact path="/bookmarks" element={<Bookmarks theme={theme} />}/>
			</Routes>
		</div>
  )
}

export default App
