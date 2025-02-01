import missionsData from '../data/missions.json'
import { difficulties, DifficultyIdentifier, DifficultyName, GameModeIdentifier, GameModeName, getDifficulty, getMode } from './Difficulties'
import { defaultStatistics, Statistics, update } from './Statistics'
import { Bookmark, GameData, MissionsData, RawGameData } from './DataTypes'
import { BoardFactory } from '../game/gameModes/BoardFactory'
import { STORAGE_SCHEMA_VERSION, BOARD_API_VERSION, RECOMMENDATIONS_API_VERSION, BOOKMARKS_API_VERSION, SOLVED_API_VERSION, STATISTICS_API_VERSION } from './Constants'
import { getStoredData, saveData } from './hooks/LocalStorageHandler'
import { getCurrentSettings } from './hooks/SettingsHandler'
import Board from './Board'

type Recommendations = {
    newGame: {
        mode: GameModeName
        difficulty: DifficultyName
    }
    perMode: {
        classic: DifficultyName
        killer: DifficultyName
        sudokuX: DifficultyName
        sandwich: DifficultyName
        thermo: DifficultyName
    }
}

const defaultRecommendations: Recommendations = {
    newGame: {
        mode: 'classic',
        difficulty: 'easy'
    },
    perMode: {
        classic: 'easy',
        killer: 'easy',
        sudokuX: 'easy',
        sandwich: 'easy',
        thermo: 'easy'
    }
}

const RECOMMENDATIONS_KEY = 'recommendations'
const GAME_KEY = 'game'
const BOOKMARKS_KEY = 'bookmarks'
const SOLVED_KEY = 'solved'
const STATISTICS_KEY = 'statistics'

class GameHandler {
    game: Board | null
    bookmarks: Bookmark[]
    solved: string[]
    recommendations: Recommendations
    statistics: Statistics<GameModeName, DifficultyName>
    missions: MissionsData<GameModeName, DifficultyName> = missionsData as MissionsData<GameModeName, DifficultyName>

    constructor() {
        this.game = null
        this.bookmarks = []
        this.solved = []
        this.recommendations = defaultRecommendations
        this.statistics = defaultStatistics
        this.init()
    }

    init() {
        const ls_schema_version = localStorage.getItem('SCHEMA_VERSION')
        if (ls_schema_version === null || parseInt(ls_schema_version) < STORAGE_SCHEMA_VERSION) {
            localStorage.clear()
            localStorage.setItem('SCHEMA_VERSION', STORAGE_SCHEMA_VERSION.toString())
        }

        this.recommendations = getStoredData(RECOMMENDATIONS_KEY, RECOMMENDATIONS_API_VERSION, defaultRecommendations)

        this.game = getStoredData(GAME_KEY, BOARD_API_VERSION, null, (gameData: GameData) => gameData ? BoardFactory(getMode(gameData.id[0] as GameModeIdentifier), gameData, getCurrentSettings()) : null)

        this.bookmarks = getStoredData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, [])

        this.solved = getStoredData(SOLVED_KEY, SOLVED_API_VERSION, [])

        this.statistics = getStoredData(STATISTICS_KEY, STATISTICS_API_VERSION, defaultStatistics)
    }

    setCurrentGame(board: Board) {
        this.game = board
        this.saveGame()
        this.recommendations.newGame = {
            mode: this.game.mode,
            difficulty: this.game.difficulty
        }
        this.recommendations.perMode[this.game.mode] = getDifficulty(this.game.id[1] as DifficultyIdentifier)
        saveData(RECOMMENDATIONS_KEY, RECOMMENDATIONS_API_VERSION, this.recommendations)
    }

    createNewGame(mode?: GameModeName, difficulty?: DifficultyName): Board | undefined {
        if (!mode) {
            mode = this.recommendations.newGame.mode
            difficulty = this.recommendations.newGame.difficulty
        }

        if (!mode) return

        if (!difficulty) difficulty = this.recommendations.perMode[mode]
        if (!difficulty) return

        if (!this.missions[mode]) return

        let allMissions = this.missions[mode][difficulty]
        if (!allMissions) return

        let candidates = allMissions.filter(c => !this.solved.includes(c.id))
        if (candidates.length === 0) {
            if (allMissions.length === 0) {
                for (let diff of difficulties[mode]) {
                    allMissions = this.missions[mode][diff]
                    if (!allMissions || allMissions.length > 0) continue
                    candidates = allMissions
                    break
                }
            } else {
                candidates = allMissions
            }
        }
        if (candidates.length > 0) {
            const rawData = candidates[Math.floor(Math.random() * candidates.length)]
            return BoardFactory(mode, {
                id: rawData.id,
                mission: rawData.m
            }, getCurrentSettings())
        }
    }

    boardFromCustomMission(mode: GameModeName, mission: string) {
        return BoardFactory(mode, {
            id: '',
            mission: mission
        })
    }

    /*importGame(data: string) {
        if (data[0] === '{') {
            //Data is mission JSON
            try {
                const rawData = JSON.parse(data) as RawGameData
                this.setCurrentGame(new Board({
                    id: rawData.id,
                    mission: rawData.m
                }))
                return (true)
            } catch (e) {
                return (false)
            }
        } else {
            //Data is board text representation
            if (decodeMissionString(data).length === 81) {
                this.setCurrentGame(this.boardFromCustomMission(data))
                return (true)
            } else {
                return (false)
            }
        }
    }*/

    findMissionFromID(id: string) {
        const mode = getMode(id[0] as GameModeIdentifier)
        const diff = getDifficulty(id[1] as DifficultyIdentifier)
        if (!this.missions[mode] || !this.missions[mode][diff]) return undefined
        return this.missions[mode][diff].find(mission => mission.id === id) as RawGameData
    }

    exportMission() {
        if (this.game) {
            return JSON.stringify(this.findMissionFromID(this.game.id))
        }
        return ''
    }

    saveGame() {
        if (!this.game) return
        saveData(GAME_KEY, BOARD_API_VERSION, this.game.dataToSave)
    }

    setComplete() {
        if (this.game) {
            saveData(GAME_KEY, BOARD_API_VERSION, null)
            if (this.game.difficulty !== 'unrated' && !this.solved.includes(this.game.id)) this.solved.push(this.game.id)
            saveData(SOLVED_KEY, SOLVED_API_VERSION, this.solved)
            update(this.statistics[this.game.mode][this.game.difficulty], this.game.timer)
            saveData(STATISTICS_KEY, STATISTICS_API_VERSION, this.statistics)
        }
    }

    currentGameIsBookmarked() {
        if (!this.game) return false

        if (this.game.id === '') {
            return this.bookmarks.some(bm => bm.m === this.game?.mission)
        } else {
            return this.bookmarks.some(bm => bm.id === this.game?.id)
        }
    }

    bookmarkCurrentGame() {
        if (this.game === null) return
        if (!this.currentGameIsBookmarked()) {
            if (this.game.difficulty === 'unrated') {
                this.bookmarks.push({
                    id: this.game.id
                })
            } else {
                this.bookmarks.push({
                    id: this.game.id,
                    m: this.game.mission
                })
            }
            saveData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, this.bookmarks)
        }
    }

    clearBookmarks() {
        this.bookmarks = []
        saveData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, this.bookmarks)
    }

    removeBookmark(bm: Bookmark) {
        const bmString = JSON.stringify(bm)
        this.bookmarks = this.bookmarks.filter(bm2 => bmString !== JSON.stringify(bm2))
        saveData(BOOKMARKS_KEY, BOOKMARKS_API_VERSION, this.bookmarks)
    }

    createNewGameFromBookmark(bm: Bookmark) {
        const rawData = this.findMissionFromID(bm.id)
        if (!rawData) return
        return BoardFactory(getMode(rawData.id[0] as GameModeIdentifier), {
            id: rawData.id,
            mission: rawData.m
        })
    }

    resetStatistics() {
        this.statistics = defaultStatistics
        saveData(STATISTICS_KEY, STATISTICS_API_VERSION, this.statistics)
    }
}

export default new GameHandler()
