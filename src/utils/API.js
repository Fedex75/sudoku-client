import axios from "axios"

class API {
	constructor(){
		this.host = 'https://sudoku.zaifo.com.ar'
		this.clientVersion = 'v2.0.0 Beta 7'
		this.clientVersionIsBeta = true
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