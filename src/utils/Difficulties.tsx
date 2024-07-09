export type GameModeName = 'classic' | 'killer' | 'sandwich' | 'sudokuX' | 'thermo';
export type DifficultyName = 'easy' | 'medium' | 'hard' | 'expert' | 'evil' | 'unrated';

export const difficulties: Record<GameModeName, DifficultyName[]> = {
	'classic': ['easy', 'medium', 'hard', 'expert', 'evil'],
	'killer': ['easy', 'medium', 'hard', 'expert'],
	'sudokuX': ['unrated'],
	'sandwich': ['unrated'],
	'thermo': ['unrated']
};

export type GameModeIdentifier = 'c' | 'k' | 'x' | 'w' | 't';

export function decodeMode(identifier: GameModeIdentifier): GameModeName{
	switch (identifier){
		case 'c':
			return 'classic';
		case 'k':
			return 'killer';
		case 'x':
			return 'sudokuX';
		case 'w':
			return 'sandwich';
		case 't':
			return 'thermo';
	}
}

export type DifficultyIdentifier = 'e' | 'm' | 'h' | 'x' | 'v' | 'u';

export function decodeDifficulty(identifier: DifficultyIdentifier): DifficultyName {
	switch (identifier){
		case 'e':
			return 'easy';
		case 'm':
			return 'medium';
		case 'h':
			return 'hard';
		case 'x':
			return 'expert';
		case 'v':
			return 'evil';
		case 'u':
			return 'unrated';
	}
}
