import GameHandler from "./GameHandler"
import SettingsHandler from "./SettingsHandler"
import Solver from "./Solver";
import Decoder from "./Decoder"
import { difficultyDecoder, modeDecoder } from "./Difficulties";

export default class Board {
	constructor(data, raw, nSquares = 9){
		this.id = data.id
		this.mode = raw ? modeDecoder[data.id[0]] : data.mode
		this.difficulty = raw ? difficultyDecoder[data.id[1]] : data.difficulty
		this.mission = raw ? Decoder.decode(data.m) : data.mission
		this.solution = raw ?
			(this.mode === 'classic' ? Solver.solve(this.mission) : data.s) :
			data.solution
		this.fullNotation = false
		this.cages = raw ? data.c?.split(',').map(s => s.match(/.{2}/g)) || null : data.cages || null
		this.nSquares = nSquares
		this.timer = raw ? 0 : data.timer

		if (raw){
			this.initBoard()
		} else {
			this.board = data.board
			this.selectedCell = data.selectedCell
			this.history = data.history
			this.checkFullNotation()
		}
	}

	initBoard(){
		//Create game from raw data
		this.selectedCell = {x: 0, y: 0}
		this.history = []
		this.board = []
		this.timer = 0

		for (let x = 0; x < this.nSquares; x++){
			this.board.push(Array(this.nSquares).fill(null))
			for (let y = 0; y < this.nSquares; y++){
				let number = Number.parseInt(this.mission[y * this.nSquares + x])
				let solution = Number.parseInt(this.solution[y * this.nSquares + x])
				this.board[x][y] = {
					clue:     number > 0,
					value:    number,
					notes:    [],
					solution: solution,
					color:    'default',
				}
			}
		}

		if (this.mode === 'killer'){
			for (let cageIndex = 0; cageIndex < this.cages.length; cageIndex++){
				this.cages[cageIndex].forEach((cell, cellIndex) => {
					let x = cell[0]
					let y = cell[1]
					this.board[x][y].cageIndex = cageIndex
					if (SettingsHandler.settings.killerAutoSolveLastInCage && this.cages[cageIndex].length === 1 && this.nSquares > 3) this.board[x][y].value = this.board[x][y].solution
					if (cellIndex === 0){
						let sum = 0
						for (const cell2 of this.cages[cageIndex]) sum += this.board[cell2[0]][cell2[1]].solution
						this.board[x][y].cageValue = sum
					} else {
						this.board[x][y].cageValue = 0
					}
				})
			}

			if (SettingsHandler.settings.killerAutoSolveLastInCage && this.nSquares > 3){
				for (let cageIndex = 0; cageIndex < this.cages.length; cageIndex++){
					this.solveLastInCage(cageIndex)
				}
			}
		}
	}

	pushBoard(){
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board)),
			selectedCell: this.selectedCell
		})
		//if (this.history.length > 5) this.history.shift()
	}

	popBoard(){
		if (this.history.length > 0){
			this.board = this.history[this.history.length - 1].board
			this.selectedCell = this.history[this.history.length - 1].selectedCell
			this.checkFullNotation(true)
			this.history.pop()
		}
	}

	get(c){
		return this.board[c.x][c.y]
	}

	getSelectedCell(){
		return this.get(this.selectedCell)
	}

	setSelectedCell(c){
		this.selectedCell = c
	}

	onlyAvailableInBox(c, n){
		const boxX = Math.floor(c.x / 3)
		const boxY = Math.floor(c.y / 3)
		let found = 0
		let highlightedCells = this.calculateHighlightedCells(null, n)
		for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (!highlightedCells[boxX * 3 + x][boxY * 3 + y]) found++
		return found === 1
	}

	setNote(c, n, state = null, push = true, checkAutoSolution = true){
		const cell = this.get(c)

		if (cell.value > 0) return [null, []]
		
		//Check if only available place in box
		if (SettingsHandler.settings.autoSolveOnlyInBox && checkAutoSolution && this.onlyAvailableInBox(c, n)){
			return [true, this.setValue(c, n)]
		}

		if (cell.notes.includes(n)){
			if (state !== true){
				//Remove note
				if (push) this.pushBoard()
				this.board[c.x][c.y].notes = cell.notes.filter(note => note !== n)
				if (
					(
						(SettingsHandler.settings.autoSolveCellsWithColor && cell.color !== 'default') ||
						(SettingsHandler.settings.autoSolveCellsFullNotation && this.fullNotation)
					) &&
					this.board[c.x][c.y].notes.length === 1
				){
					return [true, this.setValue(c, this.board[c.x][c.y].notes[0], false)]
				}
				return [false, []]
			}
		} else {
			if (state !== false && (!SettingsHandler.settings.lockCellsWithColor || (this.get(c).color === 'default'))){
				//Add note
				if (push) this.pushBoard()
				this.board[c.x][c.y].notes.push(n)
				this.checkFullNotation()
				return [true, []]
			}
		}
	}

	clearCandidatesFromVisibleCells(c, s){
		if (SettingsHandler.settings.autoRemoveCandidates) for (const cell of this.getVisibleCells(c)) this.setNote(cell, s, false, false, false)
	}

	solveLastInCage(cageIndex){
		let animations = []

		let remaining = this.cages[cageIndex].length
		let sum = 0
		let realSum
		this.cages[cageIndex].forEach(coords => {
			let x = coords[0]
			let y = coords[1]
			const cell = this.get({x, y})
			if (cell.value > 0) remaining--
			sum += cell.value
			if (cell.cageValue > 0) realSum = cell.cageValue
		})
		if (remaining === 1 && realSum - sum <= 9){
			this.cages[cageIndex].forEach(coords => {
				let x = coords[0]
				let y = coords[1]
				if (this.get({x, y}).value === 0){
					animations.concat(this.setValue({x, y}, realSum - sum, false))
				}
			})
		}

		return animations
	}

	setValue(c, s, push = true){
		if (this.board[c.x][c.y].clue) return

		if (push) this.pushBoard()
		this.board[c.x][c.y].value = s
		this.board[c.x][c.y].notes = []
		this.clearCandidatesFromVisibleCells(c, s)
		
		if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default'
		
		let animations = []

		const cageIndex = this.get(c).cageIndex

		if (this.mode === 'killer' && SettingsHandler.settings.autoRemoveCandidates){
			this.cages[cageIndex].forEach(coords => {
				this.setNote({x: coords[0], y: coords[1]}, s, false, false, false)
			})
		}

		if (this.mode === 'killer' && SettingsHandler.settings.killerAutoSolveLastInCage){
			animations = this.solveLastInCage(cageIndex)
		}

		//Check animations
		if (this.checkComplete()) animations = [{type: 'board', center: c}]
		else {
			let flagRow = true
			let flagCol = true
			for (let i = 0; i < this.nSquares; i++){
				if (this.get({x: i, y: c.y}).value === 0) flagRow = false
				if (this.get({x: c.x, y: i}).value === 0) flagCol = false
			}
			if (flagRow) animations.push({type: 'row', center: c})
			if (flagCol) animations.push({type: 'col', center: c})

			const boxX = Math.floor(c.x / 3)
			const boxY = Math.floor(c.y / 3)

			let boxFlag = true
			for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (this.board[boxX * 3 + x][boxY * 3 + y].value === 0) boxFlag = false
			if (boxFlag) animations.push({type: 'box', boxX, boxY})
		}

		return animations
	}

	hint(c){
		const animations = this.setValue(c, this.board[c.x][c.y].solution, true)
		this.board[c.x][c.y].clue = true
		return animations
	}

	erase(c){
		const cell = this.board[c.x][c.y]
		if (!cell.clue && (cell.value > 0 || cell.notes.length > 0)){
			this.pushBoard()
			cell.value = 0
			cell.notes = []
			cell.color = 'default'
		}
	}

	getPossibleValues(c){
		const cell = this.get(c)
		if (cell.clue) return []
		let values = []
		if (SettingsHandler.settings.showPossibleValues){
			if (cell.color !== 'default' && SettingsHandler.settings.lockCellsWithColor) return cell.notes
			
			//Check value of visible cells
			for (const coords of this.getVisibleCells(c)){
				const visibleCell = this.get(coords)
				if (visibleCell.value > 0 && !values.includes(visibleCell.value)) values.push(visibleCell.value)
			}

			//Check cells with color in box
			for (const coords of this.getBoxCells(c)){
				const visibleCell = this.get(coords)
				if (visibleCell.color !== 'default' && SettingsHandler.settings.lockCellsWithColor){
					for (const candidate of visibleCell.notes){
						if (!values.includes(candidate)) values.push(candidate)
					}
				}
			}
		}
		return Array(this.nSquares).fill().map((_, i) => i + 1).filter(v => !values.includes(v))
	}

	getCompletedNumbers(){
		let completedNumbers = []
		let count = Array(this.nSquares).fill(0)
		for (let x = 0; x < this.nSquares; x++){
			for (let y = 0; y < this.nSquares; y++){
				let cell = this.get({x, y})
				if (cell.value === cell.solution){
					count[cell.value-1]++
					if (count[cell.value-1] === this.nSquares){
						completedNumbers.push(cell.value)
					}
				}
			}
		}
		return completedNumbers
	}

	getBoxCells(c){
		let boxCells = []
		const boxX = Math.floor(c.x / 3)
		const boxY = Math.floor(c.y / 3)
		for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) boxCells.push({x: boxX * 3 + x, y: boxY * 3 + y})
		return boxCells
	}

	getVisibleCells(c){
		let visibleCells = []
		const boxX = Math.floor(c.x / 3)
		const boxY = Math.floor(c.y / 3)
		visibleCells = visibleCells.concat(this.getBoxCells(c))
		for (let i = 0; i < this.nSquares; i++){
			if (i < boxX * 3 || i >= boxX * 3 + 3) visibleCells.push({x: i, y: c.y})
			if (i < boxY * 3 || i >= boxY * 3 + 3) visibleCells.push({x: c.x, y: i})
		}
		return visibleCells
	}

	calculateHighlightedCells(selectedCoords, number){
		let highlightedCells = Array(this.nSquares).fill().map(x => Array(this.nSquares).fill(false))
		let targetValue = number > 0 ? number : this.get(selectedCoords).value

		if (number === 0) for (const cell of this.getVisibleCells(selectedCoords)) highlightedCells[cell.x][cell.y] = true

		if (SettingsHandler.settings.advancedHighlight){
			let highlightCages = []
			if (this.mode === 'killer'){
				for (let x = 0; x < this.nSquares; x++){
					for (let y = 0; y < this.nSquares; y++) {
						const cell = this.get({x, y})
						if (cell.value > 0 && cell.value === targetValue) highlightCages.push(cell.cageIndex)
					}
				}
			}
			for (let x = 0; x < this.nSquares; x++){
				for (let y = 0; y < this.nSquares; y++) {
					const cell = this.get({x, y})
					if (
						(targetValue > 0 && cell.value > 0) ||
						(this.mode === 'killer' && highlightCages.includes(cell.cageIndex)) ||
						(SettingsHandler.settings.lockCellsWithColor && cell.color !== 'default' && !cell.notes.includes(targetValue))
					) highlightedCells[x][y] = true
					if (cell.value > 0 && cell.value === targetValue) for (const visibleCell of this.getVisibleCells({x, y})) highlightedCells[visibleCell.x][visibleCell.y] = true
				}
			}
			if (this.nSquares === 9){
				for (let boxX = 0; boxX < 3; boxX++){
					for (let boxY = 0; boxY < 3; boxY++){
						let found = false
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								const cell = this.get({x: boxX * 3 + x, y: boxY * 3 + y})
								if (cell.color !== 'default' && cell.notes.includes(targetValue)){
									found = true
									break
								}
							}
						}
						if (found){
							for (let x = 0; x < 3; x++){
								for (let y = 0; y < 3; y++){
									if (!this.get({x: boxX * 3 + x, y: boxY * 3 + y}).notes.includes(targetValue))
										highlightedCells[boxX * 3 + x][boxY * 3 + y] = true
								}
							}
						}
					}
				}
			}
		} else {
			for (const visibleCell of this.getVisibleCells(selectedCoords)) highlightedCells[visibleCell.x][visibleCell.y] = true
		}

		return highlightedCells
	}

	calculateLinks(n){
		let links = []
		//Find links in rows
		for (let r = 0; r < this.nSquares; r++){
			//Count candidates in row
			let newLink = []
			for (let i = 0; i < this.nSquares; i++){
				if (this.board[i][r].notes.includes(n)){
					newLink.push({x: i, y: r});		
				}
			}
			if (newLink.length <= 2){
				links.push(newLink)
			}
		}
		//Find links in columns
		for (let c = 0; c < this.nSquares; c++){
			//Count candidates in column
			let newLink = []
			for (let i = 0; i < this.nSquares; i++){
				if (this.board[c][i].notes.includes(n)){
					newLink.push({x: c, y: i})
				}
			}
			if (newLink.length <= 2){
				links.push(newLink)
			}
		}
		//Count candidates in boxs
		for (let qx = 0; qx < 3; qx++){
			for (let qy = 0; qy < 3; qy++){
				//Count candidates in box
				let newLink = []
				for (let x = 0; x < 3; x++){
					for (let y = 0; y < 3; y++){
						if (this.board[qx*3+x][qy*3+y].notes.includes(n)){
							newLink.push({x: qx*3+x, y: qy*3+y})
						}		
					}
				}
				if (newLink.length <= 2){
					links.push(newLink)
				}
			}
		}
		return links
	}

	setColor(coords, newColor){
		if (GameHandler.complete) return

		this.pushBoard()
		this.board[coords.x][coords.y].color = newColor
		//this.saveToLocalStorage()
	}

	clearColors(){
		this.pushBoard()
		for (let x = 0; x < this.nSquares; x++){
			for (let y = 0; y < this.nSquares; y++){
				this.board[x][y].color = 'default'
			}
		}
	}

	saveToLocalStorage(){
		GameHandler.saveGame(JSON.stringify(this))
	}

	checkComplete(){
		for (let x = 0; x < this.nSquares; x++) for (let y = 0; y < this.nSquares; y++) if (this.board[x][y].value !== this.board[x][y].solution) return false
		GameHandler.setComplete()
		return true
	}

	checkFullNotation(force = false){
		if (this.fullNotation && !force) return
		
		for (let n = 1; n <= 9; n++){
			for (let boxX = 0; boxX < 3; boxX++){
				for (let boxY = 0; boxY < 3; boxY++){
					let found = false
					for (let x = 0; x < 3; x++){
						for (let y = 0; y < 3; y++){
							const cell = this.get({x: boxX * 3 + x, y: boxY * 3 + y})
							if (cell.value === n || cell.notes.includes(n)){
								found = true
								break
							}
						}
					}
					if (!found){
						this.fullNotation = false
						return
					}
				}
			}
		}

		this.fullNotation = true
	}

	getTextRepresentation(cluesOnly){
		let text = ''
		for (let y = 0; y < this.nSquares; y++){
			for (let x = 0; x < this.nSquares; x++) {
				text += cluesOnly && !this.board[x][y].clue ? 0 : this.board[x][y].value
			}
		}
		return text
	}

	restart(){
		this.initBoard()
		this.fullNotation = false
	}

	setTimer(timestamp){
		this.timer = timestamp
	}
}