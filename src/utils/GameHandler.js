import API from './API'
import Auth from './Auth'
import Board from './Board'

const BOARD_API_VERSION = 4

class GameHandler {
	constructor(){
		let data
		if (Auth.isAuthenticated() && Auth.user.savedGame){
			data = JSON.parse(Auth.user.savedGame)
		} else {
			const lsGame = localStorage.getItem('game');	
			data = lsGame ? JSON.parse(lsGame) : null
		}

		if (data?.version && data.version === BOARD_API_VERSION){
			this.game = new Board(data, false)
		} else {
			this.game = null
		}

		const lsBookmarks = localStorage.getItem('bookmarks')
		this.bookmarks = lsBookmarks ? JSON.parse(lsBookmarks) : []

		const lsSolved = localStorage.getItem('solved')
		this.solved = lsSolved ? JSON.parse(lsSolved) : []

		this.complete = false
	}

	init(){
		return new Promise(async (resolve, reject) => {
			this.missions = JSON.parse(localStorage.getItem('missions'))
			if (!this.missions){
				//Cache is empty, get all games
				API.getAllGames().then(missions => {
					this.missions = missions
					localStorage.setItem('missions', JSON.stringify(this.missions))
					resolve()
				}).catch(() => {
					//Download failed and there are no available games, reject
					reject()
				})
			} else {
				//Cache is not empty, get new games only
				resolve()
				API.getNewGames(this.missions.map(mission => mission._id)).then(new_missions => {
					this.missions.push(...new_missions)
					localStorage.setItem('missions', JSON.stringify(this.missions))
				}).catch(() => {})
			}
		})
	}

	setCurrentGame(board){
		this.game = board
		this.complete = false
		this.game.version = BOARD_API_VERSION
	}

	newGame(mode, difficulty){
		if (difficulty === 'restart'){
			this.game.restart()
			return
		}

		let candidates = this.missions.filter(m => m.mode === mode && m.difficulty === difficulty)
		const unsolvedCandidates = candidates.filter(c => !this.solved.some(mission => !mission.custom && mission._id === c._id))
		if (unsolvedCandidates.length > 0) candidates = unsolvedCandidates
		this.setCurrentGame(new Board(candidates[Math.floor(Math.random() * candidates.length)], true))
	}

	boardFromCustomMission(mission){
		return new Board({
			_id: null,
			id: null,
			mission: mission,
			solution: '0'.repeat(9*9),
			cages: null,
			difficulty: 'custom',
			mode: 'classic'
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
			if (
				data.length === 81 &&
				data.split('').every(char => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(char))
			){
				this.setCurrentGame(this.boardFromCustomMission(data))
				return(true)
			} else {
				return(false)
			}
		}
	}

	exportMission(){
		return JSON.stringify(this.missions.filter(m => m._id === this.game._id)[0])
	}

	saveGame(data){
		localStorage.setItem('game', data)
		if (Auth.isAuthenticated()){
			API.saveGame(data).then(() => {}).catch((e) => {})
		}
	}

	setComplete(){
		this.complete = true
		localStorage.removeItem('game')
		if (this.game.difficulty === 'custom'){
			if (!this.solved.some(mission => mission.custom && mission.mission === this.game.mission)){
				this.solved.push({
					custom: true,
					mission: this.game.mission
				})
			}
		} else {
			if (!this.solved.some(mission => !mission.custom && mission._id === this.game._id)){
				this.solved.push({
					custom: false,
					_id: this.game._id
				})
			}
		}
		localStorage.setItem('solved', JSON.stringify(this.solved))
	}

	currentGameIsBookmarked(){
		if (this.game.difficulty === 'custom'){
			return this.bookmarks.some(bm => bm.custom && bm.mission === this.game.mission)
		} else {
			return this.bookmarks.some(bm => !bm.custom && bm._id === this.game._id)
		}
	}

	bookmarkCurrentGame(){
		if (!this.currentGameIsBookmarked()){
			if (this.game.difficulty === 'custom'){
				this.bookmarks.push({
					custom: true,
					mission: this.game.mission
				})
			} else {
				this.bookmarks.push({
					custom: false,
					_id: this.game._id
				})
			}
		}
		localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
	}

	removeBookmark({id, mission}){
		if (id){
			this.bookmarks = this.bookmarks.filter(bm => bm.custom || bm._id !== id)
		} else {
			this.bookmarks = this.bookmarks.filter(bm => !bm.custom || bm.mission !== mission)
		}
		localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks))
	}

	loadGameFromBookmark(bm){
		if (bm.custom){
			this.setCurrentGame(this.boardFromCustomMission(bm.mission))
		} else {
			this.setCurrentGame(new Board(this.missions.filter(mission => mission._id === bm._id)[0], true))
		}
	}
}

export default new GameHandler()