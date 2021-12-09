import axios from "axios";

class API {
	constructor(){
		this.host = 'http://localhost:8130'
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