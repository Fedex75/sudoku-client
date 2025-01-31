import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import './utils/SettingsHandler'
import { Home, Sudoku, Settings } from './pages'
import { AccentColor } from './utils/Colors'
import { ThemeName } from './game/Themes'
import { useLocalStorage } from './utils/LocalStorageHandler'
import Statistics from './pages/statistics/Statistics'
import { useSettings } from './utils/SettingsHandler'
import { useTranslation } from 'react-i18next'

const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)')

const parser = (str: string) => {
    let parsed = JSON.parse(str)
    if (typeof parsed === 'string') return parsed as ThemeName
    return 'dark'
}

function App() {
    const [theme, setTheme] = useLocalStorage<ThemeName>('theme', 1, matchMediaColorScheme?.matches ? 'dark' : 'light', parser)
    const { settings } = useSettings()
    const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('accent_color', 1, 'darkBlue')
    const { i18n } = useTranslation()

    useEffect(() => {
        const handleScroll = (e: Event) => {
            e.preventDefault()
            window.scrollTo(0, 0)
        }

        document.body.addEventListener('scroll', handleScroll, { passive: false })

        if (matchMediaColorScheme) matchMediaColorScheme.onchange = event => { setTheme(event.matches ? 'dark' : 'light') }
        if (settings.language === 'auto') i18n.changeLanguage(navigator.language.split('-')[0])

        return () => {
            document.body.removeEventListener('scroll', handleScroll)
            if (matchMediaColorScheme) matchMediaColorScheme.onchange = () => { }
        }
    }, [setTheme, i18n, settings.language])

    return (
        <div id='app' className='app' data-theme={theme} data-accent-color={accentColor} onClick={() => { }}>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home/*" element={<Home theme={theme} accentColor={accentColor} />} />
                <Route path="/sudoku" element={<Sudoku theme={theme} accentColor={accentColor} />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings/*" element={<Settings theme={theme} setTheme={setTheme} accentColor={accentColor} setAccentColor={setAccentColor} />} />
            </Routes>
        </div>
    )
}

export default App
