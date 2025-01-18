import SettingsHandler from "../utils/SettingsHandler"
import GameHandler from "../utils/GameHandler"
import { DifficultyName, GameModeIdentifier, GameModeName, getMode } from "../utils/Difficulties"
import { BoardMatrix, BoardAnimation, Cell, CellCoordinates, ColorGroup, GameData, History, RawGameData, isGameData, Ruleset, HistoryItem, KillerCage, CacheItem } from "../utils/DataTypes"
import { ColorName } from "../utils/Colors"
import { indexOf, intersection, remove } from "../utils/Utils"
import { rulesets } from "./gameModes/Rulesets"

const defaultCacheItem: CacheItem = {
	clue: false,
	solution: 0,
	possibleValues: [],
	visibleCells: [],
	units: [],
	isError: false,
	colorGroups: []
}

export default class Board {
	// Constants
	id: string
	mode: GameModeName
	difficulty: DifficultyName
	mission: string
	clues: string
	solution: string
	nSquares: number
	version: number = 0;
	ruleset: Ruleset

	private board: BoardMatrix
	selectedCells: CellCoordinates[]
	timer: number

	private stash: string
	hasChanged: boolean
	history: History
	fullNotation: boolean
	colorGroups: ColorGroup[]

	animations: BoardAnimation[]

	cache: {
		board: CacheItem[][]

		units: CellCoordinates[][]

		killer__cages: KillerCage[]
		killer__cageErrors: KillerCage[]

		sandwich__horizontalClues: number[]
		sandwich__verticalClues: number[]
		sandwich__visibleHorizontalClues: boolean[]
		sandwich__visibleVerticalClues: boolean[]
		sandwich__lateralCluesErrors: { horizontal: boolean[], vertical: boolean[] }

		sudokuX__diagonalErrors: [boolean, boolean]
	}

	constructor(data: GameData | RawGameData, nSquares: number) {
		this.id = data.id
		this.nSquares = nSquares
		this.fullNotation = false
		this.selectedCells = []
		this.history = []
		this.board = []
		this.timer = 0
		this.difficulty = 'unrated'
		this.mission = ''
		this.clues = ''
		this.solution = ''
		this.colorGroups = []
		this.stash = ''
		this.hasChanged = false
		this.animations = []

		this.cache = {
			board: [],
			units: [],
			killer__cages: [],
			killer__cageErrors: [],
			sandwich__horizontalClues: [],
			sandwich__verticalClues: [],
			sandwich__visibleHorizontalClues: [],
			sandwich__visibleVerticalClues: [],
			sandwich__lateralCluesErrors: {
				horizontal: [],
				vertical: []
			},
			sudokuX__diagonalErrors: [false, false],
		}

		if (isGameData(data)) {
			this.mode = data.mode
		} else {
			this.mode = getMode(data.id[0] as GameModeIdentifier)
		}

		this.ruleset = rulesets[this.mode]

		if (isGameData(data)) {
			this.difficulty = data.difficulty
			this.mission = data.mission
			this.clues = data.clues
			this.solution = data.solution
			this.timer = data.timer
			this.selectedCells = data.selectedCells
			this.history = data.history
			this.board = data.board
			this.colorGroups = data.colorGroups
			this.recreateCache()
		} else {
			this.ruleset.game.initGameData({ game: this, data })
			this.initBoard()
		}
	}

	initBoard() {
		//Create game from raw data
		this.selectedCells = []
		this.history = []
		this.board = []
		this.timer = 0
		this.colorGroups = []
		this.stash = ''
		this.hasChanged = false
		this.animations = []

		for (let x = 0; x < this.nSquares; x++) {
			this.board.push(Array(this.nSquares).fill(null))
			for (let y = 0; y < this.nSquares; y++) {
				const number = Number.parseInt(this.clues[y * this.nSquares + x])
				this.board[x][y] = {
					value: number,
					notes: [],
					color: 'default',
					cache: defaultCacheItem
				}
			}
		}

		this.recreateCache()
	}

	getCompletedNumbers() {
		let completedNumbers: number[] = []
		let count = Array(this.nSquares).fill(0)
		this.iterateAllCells((cell) => {
			if (cell.value > 0 && !cell.cache.isError) {
				count[cell.value - 1]++
				if (count[cell.value - 1] === this.nSquares) {
					completedNumbers.push(cell.value)
				}
			}
		})

		return completedNumbers
	}

	getBoardToSave() {
		const boardToSave: BoardMatrix = []
		for (let x = 0; x < this.nSquares; x++) {
			const col: Cell[] = []
			for (let y = 0; y < this.nSquares; y++) {
				const cell = this.get({ x, y })
				col.push({
					value: cell.value,
					notes: cell.notes,
					color: cell.color,
					cache: defaultCacheItem
				})
			}
			boardToSave.push(col)
		}

		return boardToSave
	}

	getColorGroupsToSave(): ColorGroup[] {
		return this.colorGroups.map(cg => ({
			members: cg.members,
			visibleCells: []
		}))
	}

	stashBoard() {
		const item: HistoryItem = {
			board: this.getBoardToSave(),
			fullNotation: this.fullNotation,
			colorGroups: this.getColorGroupsToSave()
		}

		this.stash = JSON.stringify(item)
		this.hasChanged = false
	}

	pushBoard() {
		if (this.stash && this.hasChanged) {
			this.history.push(this.stash)
			this.hasChanged = false
			if (process.env.NODE_ENV === 'development') this.saveToLocalStorage()
		}
	}

	popBoard() {
		if (this.history.length > 0) {
			const item: HistoryItem = JSON.parse(this.history[this.history.length - 1])
			this.board = item.board
			this.colorGroups = item.colorGroups
			this.history.pop()

			this.recreateCache()
		}
	}

	get(coords: CellCoordinates) {
		return this.board[coords.x][coords.y]
	}

	select(coords: CellCoordinates) {
		const index = indexOf(coords, this.selectedCells)
		if (index === -1) this.selectedCells.push(coords)
		return this.selectedCells = this.selectedCells.filter((_, i) => i !== index)
	}

	selectBox(from: CellCoordinates, to: CellCoordinates) {
		const minX = Math.min(from.x, to.x)
		const maxX = Math.max(from.x, to.x)
		const minY = Math.min(from.y, to.y)
		const maxY = Math.max(from.y, to.y)
		this.selectedCells = []
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				this.selectedCells.push({ x, y })
			}
		}
	}

	onlyAvailableInAnyUnit(c: CellCoordinates, n: number) {
		if (!this.get(c).cache.possibleValues.includes(n)) return false
		for (const unit of this.get(c).cache.units) {
			let found = 0
			for (const coords of unit) {
				const cell = this.get(coords)
				if (cell.value === 0 && cell.cache.possibleValues.includes(n)) {
					found++
				}
			}
			if (found === 1) {
				return true
			}
		}

		return false
	}

	setNote(_: number, of: CellCoordinates[], to: boolean | null = null, checkingAutoSolution: boolean = true): boolean | null {
		let finalNoteState: boolean | null = null

		for (const c of of) {
			const cell = this.get(c)

			if (cell.value === 0) {
				//Check if only available place in any unit
				if (SettingsHandler.settings.autoSolveOnlyInBox && checkingAutoSolution && this.onlyAvailableInAnyUnit(c, _)) {
					finalNoteState = true
					this.setValue([c], _)
					this.hasChanged = true
				} else if (cell.notes.includes(_)) {
					if (to !== true) {
						//Remove note
						this.get(c).notes = cell.notes.filter(note => note !== _)
						this.hasChanged = true
						if ((SettingsHandler.settings.autoSolveCellsFullNotation && this.fullNotation) && this.get(c).notes.length === 1) {
							finalNoteState = true
							this.setValue([c], this.get(c).notes[0])
						}
					}
				} else if (to !== false && (!SettingsHandler.settings.lockCellsWithColor || (cell.color === 'default'))) {
					//Add note
					if (!SettingsHandler.settings.showPossibleValues || this.get(c).cache.possibleValues.includes(_)) {
						this.get(c).notes.push(_)
						finalNoteState = true
						this.hasChanged = true
					}
				}
			}
		}

		if (of.length === 1) {
			return finalNoteState
		}
		return null
	}

	setValue(of: CellCoordinates[], to: number) {
		for (const c of of) {
			const cell = this.get(c)
			if (!cell.cache.clue && cell.value !== to) {
				cell.value = to
				cell.notes = []
				this.hasChanged = true
				for (const visibleCell of cell.cache.visibleCells) {
					if (SettingsHandler.settings.autoRemoveCandidates) this.setNote(to, [visibleCell], false, false)
				}

				if (SettingsHandler.settings.clearColorOnInput) {
					// If the cell is in a color group
					if (cell.cache.colorGroups.length > 0) {
						// If every cell in every color group has a value, clear their color and remove the color group
						if (cell.cache.colorGroups.every(cg => cg.members.every(colorGroupCellCoords => this.get(colorGroupCellCoords).value > 0))) {
							for (const cg of cell.cache.colorGroups) {
								for (const colorGroupCellCoords of cg.members) {
									this.get(colorGroupCellCoords).color = 'default'
								}
							}
							this.remove(cell.cache.colorGroups)
						}

					} else {
						cell.color = 'default'
					}
				}

				//Check animations
				for (const func of this.ruleset.game.checkAnimations) func(this, c)
			}
		}
	}

	giveHint(forCells: CellCoordinates[]) {
		for (const c of forCells) {
			const cell = this.get(c)
			if (!cell.cache.clue && cell.cache.solution > 0) {
				this.setValue([c], this.get(c).cache.solution)
				this.get(c).cache.clue = true
				this.hasChanged = true
			}
		}
	}

	erase(coords: CellCoordinates[]) {
		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.cache.clue && (cell.value > 0 || cell.notes.length > 0 || cell.color !== 'default')) {
				cell.value = 0
				cell.notes = []
				cell.color = 'default'

				if (cell.cache.colorGroups.length > 0) {
					this.remove(cell.cache.colorGroups)
				}

				this.hasChanged = true
			}
		}
	}

	getHighlightedCells(forValue: number) {
		let highlightedCells: boolean[][] = Array<number>(this.nSquares).fill(0).map(x => Array(this.nSquares).fill(false))
		let targetValues: number[] = []

		if (SettingsHandler.settings.advancedHighlight) {
			if (forValue > 0) {
				targetValues = [forValue]
			} else {
				for (const c of this.selectedCells) {
					if (this.get(c).value > 0) targetValues.push(this.get(c).value)
				}
			}

			if (targetValues.length > 0) {
				this.iterateAllCells((cell, { x, y }) => {
					if (!targetValues.every(v => cell.cache.possibleValues.includes(v))) highlightedCells[x][y] = true
				})
			}

			this.iterateAllCells((cell, { x, y }) => { if (cell.value > 0) highlightedCells[x][y] = true })
		}

		if (!SettingsHandler.settings.advancedHighlight || targetValues.length === 0) {
			for (const sc of this.selectedCells) {
				for (const { x, y } of this.get(sc).cache.visibleCells) {
					highlightedCells[x][y] = true
				}
			}
		}

		return highlightedCells
	}

	getLinks(forValue: number) {
		let links: CellCoordinates[][] = []

		for (const unit of this.cache.units) {
			let newLink = []
			for (const c of unit) {
				if (this.get(c).notes.includes(forValue)) {
					newLink.push(c)
				}
			}
			if (newLink.length <= 2) {
				links.push(newLink)
			}
		}

		return links
	}

	setColor(of: CellCoordinates, to: ColorName) {
		if (GameHandler.complete) return
		const cell = this.get(of)
		if (cell.color !== to) {
			this.get(of).color = to
			this.hasChanged = true
		}
	}

	clearColors() {
		this.iterateAllCells(cell => {
			if (cell.color !== 'default') {
				cell.color = 'default'
				cell.cache.colorGroups = []
				this.hasChanged = true
			}
		})
		this.colorGroups = []
	}

	isComplete(): boolean {
		this.checkErrors()
		let complete = true
		this.iterateAllCells((cell, coords, exit) => {
			if (cell.value === 0 || cell.cache.isError) {
				complete = false
				exit()
			}
		})
		return complete
	}

	saveToLocalStorage() {
		const dataToSave: GameData = {
			id: this.id,
			mode: this.mode,
			difficulty: this.difficulty,
			mission: this.mission,
			clues: this.clues,
			solution: this.solution,
			board: this.getBoardToSave(),
			colorGroups: this.getColorGroupsToSave(),
			timer: this.timer,
			selectedCells: this.selectedCells,
			history: this.history,
			version: this.version,
		}

		GameHandler.saveGame(JSON.stringify(dataToSave))
	}

	checkFullNotation() {
		if (this.fullNotation) return

		for (const unit of this.cache.units) {
			for (let n = 1; n <= 9; n++) {
				let found = false
				for (const c of unit) {
					const cell = this.get(c)
					if (cell.value === n || cell.notes.includes(n)) {
						found = true
						break
					}
				}
				if (!found) {
					this.fullNotation = false
					return
				}
			}
		}

		this.fullNotation = true

		if (SettingsHandler.settings.clearColorFullNotation) this.clearColors()
	}

	getTextRepresentation(cluesOnly: boolean) {
		let text = ''
		this.iterateAllCells(cell => { text += cluesOnly && !cell.cache.clue ? 0 : cell.value })
		return text
	}

	restart() {
		this.initBoard()
		this.fullNotation = false
	}

	setTimer(timestamp: number) {
		this.timer = timestamp
	}

	iterateAllCells(func: (cell: Cell, coords: CellCoordinates, exit: () => void) => void) {
		this.ruleset.game.iterateAllCells(this, func)
	}

	createColorGroup(withCells: CellCoordinates[], painted: ColorName) {
		if (withCells.length < 2 || painted === 'default') return

		const newColorGroup = {
			members: withCells,
			visibleCells: intersection(withCells.map(c => this.get(c).cache.visibleCells))
		}

		this.colorGroups.push(newColorGroup)

		for (const cell of withCells) {
			this.get(cell).cache.colorGroups.push(this.colorGroups[this.colorGroups.length - 1])
			this.get(cell).color = painted
		}

		this.hasChanged = true
	}

	remove(colorGroups: ColorGroup[]) {
		for (const group of colorGroups) {
			// Remove the reference to the group from its members
			for (const c of group.members) {
				remove(group, this.get(c).cache.colorGroups)
				this.get(c).color = 'default'
			}

			// Remove the color group
			remove(group, this.colorGroups)
		}
	}

	checkErrors() {
		this.ruleset.game.checkErrors(this)
	}

	recreateCache() {
		for (const func of this.ruleset.game.initBoardMatrix) func(this)
		for (const func of this.ruleset.game.afterValuesChanged) func(this)
		this.checkFullNotation()
		this.isComplete()
	}
}
