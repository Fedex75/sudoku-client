import SettingsHandler from "../utils/SettingsHandler"
import GameHandler from "../utils/GameHandler"
import { DifficultyName, GameModeIdentifier, GameModeName, getMode } from "../utils/Difficulties"
import { BoardMatrix, BoardAnimation, Cell, CellCoordinates, ColorGroup, GameData, History, RawGameData, isGameData, Ruleset, KillerCage, CellCache, Thermometer } from "../utils/DataTypes"
import { ColorName } from "../utils/Colors"
import { intersection, remove } from "../utils/Utils"
import { rulesets } from "./gameModes/Rulesets"

const defaultCacheItem: CellCache = {
	coords: { x: 0, y: 0 },
	clue: false,
	solution: 0,
	possibleValues: [],
	visibleCells: [],
	units: [],
	isError: false,
	colorGroups: [],
	highlighted: false
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
	selectedCells: Cell[]
	timer: number

	private stash: string
	hasChanged: boolean
	history: History
	fullNotation: boolean
	colorGroups: ColorGroup[]

	animations: BoardAnimation[]

	cache: {
		board: CellCache[][]

		units: Cell[][]

		killer__cages: KillerCage[]

		sandwich__clues: {
			horizontal: {
				value: number,
				visible: boolean,
				error: boolean
			}[],
			vertical: {
				value: number,
				visible: boolean,
				error: boolean
			}[]
		}

		sudokuX__diagonalErrors: [boolean, boolean]

		thermo__thermometers: Thermometer[]
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
			sandwich__clues: {
				horizontal: [],
				vertical: []
			},
			sudokuX__diagonalErrors: [false, false],
			thermo__thermometers: [],
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
			this.board = this.getBoardMatrixFromSavedString(data.board)
			this.selectedCells = data.selectedCells.map(c => this.get(c))
			this.colorGroups = this.getColorGroupsFromSavedString(data.colorGroups)
			this.history = data.history
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
			if (cell.value > 0) {
				count[cell.value - 1]++
				if (count[cell.value - 1] === this.nSquares) {
					completedNumbers.push(cell.value)
				}
			}
		})

		return completedNumbers
	}

	getBoardToSave() {
		let boardToSave = ''
		for (let x = 0; x < this.nSquares; x++) {
			for (let y = 0; y < this.nSquares; y++) {
				const cell = this.get({ x, y })
				const notes = cell.notes.join('')
				const color = cell.color === 'default' ? '' : cell.color
				if (color !== '') {
					boardToSave += `${cell.value},${notes},${color} `
				} else if (notes !== '') {
					boardToSave += `${cell.value},${notes} `
				} else {
					boardToSave += `${cell.value} `
				}
			}
		}

		return boardToSave.trimEnd()
	}

	getBoardMatrixFromSavedString(data: string) {
		let boardMatrix: BoardMatrix = []
		let col: Cell[] = []
		let y = 0
		const cells = data.split(' ')
		for (const cellString of cells) {
			const [valueString, notesString, colorString] = cellString.split(',')
			col.push({
				value: Number.parseInt(valueString),
				notes: notesString !== undefined ? notesString.split('').map(n => Number.parseInt(n)) : [],
				color: (colorString === undefined || colorString === '') ? 'default' : (colorString as ColorName),
				cache: defaultCacheItem
			})
			y++
			if (y === this.nSquares) {
				y = 0
				boardMatrix.push(col)
				col = []
			}
		}
		return boardMatrix
	}

	/*
	cell cell cell ; colorGroup colorGroup colorGroup
					 xy,xy,xy,xy xy,xy,xy,xy xy,xy,xy,xy
	*/

	getColorGroupsToSave(): string {
		return this.colorGroups.map(cg => (cg.members.map(m => `${m.cache.coords.x}${m.cache.coords.y}`).join(','))).join(' ')
	}

	getColorGroupsFromSavedString(data: string): ColorGroup[] {
		if (data === '') return []

		return data.split(' ').map(cg => ({
			members: cg.split(',').map(coords => (this.get({
				x: Number.parseInt(coords[0]),
				y: Number.parseInt(coords[1])
			}))),
			visibleCells: []
		}))
	}

	stashBoard() {
		this.stash = `${this.getBoardToSave()};${this.getColorGroupsToSave()}`
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
			const [boardString, colorGroupsString] = this.history[this.history.length - 1].split(';')

			this.board = this.getBoardMatrixFromSavedString(boardString)
			this.colorGroups = this.getColorGroupsFromSavedString(colorGroupsString)
			this.history.pop()

			this.recreateCache()
		}
	}

	get(coords: CellCoordinates) {
		return this.board[coords.x][coords.y]
	}

	select(cell: Cell, withState: boolean | null = null): boolean | null {
		if (this.selectedCells.includes(cell)) {
			if (withState === null || withState) {
				this.selectedCells.push(cell)
				return true
			}
		} else {
			if (!withState) {
				this.selectedCells = this.selectedCells.filter(c => c !== cell)
				return false
			}
		}

		return null
	}

	selectBox(from: Cell, to: Cell) {
		const minX = Math.min(from.cache.coords.x, to.cache.coords.x)
		const maxX = Math.max(from.cache.coords.x, to.cache.coords.x)
		const minY = Math.min(from.cache.coords.y, to.cache.coords.y)
		const maxY = Math.max(from.cache.coords.y, to.cache.coords.y)
		this.selectedCells = []
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				this.selectedCells.push(this.get({ x, y }))
			}
		}
	}

	onlyAvailableInAnyUnit(c: Cell, n: number) {
		if (!c.cache.possibleValues.includes(n)) return false
		for (const unit of c.cache.units) {
			let found = 0
			for (const uc of unit) {
				if (uc.value === 0 && uc.cache.possibleValues.includes(n)) {
					found++
				}
			}
			if (found === 1) {
				return true
			}
		}

		return false
	}

	setNote(withValue: number, of: Cell[], to: boolean | null = null, checkingAutoSolution: boolean = true): boolean | null {
		let finalNoteState: boolean | null = null

		if (to === null) {
			if (of.every(c => c.notes.includes(withValue))) to = false
			else to = true
		}

		for (const cell of of) {
			if (cell.value === 0) {
				//Check if only available place in any unit
				if (SettingsHandler.settings.autoSolveOnlyInBox && checkingAutoSolution && this.onlyAvailableInAnyUnit(cell, withValue)) {
					finalNoteState = true
					this.setValue([cell], withValue)
					this.hasChanged = true
				} else if (cell.notes.includes(withValue)) {
					if (to !== true) {
						//Remove note
						cell.notes = cell.notes.filter(note => note !== withValue)
						this.hasChanged = true
						finalNoteState = false
						if ((SettingsHandler.settings.autoSolveCellsFullNotation && this.fullNotation) && cell.notes.length === 1) {
							finalNoteState = true
							this.setValue([cell], cell.notes[0])
						}
					}
				} else if (to !== false && (!SettingsHandler.settings.lockCellsWithColor || (cell.color === 'default'))) {
					//Add note
					if (!SettingsHandler.settings.showPossibleValues || cell.cache.possibleValues.includes(withValue)) {
						cell.notes.push(withValue)
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

	setValue(of: Cell[], to: number) {
		for (const cell of of) {
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
						if (cell.cache.colorGroups.every(cg => cg.members.every(colorGroupCell => colorGroupCell.value > 0))) {
							for (const cg of cell.cache.colorGroups) {
								for (const colorGroupCell of cg.members) {
									colorGroupCell.color = 'default'
								}
							}
							this.remove(cell.cache.colorGroups)
						}

					} else {
						cell.color = 'default'
					}
				}

				//Check animations
				for (const func of this.ruleset.game.checkAnimations) func(this, cell)
			}
		}
	}

	giveHint(forCells: Cell[]) {
		for (const cell of forCells) {
			if (!cell.cache.clue && cell.cache.solution > 0) {
				this.setValue([cell], cell.cache.solution)
				cell.cache.clue = true
				this.hasChanged = true
			}
		}
	}

	erase(cells: Cell[]) {
		for (const cell of cells) {
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

	calculateHighlightedCells(forValue: number) {
		this.iterateAllCells(cell => cell.cache.highlighted = false)

		let targetValues: number[] = []

		if (SettingsHandler.settings.advancedHighlight) {
			if (forValue > 0) {
				targetValues = [forValue]
			} else {
				for (const c of this.selectedCells) {
					if (c.value > 0) targetValues.push(c.value)
				}
			}

			if (targetValues.length > 0) {
				this.iterateAllCells(cell => {
					if (!targetValues.every(v => cell.cache.possibleValues.includes(v))) cell.cache.highlighted = true
				})
			}

			this.iterateAllCells(cell => { if (cell.value > 0) cell.cache.highlighted = true })
		}

		if (!SettingsHandler.settings.advancedHighlight || targetValues.length === 0) {
			for (const sc of this.selectedCells) {
				for (const vc of sc.cache.visibleCells) {
					vc.cache.highlighted = true
				}
			}
		}
	}

	getLinks(forValue: number) {
		let links: Cell[][] = []

		for (const unit of this.cache.units) {
			let newLink = []
			for (const cell of unit) {
				if (cell.notes.includes(forValue)) {
					newLink.push(cell)
				}
			}
			if (newLink.length <= 2) {
				links.push(newLink)
			}
		}

		return links
	}

	setColor(of: Cell, to: ColorName) {
		if (GameHandler.complete) return
		if (of.color !== to) {
			of.color = to
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
		this.iterateAllCells((cell, _, exit) => {
			if (cell.value === 0 || cell.cache.isError) {
				complete = false
				exit()
			}
		})

		if (complete && this.cache.killer__cages.some(cage => cage.error)) {
			complete = false
		}

		if (complete && (this.cache.sandwich__clues.vertical.some(clue => clue.error) || this.cache.sandwich__clues.horizontal.some(clue => clue.error))) {
			complete = false
		}

		if (complete && this.cache.sudokuX__diagonalErrors.some(x => x)) {
			complete = false
		}

		if (complete && this.cache.thermo__thermometers.some(t => t.error)) {
			complete = false
		}

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
			selectedCells: this.selectedCells.map(c => c.cache.coords),
			version: this.version,
			history: this.history
		}

		GameHandler.saveGame(JSON.stringify(dataToSave))
	}

	checkFullNotation() {
		for (const unit of this.cache.units) {
			for (let n = 1; n <= 9; n++) {
				let found = false
				for (const cell of unit) {
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

	createColorGroup(withCells: Cell[], painted: ColorName) {
		if (withCells.length < 2 || painted === 'default') return

		const newColorGroup = {
			members: withCells,
			visibleCells: intersection(withCells.map(c => c.cache.visibleCells))
		}

		this.colorGroups.push(newColorGroup)

		for (const cell of withCells) {
			cell.cache.colorGroups.push(this.colorGroups[this.colorGroups.length - 1])
			cell.color = painted
		}

		this.hasChanged = true
	}

	remove(colorGroups: ColorGroup[]) {
		for (const group of colorGroups) {
			// Remove the reference to the group from its members
			for (const cell of group.members) {
				remove(group, cell.cache.colorGroups)
				cell.color = 'default'
			}

			// Remove the color group
			remove(group, this.colorGroups)
		}
	}

	checkErrors() {
		if (this.nSquares < 9) return // THIS IS A HACK

		this.iterateAllCells(cell => {
			cell.cache.isError = cell.value > 0 && !cell.cache.possibleValues.includes(cell.value)
		})

		this.ruleset.game.checkAdditionalErrors(this)
	}

	recreateCache() {
		for (const func of this.ruleset.game.initBoardMatrix) func(this)
		for (const func of this.ruleset.game.afterValuesChanged) func(this)
		this.checkFullNotation()
		this.isComplete()
	}
}
