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
}

export default new API();