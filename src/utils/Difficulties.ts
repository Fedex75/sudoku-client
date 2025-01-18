export type GameModeName = 'classic' | 'killer' | 'sandwich' | 'sudokuX' | 'thermo'
export type DifficultyName = 'easy' | 'medium' | 'hard' | 'expert' | 'evil' | 'unrated'

export const difficulties: Record<GameModeName, DifficultyName[]> = {
	'classic': ['easy', 'medium', 'hard', 'expert', 'evil'],
	'killer': ['easy', 'medium', 'hard', 'expert'],
	'sudokuX': ['easy', 'medium', 'hard', 'expert'],
	'sandwich': ['easy', 'medium', 'hard', 'expert'],
	'thermo': ['easy', 'medium', 'hard', 'expert']
}

export type GameModeIdentifier = 'c' | 'k' | 'x' | 'w' | 't'

export function getMode(from: GameModeIdentifier): GameModeName {
	switch (from) {
		case 'c':
			return 'classic'
		case 'k':
			return 'killer'
		case 'x':
			return 'sudokuX'
		case 'w':
			return 'sandwich'
		case 't':
			return 'thermo'
	}
}

export type DifficultyIdentifier = 'e' | 'm' | 'h' | 'x' | 'v' | 'u'

export function getDifficulty(from: DifficultyIdentifier): DifficultyName {
	switch (from) {
		case 'e':
			return 'easy'
		case 'm':
			return 'medium'
		case 'h':
			return 'hard'
		case 'x':
			return 'expert'
		case 'v':
			return 'evil'
		case 'u':
			return 'unrated'
	}
}
