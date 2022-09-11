import React, {useState, useEffect} from 'react'
import { Route, Routes } from 'react-router'
import './utils/SettingsHandler'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from "./components/GlobalStyles"
import ThemeHandler from './utils/ThemeHandler'
import o9n from 'o9n'
import Home from './pages/home/Home'
import Sudoku from './pages/sudoku/Sudoku'
import Settings from './pages/settings/Settings'
import Bookmarks from './pages/bookmarks/Bookmarks'

function App() {
	const [theme, setTheme] = useState(ThemeHandler.themeName)

	function toggleTheme(){
		ThemeHandler.toggleTheme()
		setTheme(ThemeHandler.themeName)
	}

	useEffect(() => {
		document.body.addEventListener('scroll', (e) => {
			e.preventDefault()
			window.scrollTo(0, 0)
		}, {passive: false})

		const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)')
		if (matchMediaColorScheme){
			matchMediaColorScheme.onchange = event => {
				ThemeHandler.setTheme(event.matches ? 'dark' : 'light')
				setTheme(ThemeHandler.themeName)
			}
		}

		o9n.orientation.lock('portrait').then(() => {}).catch(() => {})

		return () => {
			if (matchMediaColorScheme) matchMediaColorScheme.onchange = () => {} 
		}
	}, [])
  
  return (
		<ThemeProvider theme={ThemeHandler.theme}>
			<GlobalStyles />
			{
				<Routes>
					<Route exact path="/" element={<Home />} />
					<Route exact path="/sudoku" element={<Sudoku theme={ThemeHandler.theme} />} />
					<Route exact path="/settings" element={<Settings themeName={theme} toggleTheme={toggleTheme}/>} />
					<Route exact path="/bookmarks" element={<Bookmarks />} />
				</Routes>
			}
		</ThemeProvider>
  )
}

export default App
