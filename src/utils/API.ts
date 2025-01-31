import axios from "axios"
import buildInfoJSON from '../generatedGitInfo.json'

const buildInfo = buildInfoJSON as {
    gitBranch: string
    version: string
    gitCommitHash: string
}

class API {
    host: string
    clientVersion: string
    buildHash: string

    constructor() {
        this.host = 'https://sudoku.zaifo.com.ar'
        this.clientVersion = buildInfo.version
        this.buildHash = buildInfo.gitCommitHash
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
