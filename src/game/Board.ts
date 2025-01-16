import SettingsHandler from "../utils/SettingsHandler"
import GameHandler from "../utils/GameHandler"
import { DifficultyName, GameModeIdentifier, GameModeName, decodeMode } from "../utils/Difficulties"
import { BoardMatrix, BoardAnimation, Cell, CellCoordinates, ColorGroup, GameData, History, RawGameData, isGameData, Ruleset } from "../utils/DataTypes"
import { ColorName } from "../utils/Colors"
import { indexOfCoordsInArray } from "../utils/CoordsUtils"
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

	board: BoardMatrix
	selectedCells: CellCoordinates[]
	timer: number

	history: History
	fullNotation: boolean
	colorGroups: ColorGroup[]

	killer__cages: CellCoordinates[][]
	killer__cageErrors: number[]

	sandwich__horizontalClues: number[]
	sandwich__verticalClues: number[]
	sandwich__visibleHorizontalClues: boolean[]
	sandwich__visibleVerticalClues: boolean[]

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

		this.killer__cages = []
		this.killer__cageErrors = []

		this.sandwich__horizontalClues = []
		this.sandwich__verticalClues = []
		this.sandwich__visibleHorizontalClues = []
		this.sandwich__visibleVerticalClues = []

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
			this.killer__cages = data.killer__cages
			this.sandwich__horizontalClues = data.sandwich__horizontalClues
			this.sandwich__verticalClues = data.sandwich__verticalClues
			this.sandwich__visibleHorizontalClues = data.sandwich__visibleHorizontalClues
			this.sandwich__visibleVerticalClues = data.sandwich__visibleVerticalClues
			this.killer__cageErrors = data.killer__cageErrors
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
				const number = Number.parseInt(this.clues[y * this.nSquares + x])
				this.board[x][y] = {
					clue: number > 0,
					value: number,
					notes: [],
					solution: this.solution === '' ? 0 : Number.parseInt(this.solution[y * this.nSquares + x]),
					color: 'default',
					possibleValues: [],
					isError: false,
					colorGroupIndex: -1
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
			if (cell.value > 0 && !cell.isError) {
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
		let hasChanged = false
		let finalNoteState: boolean | null = null
		let animations: BoardAnimation[] = []

		for (const c of coords) {
			const cell = this.get(c)

			if (cell.value === 0) {
				//Check if only available place in any unit
				if (SettingsHandler.settings.autoSolveOnlyInBox && checkAutoSolution && this.onlyAvailableInAnyUnit(c, n)) {
					finalNoteState = true
					animations = animations.concat(this.setValue([c], n))
					hasChanged = true
				} else if (cell.notes.includes(n)) {
					if (state !== true) {
						//Remove note
						this.get(c).notes = cell.notes.filter(note => note !== n)
						hasChanged = true
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
						hasChanged = true
					}
				}
			}
		}

		if (hasChanged) for (const func of this.ruleset.game.afterValuesChanged) animations = animations.concat(func(this))

		if (coords.length === 1) {
			return [finalNoteState, animations]
		}
		return [null, []]
	}

	setValue(coords: CellCoordinates[], s: number): BoardAnimation[] {
		let hasChanged = false
		let animations: BoardAnimation[] = []

		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.clue && cell.value !== s) {
				const visibleCells = this.ruleset.game.getVisibleCells(this, c)

				cell.value = s
				cell.notes = []
				hasChanged = true
				for (const visibleCell of visibleCells) {
					if (SettingsHandler.settings.autoRemoveCandidates) this.setNote([visibleCell], s, false, false)
				}

				if (SettingsHandler.settings.clearColorOnInput) {
					// If the cell is in a color group
					if (cell.colorGroupIndex !== -1) {
						// If every cell in the color group has a value, clear their color and remove the color group
						if (this.colorGroups[cell.colorGroupIndex].cells.every(colorGroupCellCoords => this.get(colorGroupCellCoords).value > 0)) {
							for (const colorGroupCellCoords of this.colorGroups[cell.colorGroupIndex].cells) {
								this.get(colorGroupCellCoords).color = 'default'
							}
							this.removeColorGroups(new Set([cell.colorGroupIndex]))
						}
					} else {
						cell.color = 'default'
					}
				}

				//Check animations
				for (const func of this.ruleset.game.checkAnimations) {
					animations = animations.concat(func(this, c))
				}

				//Eliminate possibleValues
				for (const visibleCell of visibleCells) {
					this.get(visibleCell).possibleValues = this.get(visibleCell).possibleValues.filter(n => n !== s)
				}
			}
		}

		if (hasChanged) {
			for (const func of this.ruleset.game.afterValuesChanged) animations = animations.concat(func(this))
			this.ruleset.game.checkErrors(this)

			if (this.checkComplete()) {
				animations = [{ type: 'board', center: coords[0] }]
				GameHandler.setComplete()
			}
		}

		return animations
	}

	hint(coords: CellCoordinates[]) {
		let animations: BoardAnimation[] = []
		for (const c of coords) {
			if (this.get(c).solution > 0) {
				animations.push(...(this.setValue([c], this.get(c).solution)))
				this.get(c).clue = true
			}
		}
		return animations
	}

	erase(coords: CellCoordinates[]) {
		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.clue && (cell.value > 0 || cell.notes.length > 0)) {
				cell.value = 0
				cell.notes = []
				cell.color = 'default'

				if (cell.colorGroupIndex !== -1) {
					this.removeColorGroups(new Set([cell.colorGroupIndex]))
				}
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
		const units = this.ruleset.game.getAllUnits(this)

		for (const unit of units) {
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
			this.board[coords.x][coords.y].color = newColor
			for (const func of this.ruleset.game.afterValuesChanged) func(this)
			this.ruleset.game.checkErrors(this)
			this.saveToLocalStorage()
		}
	}

	clearColors() {
		this.iterateAllCells(cell => { cell.color = 'default' })
		this.colorGroups = []
		this.iterateAllCells(cell => { cell.colorGroupIndex = -1 })
	}

	checkComplete(): boolean {
		this.ruleset.game.checkErrors(this)
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

	iterateAllCells(func: (cell: Cell, coords: CellCoordinates, exit: () => void) => void) {
		this.ruleset.game.iterateAllCells(this, func)
	}

	removeColorGroups(indices: Set<number>) {
		for (const index of indices) {
			for (const cell of this.colorGroups[index].cells) {
				this.get(cell).colorGroupIndex = -1
			}
			for (let i = index + 1; i < this.colorGroups.length; i++) {
				for (const cell of this.colorGroups[i].cells) {
					this.get(cell).colorGroupIndex--
				}
			}
		}
		this.colorGroups = this.colorGroups.filter((_, index) => !indices.has(index))
	}
}
