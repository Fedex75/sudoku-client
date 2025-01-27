import { getStoredData, useLocalStorage } from './LocalStorageHandler'

const SETTINGS_KEY = 'settings'
const SETTINGS_SCHEMA_VERSION = 1

export type Language = 'auto' | 'es' | 'en'

export type Settings = {
	autoTheme: boolean
	checkErrors: boolean
	advancedHighlight: boolean
	showPossibleValues: boolean
	autoRemoveCandidates: boolean
	clearColorOnInput: boolean
	autoChangeInputLock: boolean
	lockCellsWithColor: boolean
	autoSolveCellsWithColor: boolean
	autoSolveCellsFullNotation: boolean
	autoSolveOnlyInBox: boolean
	autoSolveNakedSingles: boolean
	killerAutoSolveLastInCage: boolean
	clearColorFullNotation: boolean
	highlightCandidatesWithColor: boolean
	highContrastGrid: boolean
	language: Language
}

export const defaultSettings: Settings = {
	autoTheme: true,
	checkErrors: true,
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
