import { createContext } from 'react';
import { getStoredData, useLocalStorage } from './LocalStorageHandler';

const SETTINGS_KEY = 'settings';
const SETTINGS_SCHEMA_VERSION = 3;

export type Language = 'auto' | 'es' | 'en';

export type Settings = {
    // --- Appearance ---
    autoTheme: boolean,
    // ACCENT COLOR
    // HIGH CONTRAST
    highlightCandidatesWithColor: boolean,
    highContrastGrid: boolean,
    // OTHER
    sudokuXShowDiagonals: boolean,
    sandwichHideSolvedClues: boolean,

    // --- Annotations ---
    // CANDIDATES
    autoRemoveCandidates: boolean,
    // NUMPAD
    showPossibleValues: boolean,
    inputLock: boolean,
    // AUTO SOLVE
    autoSolveNakedSingles: boolean,
    autoSolveOnlyInBox: boolean,

    // --- Color ---
    clearColorOnInput: boolean,
    lockCellsWithColor: boolean,
    autoSolveCellsWithColor: boolean,

    // --- Errors ---
    showErrors: boolean, // NEW
    showSolutionErrors: boolean,
    showLogicErrors: boolean,
    killerShowCageErrors: boolean,
    sudokuXShowDiagonalErrors: boolean,
    sandwichShowSumErrors: boolean,
    thermoShowThermometerErrors: boolean,

    // --- Advanced ---
    advancedHighlight: boolean,
    // FULL NOTATION
    autoSolveCellsFullNotation: boolean,
    clearColorFullNotation: boolean,
    // OTHER GAME MODES
    killerAutoSolveLastInCage: boolean,
    sandwichAutoSolveLastInSum: boolean,

    // General
    language: Language;
};

export const defaultSettings: Settings = {
    // --- Appearance ---
    autoTheme: true,
    // ACCENT COLOR
    // HIGH CONTRAST
    highlightCandidatesWithColor: false,
    highContrastGrid: true,
    // OTHER
    sudokuXShowDiagonals: true,
    sandwichHideSolvedClues: true,

    // --- Annotations ---
    // CANDIDATES
    autoRemoveCandidates: true,
    // NUMPAD
    showPossibleValues: false,
    inputLock: false,
    // AUTO SOLVE
    autoSolveNakedSingles: false,
    autoSolveOnlyInBox: false,

    // --- Color ---
    clearColorOnInput: false,
    lockCellsWithColor: false,
    autoSolveCellsWithColor: false,

    // --- Errors ---
    showErrors: true,
    showSolutionErrors: true,
    showLogicErrors: true,
    killerShowCageErrors: true,
    sudokuXShowDiagonalErrors: true,
    sandwichShowSumErrors: true,
    thermoShowThermometerErrors: true,

    // --- Advanced ---
    advancedHighlight: false,
    // FULL NOTATION
    autoSolveCellsFullNotation: false,
    clearColorFullNotation: false,
    // OTHER GAME MODES
    killerAutoSolveLastInCage: false,
    sandwichAutoSolveLastInSum: false,

    // General
    language: 'auto'
};

export function getCurrentSettings() {
    return getStoredData(SETTINGS_KEY, SETTINGS_SCHEMA_VERSION, defaultSettings);
}

export function useSettings() {
    const [settings, setSettings] = useLocalStorage<Settings>(SETTINGS_KEY, SETTINGS_SCHEMA_VERSION, defaultSettings);

    const updateSettings = (overrideSettings: Partial<Settings>) => {
        setSettings(({ ...settings, ...overrideSettings }));
    };

    return { settings, updateSettings };
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (settings: Partial<Settings>) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    updateSettings: () => { }
});
