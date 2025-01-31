import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import './utils/hooks/SettingsHandler'
import { Home, Settings } from './pages'
import { AccentColor } from './utils/Colors'
import { useLocalStorage } from './utils/hooks/LocalStorageHandler'
import Statistics from './pages/statistics/Statistics'
import { useSettings } from './utils/hooks/SettingsHandler'
import { useTranslation } from 'react-i18next'
import useTheme from './utils/hooks/useTheme'

function App() {
    const [theme] = useTheme()
    const { settings } = useSettings()
    const [accentColor] = useLocalStorage<AccentColor>('accent_color', 1, 'darkBlue')
    const { i18n } = useTranslation()

    useEffect(() => {
        const handleScroll = (e: Event) => {
            e.preventDefault()
            window.scrollTo(0, 0)
        }

        document.body.addEventListener('scroll', handleScroll, { passive: false })

        if (settings.language === 'auto') {
            const detectedLanguage = navigator.language.split('-')[0]
            if (detectedLanguage !== i18n.language) i18n.changeLanguage(detectedLanguage)
        }

        return () => {
            document.body.removeEventListener('scroll', handleScroll)
        }
    }, [i18n, settings.language])

    return (
        <div id='app' className='app' data-theme={theme} data-accent-color={accentColor} onClick={() => { }}>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home/*" element={<Home />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings/*" element={<Settings />} />
            </Routes>
        </div>
    )
}

export default App
