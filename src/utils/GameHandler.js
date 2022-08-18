import Board from './Board'

import missions from '../data/missions.json'
import Decoder from './Decoder'
import { difficultyDecoder, modeDecoder } from './Difficulties'

const BOARD_API_VERSION = 4
const STORAGE_SCHEMA_VERSION = 1

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
			this.setCurrentGame(new Board(data, false))
		} else {
			this.game = null
			this.complete = false
		}

		const lsBookmarks = localStorage.getItem('bookmarks')
		this.bookmarks = lsBookmarks ? JSON.parse(lsBookmarks) : []

		const lsSolved = localStorage.getItem('solved')
		this.solved = lsSolved ? JSON.parse(lsSolved) : []
	}

	setCurrentGame(board){
		this.game = board
		this.complete = false
		this.game.version = BOARD_API_VERSION
		this.saveGame(JSON.stringify(this.game))
	}

	newGame(mode, difficulty){
		if (difficulty === 'restart'){
			this.game.restart()
			this.complete = false
			return
		}

		let candidates = missions[mode][difficulty].filter(c => !this.solved.some(mission => !mission.c && mission.id === c.id))
		if (candidates.length === 0) candidates = missions[mode][difficulty]
		this.setCurrentGame(new Board(candidates[Math.floor(Math.random() * candidates.length)], true))
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
		this.complete = true
		localStorage.removeItem('game')
		if (this.game.difficulty === 'custom'){
			if (!this.solved.some(mission => mission.c && mission.m === this.game.mission)){
				this.solved.push({
					c: 1,
					m: this.game.mission
				})
			}
		} else {
			if (!this.solved.some(mission => !mission.c && mission.id === this.game.id)){
				this.solved.push({
					c: 0,
					id: this.game.id
				})
			}
		}
		localStorage.setItem('solved', JSON.stringify(this.solved))
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

	removeBookmark({id, mission}){
		if (id){
			this.bookmarks = this.bookmarks.filter(bm => bm.c || bm.id !== id)
		} else {
			this.bookmarks = this.bookmarks.filter(bm => !bm.c || bm.m !== mission)
		}
		localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
	}

	loadGameFromBookmark(bm){
		if (bm.c){
			this.setCurrentGame(this.boardFromCustomMission(bm.m))
		} else {
			this.setCurrentGame(new Board(missions[modeDecoder[bm.id[0]]][difficultyDecoder[bm.id[1]]].find(mission => mission.id === bm.id), true))
		}
	}
}

export default new GameHandler()