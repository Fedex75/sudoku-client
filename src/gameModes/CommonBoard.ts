import SettingsHandler from "../utils/SettingsHandler"
import GameHandler from "../utils/GameHandler"
import { DifficultyName, GameModeIdentifier, GameModeName, decodeMode } from "../utils/Difficulties"
import { Board, BoardAnimation, Cell, CellCoordinates, GameData, History, RawGameData, isGameData } from "../utils/DataTypes"
import { ColorName } from "../utils/Colors"
import { indexOfCoordsInArray } from "../utils/CoordsUtils"
import { Ruleset, rulesets } from "./Rulesets"

export default class CommonBoard {
	// Constants
	id: string
	mode: GameModeName
	difficulty: DifficultyName
	mission: string
	clues: string
	cages: number[][][]
	solution: string
	nSquares: number
	version: number = 0;
	ruleset: Ruleset

	board: Board
	selectedCells: CellCoordinates[]
	timer: number

	history: History
	fullNotation: boolean
	colorGroups: CellCoordinates[][]

	constructor(data: GameData | RawGameData, nSquares: number) {
		this.id = data.id
		this.nSquares = nSquares
		this.fullNotation = false
		this.selectedCells = []
		this.history = []
		this.board = []
		this.cages = []
		this.timer = 0
		this.difficulty = 'unrated'
		this.mission = ''
		this.clues = ''
		this.solution = ''
		this.colorGroups = []

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
			this.cages = data.cages
			this.timer = data.timer
			this.board = data.board
			this.selectedCells = data.selectedCells
			this.history = data.history
			this.colorGroups = data.colorGroups
			this.checkFullNotation(false)
			for (const func of this.ruleset.game.afterValuesChanged) func(this)
			this.ruleset.game.checkErrors(this)
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

		for (let x = 0; x < this.nSquares; x++) {
			this.board.push(Array(this.nSquares).fill(null))
			for (let y = 0; y < this.nSquares; y++) {
				let number = Number.parseInt(this.clues[y * this.nSquares + x])
				let solution = Number.parseInt(this.solution[y * this.nSquares + x])
				this.board[x][y] = {
					clue: number > 0,
					value: number,
					notes: [],
					solution: solution,
					color: 'default',
					possibleValues: [],
					isError: false,
				}
			}
		}

		for (const func of this.ruleset.game.initBoardMatrix) {
			func(this)
		}

		for (const func of this.ruleset.game.afterValuesChanged) func(this)
		this.ruleset.game.checkErrors(this)
	}

	getCompletedNumbers() {
		let completedNumbers: number[] = []
		let count = Array(this.nSquares).fill(0)
		this.iterateAllCells((cell) => {
			if (cell.value === cell.solution) {
				count[cell.value - 1]++
				if (count[cell.value - 1] === this.nSquares) {
					completedNumbers.push(cell.value)
				}
			}
		})

		return completedNumbers
	}

	pushBoard() {
		this.history.push({
			board: JSON.stringify(this.board),
			fullNotation: this.fullNotation,
			colorGroups: JSON.stringify(this.colorGroups)
		})
	}

	popBoard() {
		if (this.history.length > 0) {
			this.board = JSON.parse(this.history[this.history.length - 1].board)
			this.fullNotation = this.history[this.history.length - 1].fullNotation
			this.colorGroups = JSON.parse(this.history[this.history.length - 1].colorGroups)
			this.history.pop()
		}
	}

	get(c: CellCoordinates) {
		return this.board[c.x][c.y]
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
		for (const unit of this.ruleset.game.getCellUnits(this, c)) {
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

	setNote(coords: CellCoordinates[], n: number, state: boolean | null = null, checkAutoSolution: boolean = true): [boolean | null, BoardAnimation[]] {
		let finalNoteState: boolean | null = null
		let animations: BoardAnimation[] = []

		for (const c of coords) {
			const cell = this.get(c)

			if (cell.value === 0) {
				//Check if only available place in any unit
				if (SettingsHandler.settings.autoSolveOnlyInBox && checkAutoSolution && this.onlyAvailableInAnyUnit(c, n)) {
					finalNoteState = true
					animations = animations.concat(this.setValue([c], n))
				} else if (cell.notes.includes(n)) {
					if (state !== true) {
						//Remove note
						this.get(c).notes = cell.notes.filter(note => note !== n)
						if (
							(
								(SettingsHandler.settings.autoSolveCellsWithColor && cell.color !== 'default') ||
								(SettingsHandler.settings.autoSolveCellsFullNotation && this.fullNotation)
							) &&
							this.get(c).notes.length === 1
						) {
							finalNoteState = true
							animations = animations.concat(this.setValue([c], this.get(c).notes[0]))
						}
					}
				} else if (state !== false && (!SettingsHandler.settings.lockCellsWithColor || (cell.color === 'default'))) {
					//Add note
					if (!SettingsHandler.settings.showPossibleValues || this.get(c).possibleValues.includes(n)) {
						this.get(c).notes.push(n)
						this.checkFullNotation(false)
						finalNoteState = true
					}
				}
			}
		}

		if (coords.length === 1) {
			return [finalNoteState, animations]
		}
		return [null, []]
	}

	setValue(coords: CellCoordinates[], s: number): BoardAnimation[] {
		let animations: BoardAnimation[] = []

		for (const c of coords) {
			if (!this.get(c).clue) {
				const visibleCells = this.ruleset.game.getVisibleCells(this, c)

				this.get(c).value = s
				this.get(c).notes = []
				for (const cell of visibleCells) {
					if (SettingsHandler.settings.autoRemoveCandidates) this.setNote([cell], s, false, false)
					this.get(c).possibleValues = this.get(c).possibleValues.filter(n => n !== s)
				}

				if (SettingsHandler.settings.clearColorOnInput) {
					let colorGroupIndex = -1
					for (let cgi = 0; cgi < this.colorGroups.length; cgi++) {
						if (indexOfCoordsInArray(this.colorGroups[cgi], c) !== -1) {
							colorGroupIndex = cgi
							break
						}
					}

					// If the cell is in a color group
					if (colorGroupIndex !== -1) {
						// If every cell in the color group has a value, clear their color and remove the color group
						if (this.colorGroups[colorGroupIndex].every(colorGroupCellCoords => this.get(colorGroupCellCoords).value > 0)) {
							for (const colorGroupCellCoords of this.colorGroups[colorGroupIndex]) {
								this.get(colorGroupCellCoords).color = 'default'
							}
							this.colorGroups.splice(colorGroupIndex, 1)
						}
					} else {
						this.get(c).color = 'default'
					}
				}

				//Check animations
				for (const func of this.ruleset.game.checkAnimations) {
					animations = animations.concat(func(this, c))
				}

				//Eliminate possibleValues
				for (const cell of visibleCells) {
					this.get(cell).possibleValues = this.get(cell).possibleValues.filter(n => n !== s)
				}
			}
		}

		for (const func of this.ruleset.game.afterValuesChanged) animations = animations.concat(func(this))
		this.ruleset.game.checkErrors(this)

		if (this.checkComplete()) {
			animations = [{ type: 'board', center: coords[0] }]
			GameHandler.setComplete()
		}

		return animations
	}

	hint(coords: CellCoordinates[]) {
		let animations: BoardAnimation[] = []
		for (const c of coords) {
			animations.push(...(this.setValue([c], this.get(c).solution)))
			this.get(c).clue = true
		}
		return animations
	}

	erase(coords: CellCoordinates[]) {
		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.clue && (cell.value > 0 || cell.notes.length > 0)) {
				for (const visibleCell of this.ruleset.game.getVisibleCells(this, c)) {
					this.get(visibleCell).possibleValues = this.get(visibleCell).possibleValues.filter(n => n !== cell.value)
				}

				cell.value = 0
				cell.notes = []
				cell.color = 'default'
			}
		}

		for (const func of this.ruleset.game.afterValuesChanged) func(this)
		this.ruleset.game.checkErrors(this)
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
				for (const { x, y } of this.ruleset.game.getVisibleCells(this, sc)) {
					highlightedCells[x][y] = true
				}
			}
		}

		return highlightedCells
	}

	calculateLinks(n: number) {
		let links: CellCoordinates[][] = []
		for (const func of this.ruleset.game.findLinks) {
			links = links.concat(func(this, n))
		}
		return links
	}

	setColor(coords: CellCoordinates, newColor: ColorName) {
		if (GameHandler.complete) return
		this.board[coords.x][coords.y].color = newColor
		for (const func of this.ruleset.game.afterValuesChanged) func(this)
		this.ruleset.game.checkErrors(this)
		this.saveToLocalStorage()
	}

	clearColors() {
		this.iterateAllCells(cell => { cell.color = 'default' })
		this.colorGroups = []
	}

	checkComplete() {
		return this.ruleset.game.checkComplete(this)
	}

	saveToLocalStorage() {
		GameHandler.saveGame(JSON.stringify(this))
	}

	checkFullNotation(force: boolean) {
		if (this.fullNotation && !force) return

		for (let n = 1; n <= 9; n++) {
			for (let boxX = 0; boxX < 3; boxX++) {
				for (let boxY = 0; boxY < 3; boxY++) {
					let found = false
					for (let x = 0; x < 3; x++) {
						for (let y = 0; y < 3; y++) {
							const cell = this.get({ x: boxX * 3 + x, y: boxY * 3 + y })
							if (cell.value === n || cell.notes.includes(n)) {
								found = true
								break
							}
						}
					}
					if (!found) {
						this.fullNotation = false
						return
					}
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

	iterateAllCells(func: (cell: Cell, coords: CellCoordinates) => void) {
		this.ruleset.game.iterateAllCells(this, func)
	}
}
