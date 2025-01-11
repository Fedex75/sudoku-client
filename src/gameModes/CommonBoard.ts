import SettingsHandler from "../utils/SettingsHandler"
import GameHandler from "../utils/GameHandler"
import { DifficultyName, GameModeIdentifier, GameModeName, decodeMode } from "../utils/Difficulties"
import { Board, BoardAnimation, CellCoordinates, GameData, History, RawGameData, isGameData } from "../utils/DataTypes"
import { ColorName } from "../utils/Colors"
import { indexOfCoordsInArray } from "../utils/CoordsUtils"
import { Ruleset, rulesets } from "./Rulesets"

export default class CommonBoard {
	id: string
	mode: GameModeName
	difficulty: DifficultyName
	mission: string
	clues: string
	cages: number[][][]
	solution: string
	nSquares: number
	fullNotation: boolean
	timer: number
	selectedCells: CellCoordinates[]
	history: History
	board: Board
	version: number = 0;
	ruleset: Ruleset

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
			this.checkFullNotation()
			for (const func of this.ruleset.game.afterValuesChanged) func(this)
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
	}

	getCompletedNumbers() {
		let completedNumbers = []
		let count = Array(this.nSquares).fill(0)
		for (let x = 0; x < this.nSquares; x++) {
			for (let y = 0; y < this.nSquares; y++) {
				let cell = this.get({ x, y })
				if (cell.value === cell.solution) {
					count[cell.value - 1]++
					if (count[cell.value - 1] === this.nSquares) {
						completedNumbers.push(cell.value)
					}
				}
			}
		}

		return completedNumbers
	}

	pushBoard() {
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board))
		})
	}

	popBoard() {
		if (this.history.length > 0) {
			this.board = this.history[this.history.length - 1].board
			this.checkFullNotation(true)
			this.history.pop()
			for (const func of this.ruleset.game.afterValuesChanged) func(this)
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

	onlyAvailableInBox(c: CellCoordinates, n: number) {
		if (!this.get(c).possibleValues.includes(n)) return false
		let found = 0
		for (const coords of this.ruleset.game.getBoxCellsCoordinates(c)) {
			const cell = this.get(coords)
			if (cell.value === 0 && cell.possibleValues.includes(n)) {
				found++
			}
		}

		return found === 1
	}

	setNote(coords: CellCoordinates[], n: number, state: boolean | null = null, push: boolean = true, checkAutoSolution: boolean = true): [boolean | null, BoardAnimation[]] {
		let hasPushed = false

		let finalNoteState: boolean | null = null
		let animations: BoardAnimation[] = []

		for (const c of coords) {
			const cell = this.get(c)

			if (cell.value === 0) {
				//Check if only available place in box
				if (SettingsHandler.settings.autoSolveOnlyInBox && checkAutoSolution && this.onlyAvailableInBox(c, n)) {
					finalNoteState = true
					animations = animations.concat(this.setValue([c], n))
				} else if (cell.notes.includes(n)) {
					if (state !== true) {
						//Remove note
						if (push && !hasPushed) {
							this.pushBoard()
							hasPushed = true
						}
						this.get(c).notes = cell.notes.filter(note => note !== n)
						if (
							(
								(SettingsHandler.settings.autoSolveCellsWithColor && cell.color !== 'default') ||
								(SettingsHandler.settings.autoSolveCellsFullNotation && this.fullNotation)
							) &&
							this.get(c).notes.length === 1
						) {
							finalNoteState = true
							animations = animations.concat(this.setValue([c], this.get(c).notes[0], false))
						}
					}
				} else if (state !== false && (!SettingsHandler.settings.lockCellsWithColor || (cell.color === 'default'))) {
					//Add note
					if (!SettingsHandler.settings.showPossibleValues || this.get(c).possibleValues.includes(n)) {
						if (push && !hasPushed) {
							this.pushBoard()
							hasPushed = true
						}
						this.get(c).notes.push(n)
						this.checkFullNotation()
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

	setValue(coords: CellCoordinates[], s: number, push = true): BoardAnimation[] {
		let animations: BoardAnimation[] = []
		let hasPushed = false

		for (const c of coords) {
			if (!this.get(c).clue) {
				const visibleCells = this.ruleset.game.getVisibleCells(this, c)

				if (push && !hasPushed) {
					this.pushBoard()
					hasPushed = true
				}
				this.get(c).value = s
				this.get(c).notes = []
				for (const cell of visibleCells) {
					if (SettingsHandler.settings.autoRemoveCandidates) this.setNote([cell], s, false, false, false)
					this.get(c).possibleValues = this.get(c).possibleValues.filter(n => n !== s)
				}

				if (SettingsHandler.settings.clearColorOnInput) this.get(c).color = 'default'

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

		if (this.checkComplete()) animations = [{ type: 'board', center: coords[0] }]

		return animations
	}

	hint(coords: CellCoordinates[]) {
		let animations: BoardAnimation[] = []
		for (const c of coords) {
			animations.push(...(this.setValue([c], this.get(c).solution, true)))
			this.get(c).clue = true
		}
		return animations
	}

	erase(coords: CellCoordinates[]) {
		let hasPushed = false

		for (const c of coords) {
			const cell = this.get(c)
			if (!cell.clue && (cell.value > 0 || cell.notes.length > 0)) {
				if (!hasPushed) {
					this.pushBoard()
					hasPushed = true
				}
				for (const visibleCell of this.ruleset.game.getVisibleCells(this, c)) {
					this.get(visibleCell).possibleValues = this.get(visibleCell).possibleValues.filter(n => n !== cell.value)
				}

				cell.value = 0
				cell.notes = []
				cell.color = 'default'
			}
		}

		for (const func of this.ruleset.game.afterValuesChanged) func(this)
	}

	calculateHighlightedCells(selectedCoords: CellCoordinates[], lockedInput: number) {
		let highlightedCells: boolean[][] = Array<number>(this.nSquares).fill(0).map(x => Array(this.nSquares).fill(false))
		for (const coords of selectedCoords) {
			let targetValue = lockedInput > 0 ? lockedInput : this.get(coords).value

			if (lockedInput === 0) for (const cell of this.ruleset.game.getVisibleCells(this, coords)) highlightedCells[cell.x][cell.y] = true

			if (SettingsHandler.settings.advancedHighlight) {
				let highlightCages = []
				if (this.mode === 'killer') {
					for (let x = 0; x < this.nSquares; x++) {
						for (let y = 0; y < this.nSquares; y++) {
							const cell = this.get({ x, y })
							if (cell.value > 0 && cell.value === targetValue) highlightCages.push(cell.cageIndex)
						}
					}
				}
				for (let x = 0; x < this.nSquares; x++) {
					for (let y = 0; y < this.nSquares; y++) {
						const cell = this.get({ x, y })
						if (
							(targetValue > 0 && cell.value > 0) ||
							(this.mode === 'killer' && highlightCages.includes(cell.cageIndex)) ||
							(SettingsHandler.settings.lockCellsWithColor && cell.color !== 'default' && !cell.notes.includes(targetValue))
						) highlightedCells[x][y] = true
						if (cell.value > 0 && cell.value === targetValue) for (const visibleCell of this.ruleset.game.getVisibleCells(this, { x, y })) highlightedCells[visibleCell.x][visibleCell.y] = true
					}
				}

				for (let x = 0; x < this.nSquares; x++) {
					for (let y = 0; y < this.nSquares; y++) {
						const cell = this.get({ x, y })
						if (cell.color !== 'default' && cell.notes.includes(targetValue)) {
							for (const boxCell of this.ruleset.game.getBoxCellsCoordinates({ x, y })) {
								highlightedCells[boxCell.x][boxCell.y] = true
							}
						}
					}
				}

			} else {
				for (const visibleCell of this.ruleset.game.getVisibleCells(this, coords)) highlightedCells[visibleCell.x][visibleCell.y] = true
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

		this.pushBoard()
		this.board[coords.x][coords.y].color = newColor
		//this.saveToLocalStorage()
	}

	clearColors() {
		this.pushBoard()
		for (let x = 0; x < this.nSquares; x++) {
			for (let y = 0; y < this.nSquares; y++) {
				this.board[x][y].color = 'default'
			}
		}
	}

	saveToLocalStorage() {
		GameHandler.saveGame(JSON.stringify(this))
	}

	checkComplete() {
		for (let x = 0; x < this.nSquares; x++) for (let y = 0; y < this.nSquares; y++) if (this.board[x][y].value !== this.board[x][y].solution) return false
		GameHandler.setComplete()
		return true
	}

	checkFullNotation(force = false) {
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
		for (let y = 0; y < this.nSquares; y++) {
			for (let x = 0; x < this.nSquares; x++) {
				text += cluesOnly && !this.board[x][y].clue ? 0 : this.board[x][y].value
			}
		}
		return text
	}

	restart() {
		this.initBoard()
		this.fullNotation = false
	}

	setTimer(timestamp: number) {
		this.timer = timestamp
	}
}
