import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router'
import './utils/SettingsHandler'
import o9n from 'o9n'
import { Home, Sudoku, Settings, Bookmarks } from './pages'
import useLocalStorage from 'use-local-storage'

const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)')

function App() {
	const [theme, setTheme] = useLocalStorage('theme', matchMediaColorScheme?.matches ? 'dark' : 'light')

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
	}, [])
  
  return (
		<div className='app' data-theme={theme}>
			<Routes>
				<Route exact path="/" element={<Home theme={theme} />} />
				<Route exact path="/sudoku" element={<Sudoku theme={theme} />} />
				<Route exact path="/settings" element={<Settings theme={theme} toggleTheme={() => {setTheme(t => t === 'dark' ? 'light' : 'dark')}}/>} />
				<Route exact path="/bookmarks" element={<Bookmarks />} theme={theme} />
			</Routes>
		</div>
  )
}

export default App
