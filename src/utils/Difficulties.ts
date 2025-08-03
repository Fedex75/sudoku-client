export type DifficultyName = 'easy' | 'medium' | 'hard' | 'expert' | 'evil' | 'unrated';

export type DifficultyIdentifier = 'e' | 'm' | 'h' | 'x' | 'v' | 'u';

export function getDifficulty(from: DifficultyIdentifier): DifficultyName {
    switch (from) {
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
