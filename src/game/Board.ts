import SettingsHandler from "../utils/SettingsHandler"
import GameHandler from "../utils/GameHandler"
import { DifficultyName, GameModeIdentifier, GameModeName, decodeMode } from "../utils/Difficulties"
import { BoardMatrix, BoardAnimation, Cell, CellCoordinates, ColorGroup, GameData, History, RawGameData, isGameData, Ruleset, HistoryItem, KillerCage } from "../utils/DataTypes"
import { ColorName } from "../utils/Colors"
import { indexOfCoordsInArray, removeByReference } from "../utils/Utils"
import { rulesets } from "./gameModes/Rulesets"

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

	units: CellCoordinates[][]

	animations: BoardAnimation[]

	killer__cages: KillerCage[]
	killer__cageErrors: KillerCage[]

	sandwich__horizontalClues: number[]
	sandwich__verticalClues: number[]
	sandwich__visibleHorizontalClues: boolean[]
	sandwich__visibleVerticalClues: boolean[]
	sandwich__lateralCluesErrors: { horizontal: boolean[], vertical: boolean[] }

	sudokuX__diagonalErrors: [boolean, boolean]

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

		this.units = []

		this.killer__cages = []
		this.killer__cageErrors = []

		this.sandwich__horizontalClues = []
		this.sandwich__verticalClues = []
		this.sandwich__visibleHorizontalClues = []
		this.sandwich__visibleVerticalClues = []
		this.sandwich__lateralCluesErrors = { horizontal: [], vertical: [] }

		this.sudokuX__diagonalErrors = [false, false]

		if (isGameData(data)) {
			this.mode = data.mode
		} else {
			this.mode = decodeMode(data.id[0] as GameModeIdentifier)
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
					clue: number > 0,
					value: number,
					notes: [],
					solution: this.solution === '' ? 0 : Number.parseInt(this.solution[y * this.nSquares + x]),
					color: 'default',
					possibleValues: [],
					visibleCells: [],
					units: [],
					isError: false,
					colorGroups: []
				}
			}
		}

		for (const func of this.ruleset.game.initBoardMatrix) func(this)
		this.recreateCache()
	}

	getCompletedNumbers() {
		let completedNumbers: number[] = []
		let count = Array(this.nSquares).fill(0)
		this.iterateAllCells((cell) => {
			if (cell.value > 0 && !cell.isError) {
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
					solution: cell.solution,
					clue: cell.clue,
					possibleValues: [],
					visibleCells: [],
					units: [],
					isError: cell.isError,
					colorGroups: []
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

			for (const func of this.ruleset.game.initBoardMatrix) func(this)
			this.recreateCache()
		}
	}

	get(c: CellCoordinates) {
		if (c.x >= 0 && c.x < this.board.length && c.y >= 0 && c.y < this.board[c.x].length) {
			return this.board[c.x][c.y]
		} else {
			return this.board[0][0]
		}
	}

	selectCell(c: CellCoordinates) {
		const index = indexOfCoordsInArray(this.selectedCells, c)
		if (index === -1) this.selectedCells.push(c)
		return this.selectedCells = this.selectedCells.filter((_, i) => i !== index)
	}

	selectBox(c1: CellCoordinates, c2: CellCoordinates) {
		const minX = Math.min(c1.x, c2.x)
		const maxX = Math.max(c1.x, c2.x)
		const minY = Math.min(c1.y, c2.y)
		const maxY = Math.max(c1.y, c2.y)
		this.selectedCells = []
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				this.selectedCells.push({ x, y })
			}
		}
	}

	onlyAvailableInAnyUnit(c: CellCoordinates, n: number) {
		if (!this.get(c).possibleValues.includes(n)) return false
		for (const unit of this.get(c).units) {
			let found = 0
			for (const coords of unit) {
				const cell = this.get(coords)
				if (cell.value === 0 && cell.possibleValues.includes(n)) {
					found++
				}
			}
			if (found === 1) {
				return true
			}
		}

		return false
	}

	setNote(coords: CellCoordinates[], n: number, state: boolean | null = null, checkAutoSolution: boolean = true): boolean | null {
		let finalNoteState: boolean | null = null

		for (const c of coords) {
			const cell = this.get(c)

			if (cell.value === 0) {
				//Check if only available place in any unit
				if (SettingsHandler.settings.autoSolveOnlyInBox && checkAutoSolution && this.onlyAvailableInAnyUnit(c, n)) {
					finalNoteState = true
					this.setValue([c], n)
					this.hasChanged = true
				} else if (cell.notes.includes(n)) {
					if (state !== true) {
						//Remove note
						this.get(c).notes = cell.notes.filter(note => note !== n)
						this.hasChanged = true
						if (
							(
								(SettingsHandler.settings.autoSolveCellsWithColor && cell.color !== 'default') ||
								(SettingsHandler.settings.autoSolveCellsFullNotation && this.fullNotation)
							) &&
							this.get(c).notes.length === 1
						) {
							finalNoteState = true
							this.setValue([c], this.get(c).notes[0])
						}
					}
				} else if (state !== false && (!SettingsHandler.settings.lockCellsWithColor || (cell.color === 'default'))) {
					//Add note
					if (!SettingsHandler.settings.showPossibleValues || this.get(c).possibleValues.includes(n)) {
						this.get(c).notes.push(n)
						finalNoteState = true
						this.hasChanged = true
					}
				}
			}
		}

		if (coords.length === 1) {
			return finalNoteState
		}
		return null
	}

	setValue(coords: CellCoordinates[], s: number) {
		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.clue && cell.value !== s) {
				cell.value = s
				cell.notes = []
				this.hasChanged = true
				for (const visibleCell of cell.visibleCells) {
					if (SettingsHandler.settings.autoRemoveCandidates) this.setNote([visibleCell], s, false, false)
				}

				if (SettingsHandler.settings.clearColorOnInput) {
					// If the cell is in a color group
					if (cell.colorGroups.length > 0) {
						// If every cell in every color group has a value, clear their color and remove the color group
						if (cell.colorGroups.every(cg => cg.members.every(colorGroupCellCoords => this.get(colorGroupCellCoords).value > 0))) {
							for (const cg of cell.colorGroups) {
								for (const colorGroupCellCoords of cg.members) {
									this.get(colorGroupCellCoords).color = 'default'
								}
							}
							this.removeColorGroups(cell.colorGroups)
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

	hint(coords: CellCoordinates[]) {
		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.clue && cell.solution > 0) {
				this.setValue([c], this.get(c).solution)
				this.get(c).clue = true
				this.hasChanged = true
			}
		}
	}

	erase(coords: CellCoordinates[]) {
		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.clue && (cell.value > 0 || cell.notes.length > 0 || cell.color !== 'default')) {
				cell.value = 0
				cell.notes = []
				cell.color = 'default'

				if (cell.colorGroups.length > 0) {
					this.removeColorGroups(cell.colorGroups)
				}

				this.hasChanged = true
			}
		}
	}

	calculateHighlightedCells(lockedInput: number) {
		let highlightedCells: boolean[][] = Array<number>(this.nSquares).fill(0).map(x => Array(this.nSquares).fill(false))
		let targetValues: number[] = []

		if (SettingsHandler.settings.advancedHighlight) {
			if (lockedInput > 0) {
				targetValues = [lockedInput]
			} else {
				for (const c of this.selectedCells) {
					if (this.get(c).value > 0) targetValues.push(this.get(c).value)
				}
			}

			if (targetValues.length > 0) {
				this.iterateAllCells((cell, { x, y }) => {
					if (!targetValues.every(v => cell.possibleValues.includes(v))) highlightedCells[x][y] = true
				})
			}

			this.iterateAllCells((cell, { x, y }) => { if (cell.value > 0) highlightedCells[x][y] = true })
		}

		if (!SettingsHandler.settings.advancedHighlight || targetValues.length === 0) {
			for (const sc of this.selectedCells) {
				for (const { x, y } of this.get(sc).visibleCells) {
					highlightedCells[x][y] = true
				}
			}
		}

		return highlightedCells
	}

	calculateLinks(n: number) {
		let links: CellCoordinates[][] = []

		for (const unit of this.units) {
			let newLink = []
			for (const c of unit) {
				if (this.get(c).notes.includes(n)) {
					newLink.push(c)
				}
			}
			if (newLink.length <= 2) {
				links.push(newLink)
			}
		}

		return links
	}

	setColor(coords: CellCoordinates, newColor: ColorName) {
		if (GameHandler.complete) return
		const cell = this.get(coords)
		if (cell.color !== newColor) {
			this.get(coords).color = newColor
			this.hasChanged = true
		}
	}

	clearColors() {
		this.iterateAllCells(cell => {
			if (cell.color !== 'default') {
				cell.color = 'default'
				cell.colorGroups = []
				this.hasChanged = true
			}
		})
		this.colorGroups = []
	}

	checkComplete(): boolean {
		this.checkErrors()
		let complete = true
		this.iterateAllCells((cell, coords, exit) => {
			if (cell.value === 0 || cell.isError) {
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

	checkFullNotation(force: boolean) {
		if (this.fullNotation && !force) return

		for (const unit of this.units) {
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
		this.iterateAllCells(cell => { text += cluesOnly && !cell.clue ? 0 : cell.value })
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

	removeColorGroups(groupsToRemove: ColorGroup[]) {
		for (const group of groupsToRemove) {
			// Remove the reference to the group from its members
			for (const cell of group.members) {
				removeByReference(this.get(cell).colorGroups, group)
			}

			// Remove the color group
			removeByReference(this.colorGroups, group)
		}
	}

	checkErrors() {
		this.ruleset.game.checkErrors(this)
	}

	recreateCache() {
		for (const func of this.ruleset.game.afterValuesChanged) func(this)
		this.checkFullNotation(false)
		this.checkComplete()
	}
}
