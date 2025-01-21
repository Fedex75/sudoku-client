import missionsData from '../data/missions.json'
import { decodeMissionString } from './Decoder'
import { difficulties, DifficultyIdentifier, DifficultyName, GameModeIdentifier, GameModeName, getDifficulty, getMode } from './Difficulties'
import { defaultStatistics, Statistics, update } from './Statistics'
import Board from '../game/Board'
import { Bookmark, MissionsData, RawGameData, isIDBookmark } from './DataTypes'
import API from './API'

const BOARD_API_VERSION = 8
const STORAGE_SCHEMA_VERSION = 5

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

class GameHandler {
	game: Board | null = null
	complete: boolean = false
	bookmarks: Bookmark[] = []
	solved: string[] = []
	recommendations: Recommendations
	statistics: Statistics<GameModeName, DifficultyName>

	constructor() {
		this.recommendations = {
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

		this.statistics = defaultStatistics
	}

	init() {
		const ls_schema_version = localStorage.getItem('SCHEMA_VERSION')
		if (ls_schema_version === null || parseInt(ls_schema_version) < STORAGE_SCHEMA_VERSION) {
			localStorage.clear()
			localStorage.setItem('SCHEMA_VERSION', STORAGE_SCHEMA_VERSION.toString())
		}

		const lsRecommendations = localStorage.getItem('recommendations')
		if (lsRecommendations) this.recommendations = JSON.parse(lsRecommendations)
		localStorage.setItem('recommendations', JSON.stringify(this.recommendations))

		let data
		const lsGame = localStorage.getItem('game')
		data = lsGame ? JSON.parse(lsGame) : null

		if (data?.version && data.version === BOARD_API_VERSION) {
			try {
				this.setCurrentGame(new Board(data, 9))
			} catch (e) {
				console.error(e)
				this.game = null
			}
		} else {
			this.game = null
		}

		const lsBookmarks = localStorage.getItem('bookmarks')
		if (lsBookmarks) this.bookmarks = JSON.parse(lsBookmarks)

		const lsSolved = localStorage.getItem('solved')
		if (lsSolved) this.solved = JSON.parse(lsSolved)

		const lsStatistics = localStorage.getItem('statistics')
		if (lsStatistics) this.statistics = JSON.parse(lsStatistics)
		localStorage.setItem('statistics', JSON.stringify(this.statistics))
	}

	setCurrentGame(board: Board) {
		this.game = board
		this.complete = false
		this.game.version = BOARD_API_VERSION
		this.game.saveToLocalStorage()
		this.recommendations.newGame = {
			mode: this.game.mode,
			difficulty: this.game.difficulty
		}
		this.recommendations.perMode[this.game.mode] = this.game.difficulty
		localStorage.setItem('recommendations', JSON.stringify(this.recommendations))
	}

	newGame(mode: GameModeName, difficulty: DifficultyName | 'restart') {
		if (difficulty === 'restart') {
			if (this.game) {
				this.game.restart()
				this.complete = false
			}
		} else {
			let candidates = missions[mode][difficulty].filter(c => !this.solved.includes(c.id))
			if (candidates.length === 0){
				if (missions[mode][difficulty].length === 0){
					for (let diff of difficulties[mode]){
						if (missions[mode][diff].length > 0){
							candidates = missions[mode][diff]
							break
						}
					}
				} else {
					candidates = missions[mode][difficulty]
				}
			}
			if (candidates.length > 0) this.setCurrentGame(new Board(candidates[Math.floor(Math.random() * candidates.length)], 9))
		}
	}

	boardFromCustomMission(mission: string) {
		return new Board({
			id: '',
			m: mission
		}, 9)
	}

	importGame(data: string) {
		if (data[0] === '{') {
			//Data is mission JSON
			try {
				const gameData = JSON.parse(data) as RawGameData
				this.setCurrentGame(new Board(gameData, 9))
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
	}

	findMissionFromID(id: string) {
		return missions[getMode(id[0] as GameModeIdentifier)][getDifficulty(id[1] as DifficultyIdentifier)].find(mission => mission.id === id) as RawGameData
	}

	exportMission() {
		if (this.game) {
			return JSON.stringify(this.findMissionFromID(this.game.id))
		}
		return ''
	}

	saveGame(data: string) {
		try {
			localStorage.setItem('game', data)
		} catch (e) {
			if (e instanceof DOMException && e.name === 'QuotaExceededError') {
				API.log({ message: 'Quota exceeded', date: Date.now() })
			}
		}
	}

	setComplete() {
		if (this.game) {
			this.complete = true
			localStorage.removeItem('game')
			if (this.game.difficulty !== 'unrated' && !this.solved.includes(this.game.id)) this.solved.push(this.game.id)
			localStorage.setItem('solved', JSON.stringify(this.solved))
			update(this.statistics[this.game.mode][this.game.difficulty], this.game.timer)
			localStorage.setItem('statistics', JSON.stringify(this.statistics))
		}
	}

	currentGameIsBookmarked() {
		if (this.game === null) return false

		if (this.game.id === '') {
			return this.bookmarks.some(bm => bm.m === this.game?.mission)
		} else {
			return this.bookmarks.some(bm => bm.id === this.game?.id)
		}
	}

	bookmarkCurrentGame() {
		if (this.game === null) return
		if (!this.currentGameIsBookmarked()) {
			if (this.game.id !== '') {
				this.bookmarks.push({
					id: this.game.id
				})
			} else {
				this.bookmarks.push({
					m: this.game.mission
				})
			}
			localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
		}
	}

	clearBookmarks() {
		this.bookmarks = []
		localStorage.setItem('bookmarks', '[]')
	}

	removeBookmark(bm: Bookmark) {
		const bmString = JSON.stringify(bm)
		this.bookmarks = this.bookmarks.filter(bm2 => bmString !== JSON.stringify(bm2))
		localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
	}

	loadGameFromBookmark(bm: Bookmark) {
		if (isIDBookmark(bm)) {
			this.setCurrentGame(new Board(this.findMissionFromID(bm.id), 9))
		} else {
			this.setCurrentGame(this.boardFromCustomMission(bm.m))
		}
	}

	resetStatistics() {
		this.statistics = defaultStatistics
		localStorage.setItem('statistics', JSON.stringify(this.statistics))
	}
}

export default new GameHandler()
