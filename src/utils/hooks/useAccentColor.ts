import { createContext } from 'react';
import { AccentColor } from '../Colors';
import { useLocalStorage } from './LocalStorageHandler';

export default function useAccentColor(): [AccentColor, (value: AccentColor) => void] {
    return useLocalStorage<AccentColor>('accent_color', 1, 'darkBlue');
}

interface AccentColorContextType {
    accentColor: AccentColor;
    setAccentColor: (accentColor: AccentColor) => void;
}

export const AccentColorContext = createContext<AccentColorContextType>({
    accentColor: 'darkBlue',
    setAccentColor: () => { }
});
