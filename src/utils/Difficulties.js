const modeTranslations = {
	classic: 'Clásico',
	killer: 'Killer'
}

const difficultyTranslations = {
	easy: 'Fácil',
	medium: 'Intermedio',
	hard: 'Difícil',
	expert: 'Experto',
	evil: 'Malvado',
	restart: 'Reiniciar',
	custom: 'Custom'
}

const classicDifficulties = ['easy', 'medium', 'hard', 'expert', 'evil', 'restart']
const killerDifficulties = ['easy', 'medium', 'hard', 'expert', 'restart']

const modeDecoder = {c: 'classic', k: 'killer'}
const difficultyDecoder = {e: 'easy', m: 'medium', h: 'hard', x: 'expert', v: 'evil', c: 'custom'}

export {
	modeTranslations,
	difficultyTranslations,
	classicDifficulties,
	killerDifficulties,
	modeDecoder,
	difficultyDecoder
}