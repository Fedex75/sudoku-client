import GameHandler from "./GameHandler"
import SettingsHandler from "./SettingsHandler"

export default class Board {
	constructor(data, raw, nSquares = 9){
		this._id = data._id
		this.id = data.id
		this.mission = data.mission
		this.difficulty = data.difficulty
		this.mode = data.mode
		this.version = data.version
		this.fullNotation = false
		this.cages = data.cages || null
		this.animationCache = data.animationCache || {
			board: false,
			rows: Array(nSquares).fill(false),
			cols: Array(nSquares).fill(false),
			quadrants: Array(nSquares).fill(false)
		}
		this.nSquares = nSquares

		if (raw){
			//Create game from raw
			this.selectedCell = {x: 0, y: 0}
			this.history = []
			this.board = []

			for (let x = 0; x < this.nSquares; x++){
				this.board.push(Array(this.nSquares).fill(null))
				for (let y = 0; y < this.nSquares; y++){
					let number = Number.parseInt(data.mission[y * this.nSquares + x])
					let solution = Number.parseInt(data.solution[y * this.nSquares + x])
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
				for (let cageIndex = 0; cageIndex < data.cages.length; cageIndex++){
					data.cages[cageIndex].forEach((cell, cellIndex) => {
						let x = cell % this.nSquares
						let y = (cell - (cell % this.nSquares)) / this.nSquares
						this.board[x][y].cageIndex = cageIndex
						if (cellIndex === 0){
							let sum = 0
							for (const cell2 of data.cages[cageIndex]) sum += this.board[cell2 % this.nSquares][(cell2 - (cell2 % this.nSquares)) / this.nSquares].solution
							this.board[x][y].cageValue = sum
						} else {
							this.board[x][y].cageValue = 0
						}
					})
				}
			}
		} else {
			this.board = data.board
			this.selectedCell = data.selectedCell
			this.history = data.history
		}

		//this.saveToLocalStorage()
	}

	pushBoard(){
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board)),
			selectedCell: this.selectedCell,
			animationCache: JSON.parse(JSON.stringify(this.animationCache))
		})
		//if (this.history.length > 5) this.history.shift()
	}

	popBoard(){
		if (this.history.length > 0){
			this.board = this.history[this.history.length - 1].board
			this.selectedCell = this.history[this.history.length - 1].selectedCell
			this.animationCache = this.history[this.history.length - 1].animationCache
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

	setNote(c, n, state = null, push = true, checkAutoSolution = true){
		const cell = this.get(c)
		if (cell.value === 0){
			//Check if only available place in quadrant
			if (checkAutoSolution){
				const quadrantX = Math.floor(c.x / 3)
				const quadrantY = Math.floor(c.y / 3)
				let found = 0
				for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (!this.highlightedCellsCache[quadrantX * 3 + x][quadrantY * 3 + y]) found++
				if (found === 1){
					this.setValue(c, n)
					return null
				}
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
					) this.setValue(c, this.board[c.x][c.y].notes[0], false)
					return false
				}
			} else {
				if (state !== false && (!SettingsHandler.settings.lockCellsWithColor || (this.get(c).color === 'default'))){
					//Add note
					if (push) this.pushBoard()
					this.board[c.x][c.y].notes.push(n)
					this.checkFullNotation()
					return true
				}
			}
		}
		return null
	}

	clearCandidatesFromVisibleCells(c, s){
		if (SettingsHandler.settings.autoRemoveCandidates) for (const cell of this.getVisibleCells(c)) this.setNote(cell, s, false, false, false)
	}

	setValue(c, s, push = true){
		if (push) this.pushBoard()
		this.board[c.x][c.y].value = s
		this.board[c.x][c.y].notes = []
		this.clearCandidatesFromVisibleCells(c, s)
		if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default'
		if (this.mode === 'killer' && SettingsHandler.settings.autoRemoveCandidates){
			let remaining = this.cages[this.get(c).cageIndex].length
			let sum = 0
			let realSum
			this.cages[this.get(c).cageIndex].forEach(cellIndex => {
				let x = cellIndex % this.nSquares
				let y = (cellIndex - x) / this.nSquares
				const cell = this.get({x, y})
				this.setNote({x, y}, s, false, false, false)
				if (cell.value > 0) remaining--
				sum += cell.value
				if (cell.cageValue > 0) realSum = cell.cageValue
			})
			if (remaining === 1){
				this.cages[this.get(c).cageIndex].forEach(cellIndex => {
					let x = cellIndex % this.nSquares
					let y = (cellIndex - x) / this.nSquares
					if (this.get({x, y}).value === 0){
						this.setValue({x, y}, realSum - sum, false)
					}
				})
			}
		}
		//this.saveToLocalStorage()
	}

	hint(c){
		this.pushBoard()
		this.board[c.x][c.y].clue = true
		this.board[c.x][c.y].value = this.board[c.x][c.y].solution
		this.clearCandidatesFromVisibleCells(c, this.board[c.x][c.y].solution)
		if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default'
		//this.saveToLocalStorage()
	}

	erase(c){
		this.pushBoard()
		if (!this.board[c.x][c.y].clue){
			this.board[c.x][c.y].value = 0
			this.board[c.x][c.y].notes = []
			this.board[c.x][c.y].color = 'default'
		}
		//this.saveToLocalStorage()
	}

	getPossibleValues(c){
		if (this.get(c).clue) return []
		if (SettingsHandler.settings.showPossibleValues){
			let values = []
			for (const coords of this.getVisibleCells(c)){
				const cell = this.get(coords)
				if (cell.value > 0 && !values.includes(cell.value)){
					values.push(cell.value)
				}
			}
			return Array(this.nSquares).fill().map((_, i) => i + 1).filter(v => !values.includes(v))
		} else {
			return Array(this.nSquares).fill().map((_, i) => i + 1)
		}
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

	getVisibleCells(c){
		let visibleCells = []
		for (let i = 0; i < this.nSquares; i++) visibleCells.push({x: c.x, y: i}, {x: i, y: c.y})
		const quadrantX = Math.floor(c.x / 3)
		const quadrantY = Math.floor(c.y / 3)
		for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) visibleCells.push({x: quadrantX * 3 + x, y: quadrantY * 3 + y})
		return visibleCells
	}

	calculateHighlightedCells(selectedCoords, number){
		let highlightedCells = Array(this.nSquares).fill().map(x => Array(this.nSquares).fill(false))
		let selectedCell = this.get(selectedCoords)
		let targetValue = number > 0 ? number : selectedCell.value

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
				for (let quadrantX = 0; quadrantX < 3; quadrantX++){
					for (let quadrantY = 0; quadrantY < 3; quadrantY++){
						let found = false
						for (let x = 0; x < 3; x++){
							for (let y = 0; y < 3; y++){
								const cell = this.get({x: quadrantX * 3 + x, y: quadrantY * 3 + y})
								if (!cell) console.log(quadrantX * 3 + x, quadrantY * 3 + y);
								if (cell.color !== 'default' && cell.notes.includes(targetValue)){
									found = true
									break
								}
							}
						}
						if (found){
							for (let x = 0; x < 3; x++){
								for (let y = 0; y < 3; y++){
									if (!this.get({x: quadrantX * 3 + x, y: quadrantY * 3 + y}).notes.includes(targetValue))
										highlightedCells[quadrantX * 3 + x][quadrantY * 3 + y] = true
								}
							}
						}
					}
				}
			}
		} else {
			for (const visibleCell of this.getVisibleCells(selectedCoords)) highlightedCells[visibleCell.x][visibleCell.y] = true
		}

		this.highlightedCellsCache = highlightedCells

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
		//Count candidates in quadrants
		for (let qx = 0; qx < 3; qx++){
			for (let qy = 0; qy < 3; qy++){
				//Count candidates in quadrant
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
		this.pushBoard()
		this.board[coords.x][coords.y].color = newColor
		//this.saveToLocalStorage()
	}

	clearColors(){
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

	checkFullNotation(){
		if (this.fullNotation || !SettingsHandler.settings.autoSolveCellsFullNotation) return
		for (let n = 1; n <= 9; n++){
			for (let quadrantX = 0; quadrantX < 3; quadrantX++){
				for (let quadrantY = 0; quadrantY < 3; quadrantY++){
					let found = false
					for (let x = 0; x < 3; x++){
						for (let y = 0; y < 3; y++){
							const cell = this.get({x: quadrantX * 3 + x, y: quadrantY * 3 + y})
							if (cell.value === n || cell.notes.includes(n)){
								found = true
								break
							}
						}
					}
					if (!found) return
				}
			}
		}
		console.log('Full notation')
		this.fullNotation = true
	}

	/*checkPairs(c){
		if (!SettingsHandler.settings.autoDetectPairs) return
		let cell1 = this.get(c)
		cell1.notes.sort()
		const quadrantX = Math.floor(c.x / 3)
		const quadrantY = Math.floor(c.y / 3)
		for (let x = quadrantX * 3; x < quadrantX * 3 + 3; x++){
			for (let y = quadrantY * 3; y < quadrantY * 3 + 3; y++){
				if (x !== c.x || y !== c.y){
					const cell2 = this.get({x, y})
					cell2.notes.sort()
					//If both cells have 2 candidates and they are the same...
					if (cell1.notes.length === 2 && cell2.notes.length === 2 && cell1.notes[0] === cell2.notes[0] && cell1.notes[1] === cell2.notes[1]){
						//For each candidate...
						for (const n of cell1.notes){
							//For each cell in the quadrant
							for (let x2 = quadrantX * 3; x2 < quadrantX * 3 + 3; x2++){
								for (let y2 = quadrantY * 3; y2 < quadrantY * 3 + 3; y2++){
									//If possibleValues inculdes n and it's not one of the 2 cells of the pair, return
									if (
										this.getPossibleValues({x: x2, y: y2}).includes(n) &&
										(x2 !== c.x || y2 !== c.y) &&
										(x2 !== x || y2 !== y)
									){
										console.log(x2, y2);
										return
									}
								}
							}
						}

						//The cells are a pair
						this.setColor(c, 'purple')
						this.setColor({x, y}, 'purple')
						return
					}
				}
			}
		}
	}*/

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
		for (let x = 0; x < this.nSquares; x++){
			for (let y = 0; y < this.nSquares; y++){
				this.board[x][y] = {
					...this.board[x][y],
					value:    this.board[x][y].clue ? this.board[x][y].value : 0,
					notes:    [],
					color:    'default',
				}
			}
		}
		this.fullNotation = false
		this.animationCache = {
			board: false,
			rows: Array(this.nSquares).fill(false),
			cols: Array(this.nSquares).fill(false),
			quadrants: Array(this.nSquares).fill(false)
		}
	}
}