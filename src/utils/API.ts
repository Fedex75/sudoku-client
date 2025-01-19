import axios from "axios"

class API {
	host: string
	clientVersion: string
	clientVersionIsBeta: boolean

	constructor() {
		this.host = 'https://sudoku.zaifo.com.ar'
		this.clientVersion = '3.0.1'
		this.clientVersionIsBeta = false
	}

	log(error: any) {
		return new Promise<void>((resolve, reject) => {
			try {
				console.error(error)
				axios.post(`${this.host}/api/admin/logerror`, JSON.stringify(error), { withCredentials: true }).then(() => {
					resolve()
				}).catch(e => {
					reject()
				})
			} catch (e) { }
		})
	}
}

export default new API()
