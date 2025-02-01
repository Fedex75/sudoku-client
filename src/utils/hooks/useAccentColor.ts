import { AccentColor } from '../Colors'
import { useLocalStorage } from './LocalStorageHandler'

export default function useAccentColor(): [AccentColor, (value: AccentColor) => void] {
    const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('accent_color', 1, 'darkBlue')
    return [accentColor, setAccentColor]
}
