import { DifficultyIdentifier, DifficultyName, GameModeIdentifier, GameModeName, getDifficulty, getMode } from "./Difficulties"
import { BoardAnimation, BoardHistory, GameData } from "./DataTypes"
import { ColorName } from "./Colors"
import { Cell, CellCoordinates, ColorGroup } from './Cell'
import { BOARD_API_VERSION } from './Constants'
import { defaultSettings, Settings } from './SettingsHandler'

export type HistoryItem = {
	board: string
	fullNotation: boolean
	colorGroups: ColorGroup[]
}

export default abstract class Board {
	// Constants
	protected readonly _id: string
	protected readonly _difficulty: DifficultyName
	public readonly nSquares: number
	protected readonly _mission: string
	protected readonly version: number = 0;
	protected readonly _board: Cell[][] = []
	protected _complete: boolean = false
	protected _mode: GameModeName = 'classic'
	protected stash: string = ''
	protected _hasChanged: boolean = false
	protected history: BoardHistory
	protected _fullNotation: boolean = false
	protected colorGroups: Set<ColorGroup> = new Set()
	protected units: Set<Cell>[] = []
	protected _selectedCells: Set<Cell> = new Set()
	protected _selectedCellsValues: Set<number> = new Set()
	protected _settings: Settings = defaultSettings

	public timer: number
	public animations: BoardAnimation[] = []

	public cellPositionsHaveBeenCalculated = false

	constructor(
		{
			id,
			mission,

			boardString,
			colorGroupsString,
			timer = 0,
			history = [],
			version = BOARD_API_VERSION
		}: GameData) {
		this._id = id
		this._mode = getMode(this._id[0] as GameModeIdentifier)
		this._difficulty = getDifficulty(this._id[1] as DifficultyIdentifier)
		this._mission = mission
		const [nSquares] = mission.split(' ')
		this.nSquares = Number.parseInt(nSquares)

		this.timer = timer
		this.history = history
		this.version = version

		this._board = this.createBoardMatrix()
		this.calculateUnitsAndVisibility()
		if (boardString) this.updateBoardMatrixFromSavedString(boardString)

		if (colorGroupsString) this.updateColorGroupsFromSavedString(colorGroupsString)
	}

	get fullNotation() { return this._fullNotation }

	get complete() {
		return this._complete
	}

	get allCells(): Iterable<Cell> {
		return this.iterateAllCells()
	}

	get id() {
		return this._id
	}

	get mission() {
		return this._mission
	}

	get mode() {
		return this._mode
	}

	private checkIsComplete(): boolean {
		this.checkErrors()
		for (const cell of this.allCells) {
			if (cell.value === 0 || cell.error) {
				return false
			}
		}

		return !this.hasAdditionalErrors()
	}

	get selectedCellsValues(): Set<number> {
		return this._selectedCellsValues
	}

	get hasHistory(): boolean {
		return this.history.length > 0
	}

	get canErase(): boolean {
		return this._selectedCells.size > 0 && [...this._selectedCells].some(cell => !cell.clue && (cell.value !== 0 || cell.notes.size > 0 || cell.color !== 'default'))
	}

	get canGiveHint(): boolean {
		return this._selectedCells.size > 0 && [...this._selectedCells].some(cell => !cell.clue && cell.solution > 0)
	}

	get hasChanged(): boolean {
		return this._hasChanged
	}

	get selectedCells() {
		return this._selectedCells
	}

	set selectedCells(value) {
		this._selectedCells = value
		this.updateSelectedCellsValues()
	}

	get difficulty() {
		return this._difficulty
	}

	set settings(v: Settings) {
		this._settings = v
	}

	get settings() {
		return this._settings
	}

	restart() {
		// Restore initial state
		this._selectedCells = new Set()
		this.history = []
		this.timer = 0
		this.stash = ''
		this._hasChanged = false
		this.animations = []
		this._fullNotation = false
		this.clearColors()
		for (const cell of this.allCells) {
			if (!cell.clue || cell.hint) {
				cell.hint = false
				cell.notes = new Set()
				cell.value = 0
			}
		}
		this.triggerValuesChanged()
	}

	getCompletedNumbers() {
		let completedNumbers: Set<number> = new Set()
		let count = Array(this.nSquares).fill(0)
		for (const cell of this.allCells) {
			if (cell.value > 0) {
				count[cell.value - 1]++
				if (count[cell.value - 1] === this.nSquares) {
					completedNumbers.add(cell.value)
				}
			}
		}

		return completedNumbers
	}

	getBoardToSave() {
		let boardToSave = ''
		for (let x = 0; x < this.nSquares; x++) {
			for (let y = 0; y < this.nSquares; y++) {
				const cell = this.get({ x, y })
				if (!cell) continue

				let notes = ''
				for (const note of cell.notes) notes += note.toString()
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

	private updateBoardMatrixFromSavedString(data: string) {
		let x = 0
		let y = 0
		const cells = data.split(' ')
		for (const cellString of cells) {
			const [valueString, notesString, colorString] = cellString.split(',')
			const cell = this.get({ x, y })
			if (cell) {
				cell.value = Number.parseInt(valueString)
				cell.notes = notesString !== undefined ? new Set(notesString.split('').map(n => Number.parseInt(n))) : new Set()
				cell.color = (colorString === undefined || colorString === '') ? 'default' : (colorString as ColorName)
			}

			y++
			if (y === this.nSquares) {
				y = 0
				x++
			}
		}
	}

	private getColorGroupsToSave(): string {
		return [...this.colorGroups].map(cg => ([...cg.members].map(m => `${m.coords.x}${m.coords.y}`).join(','))).join(' ')
	}

	private updateColorGroupsFromSavedString(data: string) {
		if (data === '') return

		this.colorGroups = new Set()
		for (const cell of this.allCells) cell.colorGroups = new Set()

		data
			.split(' ')
			.forEach(colorGroupString => {
				const members = new Set(colorGroupString.split(',').map(coordPair => {
					const [x, y] = coordPair.split('').map(n => Number.parseInt(n))
					return this.get({ x, y })
				}).filter(c => c !== undefined))
				const cg = new ColorGroup(members, null)
				this.colorGroups.add(cg)
				for (const cell of members) cell.colorGroups.add(cg)
			})
	}

	public stashBoard() {
		this.stash = `${this.getBoardToSave()};${this.getColorGroupsToSave()}`
		this._hasChanged = false
	}

	public pushBoard() {
		if (this.stash && this._hasChanged) {
			this.history.push(this.stash)
			this._hasChanged = false
		}
	}

	public popBoard() {
		if (this.history.length > 0) {
			const [boardString, colorGroupsString] = this.history[this.history.length - 1].split(';')

			this.updateBoardMatrixFromSavedString(boardString)
			this.updateColorGroupsFromSavedString(colorGroupsString)
			this.history.pop()

			this.triggerValuesChanged()
		}
	}

	public get(coords: CellCoordinates): Cell | undefined {
		if (
			coords.x >= 0 &&
			coords.x < this.nSquares &&
			coords.y >= 0 &&
			coords.y < this.nSquares
		) return this._board[coords.x][coords.y]
	}

	select(cell: Cell, withState: boolean | null = null): boolean | null {
		if (this._selectedCells.has(cell)) {
			if (!withState) {
				this._selectedCells.delete(cell)
				this.updateSelectedCellsValues()
				return false
			}
		} else {
			if (withState === null || withState) {
				this._selectedCells.add(cell)
				this.updateSelectedCellsValues()
				return true
			}
		}

		return null
	}

	private updateSelectedCellsValues() {
		this._selectedCellsValues = new Set([...this.selectedCells].map(cell => cell.value).filter(value => value > 0))
	}

	selectBox(from: Cell, to: Cell) {
		const minX = Math.min(from.coords.x, to.coords.x)
		const maxX = Math.max(from.coords.x, to.coords.x)
		const minY = Math.min(from.coords.y, to.coords.y)
		const maxY = Math.max(from.coords.y, to.coords.y)
		this._selectedCells = new Set()
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				const cell = this.get({ x, y })
				if (cell) this._selectedCells.add(cell)
			}
		}
	}

	onlyAvailableInAnyUnit(c: Cell, n: number) {
		if (!c.possibleValues.has(n)) return false
		for (const unit of c.units) {
			let found = 0
			for (const uc of unit) {
				if (uc.value === 0 && uc.possibleValues.has(n)) {
					found++
				}
			}
			if (found === 1) {
				return true
			}
		}

		return false
	}

	setNote(withValue: number, of: Cell | Set<Cell>, to: boolean | null = null, checkingAutoSolution: boolean = true): boolean | null {
		let cells: Cell[]

		if (of instanceof Cell) cells = [of]
		else cells = [...of]

		let finalNoteState: boolean | null = null

		if (to === null) {
			if (cells.every(c => c.notes.has(withValue))) to = false
			else to = true
		}

		for (const cell of cells) {
			if (cell.value === 0) {
				//Check if only available place in any unit
				if (this._settings.autoSolveOnlyInBox && checkingAutoSolution && this.onlyAvailableInAnyUnit(cell, withValue)) {
					finalNoteState = true
					this.setValue(cell, withValue)
					this._hasChanged = true
				} else if (cell.notes.has(withValue)) {
					if (to !== true) {
						//Remove note
						cell.notes.delete(withValue)
						this._hasChanged = true
						finalNoteState = false
						if ((this._settings.autoSolveCellsFullNotation && this._fullNotation) && cell.notes.size === 1) {
							finalNoteState = true
							this.setValue(cell, [...cell.notes][0])
						}
					}
				} else if (to !== false && (!this._settings.lockCellsWithColor || (cell.color === 'default'))) {
					//Add note
					if (!this._settings.showPossibleValues || cell.possibleValues.has(withValue)) {

						cell.notes.add(withValue)
						finalNoteState = true
						this._hasChanged = true
					}
				}
			}
		}

		if (cells.length === 1) {
			return finalNoteState
		}
		return null
	}

	setValue(of: Cell | Set<Cell>, to: number) {
		let cells: Cell[]

		if (of instanceof Cell) cells = [of]
		else cells = [...of]

		for (const cell of cells) {
			if (!cell.clue && cell.value !== to) {
				cell.value = to
				cell.notes = new Set()
				this._hasChanged = true
				for (const visibleCell of cell.visibleCells) {
					if (this._settings.autoRemoveCandidates) this.setNote(to, visibleCell, false, false)
				}

				if (this._settings.clearColorOnInput) {
					cell.color = 'default'
					this._hasChanged = true
					for (const cg of cell.colorGroups) cg.remove(cell)
				}

				this.checkAnimations(cell)
			}
		}
	}

	giveHint(forCells: Set<Cell>) {
		for (const cell of forCells) {
			if (!cell.clue && cell.solution > 0) {
				// Attempt to set the cell to a clue, which will also set the value
				// It will fail if the solution is unknown
				cell.hint = true

				if (cell.clue) this._hasChanged = true
			}
		}
	}

	erase(cells: Set<Cell>) {
		for (const cell of cells) {
			if (!cell.clue && (cell.value > 0 || cell.notes.size > 0 || cell.color !== 'default')) {
				cell.value = 0
				cell.notes = new Set()
				cell.color = 'default'
				this._hasChanged = true

				for (const cg of cell.colorGroups) cg.remove(cell)
			}
		}
	}

	calculateHighlightedCells(forValue: number) {
		for (const cell of this.allCells) cell.highlighted = false

		let targetValues: number[] = []

		if (this._settings.advancedHighlight) {
			if (forValue > 0) {
				targetValues = [forValue]
			} else {
				for (const c of this._selectedCells) {
					if (c.value > 0) targetValues.push(c.value)
				}
			}

			if (targetValues.length > 0) {
				for (const cell of this.allCells) {
					if (cell.value > 0 || !targetValues.every(v => cell.possibleValues.has(v))) cell.highlighted = true
				}
			}
		}

		if (!this._settings.advancedHighlight || targetValues.length === 0) {
			for (const sc of this._selectedCells) {
				for (const vc of sc.visibleCells) {
					vc.highlighted = true
				}
				sc.highlighted = true
			}
		}
	}

	getLinks(forValue: number) {
		let links: Cell[][] = []

		for (const unit of this.units) {
			let newLink = []
			for (const cell of unit) {
				if (cell.notes.has(forValue)) {
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
		if (of.color !== to) {
			of.color = to
			this._hasChanged = true
		}
	}

	clearColors() {
		for (const cell of this.allCells) {
			if (cell.color !== 'default') {
				cell.color = 'default'
				this._hasChanged = true
			}
		}
		this.removeColorGroups(this.colorGroups)
	}

	public getDataToSave(): string {
		const dataToSave: GameData = {
			id: this._id,
			mission: this._mission,
			boardString: this.getBoardToSave(),
			colorGroupsString: this.getColorGroupsToSave(),
			timer: this.timer,
			version: this.version,
			history: this.history
		}

		return JSON.stringify(dataToSave)
	}

	protected checkFullNotation() {
		for (const unit of this.units) {
			for (let n = 1; n <= 9; n++) {
				let found = false
				for (const cell of unit) {
					if (cell.value === n || cell.notes.has(n)) {
						found = true
						break
					}
				}
				if (!found) {
					this._fullNotation = false
					return
				}
			}
		}

		this._fullNotation = true

		if (this._settings.clearColorFullNotation) this.clearColors()
	}

	public getTextRepresentation(cluesOnly: boolean) {
		let text = ''
		for (const cell of this.allCells) {
			text += cluesOnly && !cell.clue ? 0 : cell.value
		}
		return text
	}

	protected *iterateAllCells(): IterableIterator<Cell> {
		for (let x = 0; x < this.nSquares; x++) {
			for (let y = 0; y < this.nSquares; y++) {
				const cell = this.get({ x, y })
				if (cell) yield cell
			}
		}
	}

	public createColorGroup(withCells: Set<Cell>, painted: ColorName) {
		if (withCells.size < 2 || painted === 'default') return

		this.colorGroups.add(new ColorGroup(withCells, painted))

		this._hasChanged = true
	}

	public removeColorGroups(_: Set<ColorGroup>) {
		for (const group of _) {
			// Remove the reference to the group from its members
			for (const cell of group.members) {
				cell.colorGroups.delete(group)
				cell.color = 'default'
				this._hasChanged = true
			}

			// Remove the color group
			this.colorGroups.delete(group)
		}
	}

	protected checkErrors() {
		if (this.nSquares < 9) return // TODO: This is a hack. When it's implemented, we should use the per-game settings system to override checkMistakes for the 3x3 canvases. Then we won't need this guard

		for (const cell of this.allCells) {
			cell.error = (
				(
					cell.value > 0 &&
					!cell.possibleValues.has(cell.value)
				) ||
				(
					cell.solution !== 0 &&
					cell.value !== cell.solution
				)
			)
		}

		this.checkAdditionalErrors()
	}

	public triggerValuesChanged() {
		this.pushBoard()

		do {
			this._hasChanged = false

			// Reset possible values

			for (const cell of this.allCells) {
				cell.possibleValues = new Set()
				for (let k = 1; k <= this.nSquares; k++) {
					cell.possibleValues.add(k)
				}
			}

			// Check possible values by visibility

			for (const cell of this.allCells) {
				if (cell.value > 0) {
					for (const cell2 of cell.visibleCells) {
						if (cell !== cell2) cell2.possibleValues.delete(cell.value)
					}
				}
			}

			if (this._settings.lockCellsWithColor) {
				for (const cell of this.allCells) {
					if (cell.color !== 'default') {
						if (this._settings.autoSolveCellsWithColor && cell.notes.size === 1) this.setValue(cell, [...cell.notes][0])
						else cell.possibleValues = new Set(cell.notes)
					}
				}

				for (const cg of this.colorGroups) {
					let notes = new Set<number>()
					let unsolvedCount = 0
					for (const cell of cg.members) {
						notes = notes.union(cell.notes)
						if (cell.value === 0) unsolvedCount++
					}

					if (notes.size === unsolvedCount) {
						// Remove possible values and notes from all the visible cells not in the group
						for (const vc of cg.visibleCells) {
							if (!vc.colorGroups.has(cg)) {
								for (const note of notes) vc.possibleValues.delete(note)
								if (this._settings.showPossibleValues) for (const note of notes) this.setNote(note, vc, false)
							}
						}
					}
				}
			}

			this.customAfterValuesChanged()

		} while (this._hasChanged)

		this._complete = this.checkIsComplete()

		this.checkFullNotation()
	}

	protected abstract createBoardMatrix(): Cell[][]

	protected abstract checkAdditionalErrors(): void

	protected abstract hasAdditionalErrors(): boolean

	protected abstract checkAnimations(center: Cell): void

	protected abstract calculateUnitsAndVisibility(): void

	abstract get calculatorValue(): number

	protected abstract customAfterValuesChanged(): void
}
