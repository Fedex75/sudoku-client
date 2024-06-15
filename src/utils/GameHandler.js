import Board from './Board'

import missions from '../data/missions.json'
import Decoder from './Decoder'
import { difficultyDecoder, modeDecoder } from './Difficulties'
import { defaultStatistics, updateStatistic } from './Statistics'
import { newGameFromMode } from '../gameModes/Common'

const BOARD_API_VERSION = 6
const STORAGE_SCHEMA_VERSION = 3

class GameHandler {
	init(){
		const ls_schema_version = localStorage.getItem('SCHEMA_VERSION')
		if (ls_schema_version === null || ls_schema_version < STORAGE_SCHEMA_VERSION){
			localStorage.clear()
			localStorage.setItem('SCHEMA_VERSION', STORAGE_SCHEMA_VERSION)
		}

		let data
		const lsGame = localStorage.getItem('game');
		data = lsGame ? JSON.parse(lsGame) : null

		if (data?.version && data.version === BOARD_API_VERSION){
			this.setCurrentGame(newGameFromMode(data.mode, data, false))
		} else {
			this.game = null
			this.complete = false
		}

		const lsBookmarks = localStorage.getItem('bookmarks')
		this.bookmarks = lsBookmarks ? JSON.parse(lsBookmarks) : []

		const lsSolved = localStorage.getItem('solved')
		this.solved = lsSolved ? JSON.parse(lsSolved) : []

		const lsRecommendations = localStorage.getItem('recommendations')
		this.recommendations = lsRecommendations ? JSON.parse(lsRecommendations) : {
			newGame: {
				mode: 'classic',
				difficulty: 'easy'
			},
			perMode: {
				classic: 'easy',
				killer: 'easy',
				sudokuX: 'unrated',
				sandwich: 'unrated',
				thermo: 'unrated'
			}
		}
		localStorage.setItem('recommendations', JSON.stringify(this.recommendations))

		const lsStatistics = localStorage.getItem('statistics')
		this.statistics = lsStatistics ? JSON.parse(lsStatistics) : defaultStatistics
		localStorage.setItem('statistics', 	JSON.stringify(this.statistics))
	}

	setCurrentGame(game){
		this.game = game
		this.complete = false
		this.game.board.version = BOARD_API_VERSION
		this.saveGame(JSON.stringify(this.game.board))
		this.recommendations.newGame = {
			mode: this.game.mode,
			difficulty: this.game.difficulty
		}
		this.recommendations.perMode[this.game.mode] = this.game.difficulty
		localStorage.setItem('recommendations', JSON.stringify(this.recommendations))
	}

	newGame(mode, difficulty){
		if (difficulty === 'restart'){
			this.game.restart()
			this.complete = false
			return
		}

		let candidates = missions[mode][difficulty].filter(c => !this.solved.includes(c.id))
		if (candidates.length === 0) candidates = missions[mode][difficulty]
		this.setCurrentGame(newGameFromMode(mode, candidates[Math.floor(Math.random() * candidates.length)], true))
	}

	boardFromCustomMission(mission){
		return new Board({
			id: 'cc',
			m: mission
		}, true)
	}

	importGame(data){
		if (data[0] === '{'){
			//Data is mission JSON
			try {
				this.setCurrentGame(new Board(JSON.parse(data), true))
				return(true)
			} catch(e){
				return(false)
			}
		} else {
			//Data is board text representation
			if (Decoder.decode(data).length === 81){
				this.setCurrentGame(this.boardFromCustomMission(data))
				return(true)
			} else {
				return(false)
			}
		}
	}

	exportMission(){
		return JSON.stringify(missions[this.game.mode][this.game.difficulty].find(m => m.id === this.game.id))
	}

	saveGame(data){
		localStorage.setItem('game', data)
	}

	setComplete(){
		if (this.game){
			this.complete = true
			localStorage.removeItem('game')
			if (this.game.difficulty !== 'custom' && !this.solved.includes(this.game.id)) this.solved.push(this.game.id)
			localStorage.setItem('solved', JSON.stringify(this.solved))
			updateStatistic(this.statistics[this.game.mode][this.game.difficulty], this.game.timer)
			localStorage.setItem('statistics', 	JSON.stringify(this.statistics))
		}
	}

	currentGameIsBookmarked(){
		if (!this.game) return false

		if (this.game.difficulty === 'custom'){
			return this.bookmarks.some(bm => bm.c && bm.mission === this.game.mission)
		} else {
			return this.bookmarks.some(bm => !bm.c && bm.id === this.game.id)
		}
	}

	bookmarkCurrentGame(){
		if (!this.currentGameIsBookmarked()){
			if (this.game.difficulty === 'custom'){
				this.bookmarks.push({
					c: 1,
					mission: this.game.mission
				})
			} else {
				this.bookmarks.push({
					c: 0,
					id: this.game.id
				})
			}
			localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
		}
	}

	clearBookmarks(){
		this.bookmarks = []
		localStorage.setItem('bookmarks', '[]')
	}

	removeBookmark({id, mission}){
		this.bookmarks = id ? this.bookmarks.filter(bm => bm.c || bm.id !== id) : this.bookmarks.filter(bm => !bm.c || bm.m !== mission)
		localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
	}

	loadGameFromBookmark(bm){
		if (bm.c){
			this.setCurrentGame(this.boardFromCustomMission(bm.m))
		} else {
			this.setCurrentGame(new Board(missions[modeDecoder[bm.id[0]]][difficultyDecoder[bm.id[1]]].find(mission => mission.id === bm.id), true))
		}
	}

	resetStatistics(){
		this.statistics = defaultStatistics
		localStorage.setItem('statistics', 	JSON.stringify(this.statistics))
	}
}

export default new GameHandler()
