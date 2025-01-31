import { useEffect } from 'react'
import { ThemeName } from '../../game/Themes'
import { useLocalStorage } from './LocalStorageHandler'

const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)')

const parser = (str: string) => {
    let parsed = JSON.parse(str)
    if (typeof parsed === 'string') return parsed as ThemeName
    return 'dark'
}

export default function useTheme(): [ThemeName, (value: ThemeName) => void] {
    const [theme, setTheme] = useLocalStorage<ThemeName>('theme', 1, matchMediaColorScheme?.matches ? 'dark' : 'light', parser)

    useEffect(() => {
        if (matchMediaColorScheme) matchMediaColorScheme.onchange = event => { setTheme(event.matches ? 'dark' : 'light') }

        return () => {
            if (matchMediaColorScheme) matchMediaColorScheme.onchange = () => { }
        }
    }, [setTheme])

    return [theme, setTheme]
}
