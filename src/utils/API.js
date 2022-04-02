import axios from "axios";

class API {
	constructor(){
		this.host = 'https://sudoku.zaifo.com.ar';
	}

	getGame(id, difficulty, mode){
		return new Promise((resolve, reject) => {
			axios.get(`${this.host}/api/sudoku?id=${id || ''}&level=${difficulty || 'expert'}&mode=${mode || 'classic'}`).then(res => {
				resolve(res.data);
			});
		});
	}

	saveGame(board){
		return new Promise((resolve, reject) => {
			axios.post(`${this.host}/api/user/savegame`, {board: board}, {withCredentials: true}).then(res => {
				resolve(res.data);
			});
		});
	}
}

export default new API();