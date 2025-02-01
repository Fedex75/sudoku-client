import { ThemeName } from '../../game/Themes'
import { useLocalStorage } from './LocalStorageHandler'

const parser = (str: string) => {
    let parsed = JSON.parse(str)
    if (typeof parsed === 'string') return parsed as ThemeName
    return 'dark'
}

const matchMediaColorScheme = window.matchMedia('(prefers-color-scheme: dark)')

export default function useTheme(): [ThemeName, (value: ThemeName) => void] {
    return useLocalStorage<ThemeName>('theme', 1, matchMediaColorScheme?.matches ? 'dark' : 'light', parser)
}
