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
	protected readonly version: number
	protected readonly _board: Cell[][]
	protected readonly _solution: string
	protected _complete: boolean = false
	protected _mode: GameModeName
	protected stash: string = ''
	protected _hasChanged: boolean = false
	protected history: BoardHistory
	protected _fullNotation: boolean = false
	protected colorGroups: Set<ColorGroup> = new Set()
	protected units: Set<Cell>[] = []
	protected _selectedCells: Set<Cell> = new Set()
	protected _selectedCellsValues: Set<number> = new Set()
	protected _settings: Settings
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
		}: GameData, settings: Settings = defaultSettings) {
		this._id = id
		this._mode = getMode(this._id[0] as GameModeIdentifier)
		this._difficulty = getDifficulty(this._id[1] as DifficultyIdentifier)
		this._mission = mission
		const [nSquares] = mission.split(' ')
		this.nSquares = Number.parseInt(nSquares)

		this._settings = settings

		this.timer = timer
		this.history = history
		this.version = version

		this._solution = this.findSolution()

		this._board = this.createBoardMatrix()
		this.createBoardGeometry()
		if (boardString) this.updateBoardMatrixFromSavedString(boardString)
		if (colorGroupsString) this.updateColorGroupsFromSavedString(colorGroupsString)
		this.recreatePossibleValuesCache()
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

	protected checkIsComplete(): boolean {
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

	get completedNumbers() {
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

	get boardToSave() {
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

	public getLinks(forValue: number) {
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

	public restart() {
		// Restore initial state
		this._selectedCells.clear()
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
				cell.notes.clear()
				cell.value = 0
			}
		}

		this.recreatePossibleValuesCache()
		this.triggerValuesChanged()
	}

	public stashBoard() {
		this.stash = `${this.boardToSave};${this.colorGroupsToSave}`
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

			this.recreatePossibleValuesCache()
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

	public select(cell: Cell, withState: boolean | null = null): boolean | null {
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

	public selectBox(from: Cell, to: Cell) {
		const minX = Math.min(from.coords.x, to.coords.x)
		const maxX = Math.max(from.coords.x, to.coords.x)
		const minY = Math.min(from.coords.y, to.coords.y)
		const maxY = Math.max(from.coords.y, to.coords.y)
		this._selectedCells.clear()
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				const cell = this.get({ x, y })
				if (cell) this._selectedCells.add(cell)
			}
		}
	}

	public onlyAvailableInAnyUnit(c: Cell, n: number) {
		if (!c.possibleValues.has(n)) return false
		return c.units.some(unit => [...unit].filter(cell => cell.value === 0 && cell.possibleValues.has(n)).length === 1)
	}

	public setNote(withValue: number, of: Cell | Set<Cell>, to: boolean | null = null, checkingAutoSolution: boolean = true): boolean | null {
		let cells = (of instanceof Cell) ? [of] : [...of]
		let finalNoteState: boolean | null = null

		if (to === null) {
			if (this._settings.showPossibleValues) {
				to = cells.some(cell => (
					cell.value === 0 &&
					cell.possibleValues.has(withValue) &&
					!cell.notes.has(withValue
					)))
			} else {
				to = cells.some(cell => (
					cell.value === 0 &&
					!cell.notes.has(withValue) &&
					(
						cell.color === 'default' ||
						!this._settings.lockCellsWithColor
					)
				))
			}
		}

		console.log(to)

		// If removing these notes would make fullNotation false (i.e. if the test fails),
		// then ignore the fact that the notation is currently full and remove the notes without setValue.
		const ignoreFullNotaion = this._fullNotation && to === false && !this.testFullNotation(new Set(cells), withValue)

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
						if (cell.notes.size === 1 && ((this._settings.autoSolveCellsWithColor && cell.color !== 'default') || (this._settings.autoSolveCellsFullNotation && this._fullNotation && !ignoreFullNotaion))) {
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

	public setValue(of: Cell | Set<Cell>, to: number) {
		let cells = (of instanceof Cell) ? [of] : [...of]

		for (const cell of cells) {
			if (!cell.clue && cell.value !== to) {
				cell.value = to
				cell.notes.clear()
				this._hasChanged = true
				for (const visibleCell of cell.visibleCells) {
					if (this._settings.autoRemoveCandidates) this.setNote(to, visibleCell, false, false)
				}

				if (this._settings.clearColorOnInput) {
					cell.color = 'default'
					this._hasChanged = true
					for (const cg of cell.colorGroups) cg.remove(cell)
				}

				this.updatePossibleValuesByValue(cell)

				this.checkAnimations(cell)
			}
		}
	}

	public giveHint(forCells: Set<Cell>) {
		for (const cell of forCells) {
			if (!cell.clue && cell.solution > 0) {
				// Attempt to set the cell to a clue, which will also set the value
				// It will fail if the solution is unknown
				cell.hint = true

				if (cell.clue) {
					this._hasChanged = true
					this.updatePossibleValuesByValue(cell)
				}
			}
		}
	}

	public erase(cells: Set<Cell>) {
		for (const cell of cells) {
			if (!cell.clue && (cell.value > 0 || cell.notes.size > 0 || cell.color !== 'default')) {
				cell.value = 0
				cell.notes.clear()
				cell.color = 'default'
				this._hasChanged = true

				for (const cg of cell.colorGroups) cg.remove(cell)

				this.recreatePossibleValuesCache()
			}
		}
	}

	public calculateHighlightedCells(forValue: number) {
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

	public setColor(of: Cell, to: ColorName) {
		if (of.color !== to) {
			of.color = to
			this._hasChanged = true
			this.updatePossibleValuesByColor(of)
		}
	}

	public clearColors() {
		for (const cell of this.allCells) {
			if (cell.color !== 'default') {
				cell.color = 'default'
				this._hasChanged = true
			}
		}
		this.removeColorGroups(this.colorGroups)
	}

	public getDataToSave() {
		const dataToSave: GameData = {
			id: this._id,
			mission: this._mission,
			boardString: this.boardToSave,
			colorGroupsString: this.colorGroupsToSave,
			timer: this.timer,
			version: this.version,
			history: this.history
		}

		return dataToSave
	}

	public getTextRepresentation(cluesOnly: boolean) {
		let text = ''
		for (const cell of this.allCells) {
			text += cluesOnly && !cell.clue ? 0 : cell.value
		}
		return text
	}

	public createColorGroup(withCells: Set<Cell>, painted: ColorName) {
		if (withCells.size < 2 || painted === 'default') return

		const newColorGroup = new ColorGroup(withCells, painted)
		this.colorGroups.add(newColorGroup)
		for (const cell of withCells) this.updatePossibleValuesByColor(cell)
		this.updatePossibleValuesByColorGroups(newColorGroup)
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

		this.recreatePossibleValuesCache()
	}

	public triggerValuesChanged() {
		this.pushBoard()
		this._complete = this.checkIsComplete()
		this.checkFullNotation()
	}

	private get colorGroupsToSave(): string {
		return [...this.colorGroups].map(cg => ([...cg.members].map(m => `${m.coords.x}${m.coords.y}`).join(','))).join(' ')
	}

	private updateColorGroupsFromSavedString(data: string) {
		if (data === '') return

		this.colorGroups.clear()
		for (const cell of this.allCells) cell.colorGroups.clear()

		data
			.split(' ')
			.forEach(colorGroupString => {
				const members = new Set(colorGroupString.split(',').map(coordPair => {
					const [x, y] = coordPair.split('').map(n => Number.parseInt(n))
					return this.get({ x, y })
				}).filter(c => c !== undefined))
				if (members.size > 0) this.createColorGroup(members, [...members][0].color)
			})
	}

	private updateSelectedCellsValues() {
		this._selectedCellsValues = new Set([...this.selectedCells].map(cell => cell.value).filter(value => value > 0))
	}

	private testFullNotation(except: Set<Cell> = new Set(), withValue: number | null = null): boolean {
		// If we're testing with exception, then we don't care about the other values, only withValue
		const specialTest = this._fullNotation && except.size > 0 && withValue
		for (const unit of this.units) {
			for (let n = specialTest ? withValue : 1; n <= 9; n++) {
				let found = false
				for (const cell of unit) {
					if (!(n === withValue && except.has(cell)) && (cell.value === n || cell.notes.has(n))) {
						found = true
						break
					}
				}
				if (!found) {
					return false
				}
				if (specialTest) return true
			}
		}

		return true
	}

	protected checkFullNotation() {
		if (!this.testFullNotation()) {
			this._fullNotation = false
			return
		}

		this._fullNotation = true

		if (this._settings.clearColorFullNotation) this.clearColors()
	}

	protected *iterateAllCells(): IterableIterator<Cell> {
		for (let x = 0; x < this.nSquares; x++) {
			for (let y = 0; y < this.nSquares; y++) {
				const cell = this.get({ x, y })
				if (cell) yield cell
			}
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

	protected recreatePossibleValuesCache() {
		for (const cell of this.allCells) cell.possibleValues = new Set(Array.from({ length: this.nSquares }, (_, i) => i + 1))
		for (const cell of this.allCells) this.updatePossibleValuesByValue(cell)
		for (const cell of this.allCells) this.updatePossibleValuesByColor(cell)
		for (const cg of this.colorGroups) this.updatePossibleValuesByColorGroups(cg)
	}

	protected updatePossibleValuesByValue(cell: Cell) {
		for (const vc of cell.visibleCells) {
			if (cell !== vc) vc.possibleValues.delete(cell.value)
		}
	}

	protected updatePossibleValuesByColor(cell: Cell) {
		if (cell.color !== 'default') {
			if (this._settings.autoSolveCellsWithColor && cell.notes.size === 1) this.setValue(cell, [...cell.notes][0])
			else if (this._settings.lockCellsWithColor) cell.possibleValues = new Set(cell.notes)
		}
	}

	protected updatePossibleValuesByColorGroups(cg: ColorGroup) {
		if (!this._settings.lockCellsWithColor) return

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

	protected abstract get calculatorValue(): number

	protected abstract findSolution(): string

	protected abstract createBoardMatrix(): Cell[][]

	protected abstract checkAdditionalErrors(): void

	protected abstract hasAdditionalErrors(): boolean

	protected abstract checkAnimations(center: Cell): void

	protected abstract createBoardGeometry(): void

	protected abstract customAfterValuesChanged(): void
}
