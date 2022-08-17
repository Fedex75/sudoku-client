import axios from "axios"

class API {
	constructor(){
		this.host = 'https://sudoku.zaifo.com.ar'
	}

	getAllGames(){
		return new Promise((resolve, reject) => {
			axios.get(`${this.host}/api/sudoku/all_games`).then(res => {
				resolve(res.data)
			}).catch(e => {
				reject(e)
			})
		})
	}

	getNewGames(cache){
		return new Promise((resolve, reject) => {
			axios.post(`${this.host}/api/sudoku/new_games`, {cache: cache}).then(res => {
				resolve(res.data)
			}).catch(e => {
				reject(e)
			})
		})
	}

	saveGame(board){
		return new Promise((resolve, reject) => {
			try {
				axios.post(`${this.host}/api/user/savegame`, {board: board}, {withCredentials: true}).then(res => {
					resolve(res.data)
				})	
			} catch(e){
				reject()
			}
		})
	}

	logError(error){
		return new Promise((resolve, reject) => {
			axios.post(`${this.host}/api/admin/logerror`, error, {withCredentials: true}).then(() => {
				resolve()
			}).catch(e => {
				reject()
			})
		})
	}
}

export default new API()