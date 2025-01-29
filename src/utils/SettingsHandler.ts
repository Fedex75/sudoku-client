import { getStoredData, useLocalStorage } from './LocalStorageHandler'

const SETTINGS_KEY = 'settings'
const SETTINGS_SCHEMA_VERSION = 2

export type Language = 'auto' | 'es' | 'en'

export type Settings = {
	// Appearance
	autoTheme: boolean
	highlightCandidatesWithColor: boolean
	highContrastGrid: boolean

	// Annotations
	showPossibleValues: boolean
	autoRemoveCandidates: boolean
	autoChangeInputLock: boolean
	autoSolveNakedSingles: boolean
	autoSolveOnlyInBox: boolean
	autoSolveCellsFullNotation: boolean

	// Color
	clearColorOnInput: boolean
	lockCellsWithColor: boolean
	autoSolveCellsWithColor: boolean
	clearColorFullNotation: boolean

	// Errors
	showErrors: boolean // NEW
	showSolutionErrors: boolean
	showLogicErrors: boolean
	killerShowCageErrors: boolean // NEW
	sudokuXShowDiagonalErrors: boolean // NEW
	sandwichShowSumErrors: boolean // NEW
	thermoShowThermometerErrors: boolean // NEW

	// Advanced
	advancedHighlight: boolean
	killerAutoSolveLastInCage: boolean
	sudokuXShowDiagonals: boolean // NEW
	sandwichAutoSolveLastInSum: boolean // NEW
	sandwichHideSolvedClues: boolean // NEW
	sandwichAutoSolveSingleCellSum: boolean // NEW

	// General
	language: Language
}

export const defaultSettings: Settings = {
	autoTheme: true,
	showSolutionErrors: true,
	showLogicErrors: true,
	advancedHighlight: false,
	showPossibleValues: false,
	autoRemoveCandidates: true,
	clearColorOnInput: false,
	autoChangeInputLock: false,
	lockCellsWithColor: false,
	autoSolveCellsWithColor: false,
	autoSolveCellsFullNotation: false,
	autoSolveOnlyInBox: false,
	autoSolveNakedSingles: false,
	killerAutoSolveLastInCage: false,
	clearColorFullNotation: false,
	highlightCandidatesWithColor: false,
	highContrastGrid: true,
	language: 'auto'
}

export function getCurrentSettings() {
	return getStoredData(SETTINGS_KEY, SETTINGS_SCHEMA_VERSION, defaultSettings)
}

export function useSettings() {
	const [settings, setSettings] = useLocalStorage<Settings>(SETTINGS_KEY, SETTINGS_SCHEMA_VERSION, defaultSettings)

	const updateSettings = (overrideSettings: Partial<Settings>) => {
		setSettings(({ ...settings, ...overrideSettings }))
	}

	return { settings, updateSettings }
}
