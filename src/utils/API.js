import axios from "axios";

class API {
	constructor(){
		this.host = 'https://sudoku.zaifo.com.ar';
	}

	getGame(level = 'expert'){
		return new Promise((resolve, reject) => {
			axios.get(`${this.host}/api/sudoku?level=${level}`).then(res => {
				resolve(res.data);
			});
		});
	}
}

export default new API();