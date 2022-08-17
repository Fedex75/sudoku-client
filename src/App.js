import React, {useState, useEffect} from 'react'
import { Route, Routes } from 'react-router'
import './utils/SettingsHandler'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from "./components/GlobalStyles"
import ThemeHandler from './utils/ThemeHandler'
import o9n from 'o9n'
import ReactLoading from 'react-loading'
import GameHandler from './utils/GameHandler'
import Home from './pages/home/Home'
import Sudoku from './pages/sudoku/Sudoku'
import Settings from './pages/settings/Settings'
import Bookmarks from './pages/bookmarks/Bookmarks'

function App() {
	const [loading, setLoading] = useState(true)
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

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible'){
				ThemeHandler.updateAutoTheme()
				setTheme(ThemeHandler.themeName)
			}
		})

		const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')
		if (matchMedia){
			matchMedia.addEventListener('change', event => {
				ThemeHandler.setTheme(event.matches ? 'dark' : 'light')
				setTheme(ThemeHandler.themeName)
			})
		}

		GameHandler.init().then(() => {
			setLoading(false)
		}).catch((e) => {
			console.log(e);
			alert('😱 Ocurrió un error')
		})

		/*Auth.checkSession().then(authenticated => {
			if (authenticated){
				setLoading(false)
			} else {
				//window.location.replace(Auth.authRedirect + '&continue=' + encodeURIComponent('https://sudoku.zaifo.com.ar/overview'))
        		setLoading(false)
			}
		}).catch(() => {
			setLoading(false)
		})*/

		o9n.orientation.lock('portrait').then(() => {}).catch(() => {})
	}, [])
  
  return (
		<ThemeProvider theme={ThemeHandler.theme}>
			<GlobalStyles />
			{
				loading ?
					<div className='main-loading-screen'>
						<ReactLoading type='spin' color='#4b7bec' height={50} width={50} />
					</div> 
				:
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
