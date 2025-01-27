import missionsData from '../data/missions.json'
import { difficulties, DifficultyIdentifier, DifficultyName, GameModeIdentifier, GameModeName, getDifficulty, getMode } from './Difficulties'
import { defaultStatistics, Statistics, update } from './Statistics'
import { Bookmark, GameData, MissionsData, RawGameData } from './DataTypes'
import { createBoard, AnyBoard } from '../game/gameModes/createBoard'
import { STORAGE_SCHEMA_VERSION, BOARD_API_VERSION, RECOMMENDATIONS_API_VERSION, BOOKMARKS_API_VERSION, SOLVED_API_VERSION, STATISTICS_API_VERSION } from './Constants'
import { getStoredData, saveData } from './LocalStorageHandler'
import { getCurrentSettings } from './SettingsHandler'

const missions: MissionsData = missionsData as MissionsData

type Recommendations = {
	newGame: {
		mode: GameModeName
		difficulty: DifficultyName
	}
	perMode: {
		classic: DifficultyName
		killer: DifficultyName
		sudokuX: DifficultyName
		sandwich: DifficultyName
		thermo: DifficultyName
	}
}

const defaultRecommendations: Recommendations = {
	newGame: {
		mode: 'classic',
		difficulty: 'easy'
	},
	perMode: {
		classic: 'easy',
		killer: 'easy',
		sudokuX: 'easy',
		sandwich: 'easy',
		thermo: 'easy'
	}
}

const RECOMMENDATIONS_KEY = 'recommendations'
const GAME_KEY = 'game'
const BOOKMARKS_KEY = 'bookmarks'
const SOLVED_KEY = 'solved'
const STATISTICS_KEY = 'statistics'

class GameHandler {
	game: AnyBoard | null
	complete: boolean
	bookmarks: Bookmark[]
	solved: string[]
	recommendations: Recommendations
	statistics: Statistics<GameModeName, DifficultyName>

	constructor() {
		this.game = null
		this.complete = false
		this.bookmarks = []
		this.solved = []
		this.recommendations = defaultRecommendations
		this.statistics = defaultStatistics
		this.init()
	}

	init() {
		const ls_schema_version = localStorage.getItem('SCHEMA_VERSION')
		if (ls_schema_version === null || parseInt(ls_schema_version) < STORAGE_SCHEMA_VERSION) {
			localStorage.clear()
			localStorage.setItem('SCHEMA_VERSION', STORAGE_SCHEMA_VERSION.toString())
		}

		this.recommendations = getStoredData(RECOMMENDATIONS_KEY, RECOMMENDATIONS_API_VERSION, defaultRecommendations)

		this.game = getStoredData(GAME_KEY, BOARD_API_VERSION, null, (gameData: GameData) => gameData ? createBoard(getMode(gameData.id[0] as GameModeIdentifier), gameData, getCurrentSettings()) : null)

		this.bookmarks = getStoredData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, [])

		this.solved = getStoredData(SOLVED_KEY, SOLVED_API_VERSION, [])

		this.statistics = getStoredData(STATISTICS_KEY, STATISTICS_API_VERSION, defaultStatistics)
	}

	setCurrentGame(board: AnyBoard) {
		this.game = board
		this.complete = false
		this.saveGame()
		this.recommendations.newGame = {
			mode: this.game.mode,
			difficulty: this.game.difficulty
		}
		this.recommendations.perMode[this.game.mode] = getDifficulty(this.game.id[1] as DifficultyIdentifier)
		saveData(RECOMMENDATIONS_KEY, RECOMMENDATIONS_API_VERSION, this.recommendations)
	}

	newGame(mode: GameModeName, difficulty: DifficultyName | 'restart') {
		if (difficulty === 'restart') {
			if (this.game) {
				this.game.restart()
				this.complete = false
			}
		} else {
			let candidates = missions[mode][difficulty].filter(c => !this.solved.includes(c.id))
			if (candidates.length === 0) {
				if (missions[mode][difficulty].length === 0) {
					for (let diff of difficulties[mode]) {
						if (missions[mode][diff].length > 0) {
							candidates = missions[mode][diff]
							break
						}
					}
				} else {
					candidates = missions[mode][difficulty]
				}
			}
			if (candidates.length > 0) {
				const rawData = candidates[Math.floor(Math.random() * candidates.length)]
				this.setCurrentGame(createBoard(mode, {
					id: rawData.id,
					mission: rawData.m
				}, getCurrentSettings()))
			}
		}
	}

	boardFromCustomMission(mode: GameModeName, mission: string) {
		return createBoard(mode, {
			id: '',
			mission: mission
		})
	}

	/*importGame(data: string) {
		if (data[0] === '{') {
			//Data is mission JSON
			try {
				const rawData = JSON.parse(data) as RawGameData
				this.setCurrentGame(new Board({
					id: rawData.id,
					mission: rawData.m
				}))
				return (true)
			} catch (e) {
				return (false)
			}
		} else {
			//Data is board text representation
			if (decodeMissionString(data).length === 81) {
				this.setCurrentGame(this.boardFromCustomMission(data))
				return (true)
			} else {
				return (false)
			}
		}
	}*/

	findMissionFromID(id: string) {
		return missions[getMode(id[0] as GameModeIdentifier)][getDifficulty(id[1] as DifficultyIdentifier)].find(mission => mission.id === id) as RawGameData
	}

	exportMission() {
		if (this.game) {
			return JSON.stringify(this.findMissionFromID(this.game.id))
		}
		return ''
	}

	saveGame() {
		if (!this.game) return
		saveData(GAME_KEY, BOARD_API_VERSION, this.game.getDataToSave())
	}

	setComplete() {
		if (this.game) {
			this.complete = true
			saveData(GAME_KEY, BOARD_API_VERSION, null)
			if (this.game.difficulty !== 'unrated' && !this.solved.includes(this.game.id)) this.solved.push(this.game.id)
			saveData(SOLVED_KEY, SOLVED_API_VERSION, this.solved)
			update(this.statistics[this.game.mode][this.game.difficulty], this.game.timer)
			saveData(STATISTICS_KEY, STATISTICS_API_VERSION, this.statistics)
		}
	}

	currentGameIsBookmarked() {
		if (!this.game) return false

		if (this.game.id === '') {
			return this.bookmarks.some(bm => bm.m === this.game?.mission)
		} else {
			return this.bookmarks.some(bm => bm.id === this.game?.id)
		}
	}

	bookmarkCurrentGame() {
		if (this.game === null) return
		if (!this.currentGameIsBookmarked()) {
			if (this.game.difficulty === 'unrated') {
				this.bookmarks.push({
					id: this.game.id
				})
			} else {
				this.bookmarks.push({
					id: this.game.id,
					m: this.game.mission
				})
			}
			saveData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, this.bookmarks)
		}
	}

	clearBookmarks() {
		this.bookmarks = []
		saveData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, this.bookmarks)
	}

	removeBookmark(bm: Bookmark) {
		const bmString = JSON.stringify(bm)
		this.bookmarks = this.bookmarks.filter(bm2 => bmString !== JSON.stringify(bm2))
		saveData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, this.bookmarks)
	}

	loadGameFromBookmark(bm: Bookmark) {
		if (bm.m) {
			this.setCurrentGame(this.boardFromCustomMission(getMode(bm.id[0] as GameModeIdentifier), bm.m))
		} else {
			const rawData = this.findMissionFromID(bm.id)
			this.setCurrentGame(createBoard(getMode(rawData.id[0] as GameModeIdentifier), {
				id: rawData.id,
				mission: rawData.m
			}))
		}
	}

	resetStatistics() {
		this.statistics = defaultStatistics
		saveData(STATISTICS_KEY, STATISTICS_API_VERSION, this.statistics)
	}
}

export default new GameHandler()
