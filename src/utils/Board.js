import SettingsHandler from "./SettingsHandler";

export default class Board {
	constructor(data, raw){
		this.id = data.id;
		this.mission = data.mission;
		this.difficulty = data.difficulty;
		this.mode = data.mode;
		this.version = data.version;

		if (raw){
			//Create game from raw
			this.selectedCell = {x: 0, y: 0};
			this.history = [];
			this.board = [];

			for (let x = 0; x < 9; x++){
				this.board.push(Array(9).fill(null));
				for (let y = 0; y < 9; y++){
					let number = Number.parseInt(data.mission[y * 9 + x]);
					let solution = Number.parseInt(data.solution[y * 9 + x]);
					this.board[x][y] = {
						clue:     number > 0,
						value:    number,
						notes:    [],
						solution: solution,
						color:    'default',
					};
				}
			}

			if (this.mode === 'killer'){
				for (let cageIndex = 0; cageIndex < data.cages.length; cageIndex++){
					data.cages[cageIndex].forEach((cell, cellIndex) => {
						let x = cell % 9;
						let y = (cell - (cell % 9)) / 9;
						this.board[x][y].cageIndex = cageIndex;
						if (cellIndex === 0){
							let sum = 0;
							for (const cell2 of data.cages[cageIndex]) sum += this.board[cell2 % 9][(cell2 - (cell2 % 9)) / 9].solution;
							this.board[x][y].cageValue = sum;
						} else {
							this.board[x][y].cageValue = 0;
						}
					});
				}
			}
		} else {
			this.cages = data.cages;
			this.board = data.board;
			this.selectedCell = data.selectedCell;
			this.history = data.history;
		}

		this.saveToLocalStorage();
	}

	pushBoard(){
		this.history.push({
			board: JSON.parse(JSON.stringify(this.board)),
			selectedCell: this.selectedCell
		});
	}

	popBoard(){
		if (this.history.length > 0){
			this.board = this.history[this.history.length - 1].board;
			this.selectedCell = this.history[this.history.length - 1].selectedCell;
			this.history.pop();
		}
	}

	get(c){
		return this.board[c.x][c.y];
	}

	getSelectedCell(){
		return this.get(this.selectedCell);
	}

	setSelectedCell(c){
		this.selectedCell = c;
		this.saveToLocalStorage();
	}

	setNote(c, n, state = null, push = true){
		const cell = this.get(c);
		if (cell.value === 0){
			if (cell.notes.includes(n)){
				if (state !== true){
					if (push) this.pushBoard();
					this.board[c.x][c.y].notes = cell.notes.filter(note => note !== n);
					if (SettingsHandler.settings.autoSolveCellsWithColor && cell.color !== 'default' && this.board[c.x][c.y].notes.length === 1) this.setValue(c, this.board[c.x][c.y].notes[0], false);
					this.saveToLocalStorage();
				}
			} else {
				if (state !== false && (!SettingsHandler.settings.lockCellsWithColor || (this.get(c).color === 'default'))){
					if (push) this.pushBoard();
					this.board[c.x][c.y].notes.push(n);
					this.saveToLocalStorage();
				}
			}
		}
	}

	clearCandidatesFromVisibleCells(c, s){
		if (SettingsHandler.settings.autoRemoveCandidates) for (const cell of this.getVisibleCells(c)) this.setNote(cell, s, false, false);
	}

	setValue(c, s, push = true){
		if (push) this.pushBoard();
		this.board[c.x][c.y].value = s;
		this.board[c.x][c.y].notes = [];
		this.clearCandidatesFromVisibleCells(c, s);
		if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default';
		if (this.mode === 'killer' && SettingsHandler.settings.autoRemoveCandidates){
			const cageIndex = this.get(c).cageIndex;
			for (let x = 0; x < 9; x++) for (let y = 0; y < 9; y++) if (this.get({x: x, y: y}).cageIndex === cageIndex) this.setNote({x: x, y: y}, s, false, false);
		}
		this.saveToLocalStorage();
	}

	hint(c){
		this.pushBoard();
		this.board[c.x][c.y].clue = true;
		this.board[c.x][c.y].value = this.board[c.x][c.y].solution;
		this.clearCandidatesFromVisibleCells(c, this.board[c.x][c.y].solution);
		if (SettingsHandler.settings.clearColorOnInput) this.board[c.x][c.y].color = 'default';
		this.saveToLocalStorage();
	}

	erase(c){
		this.pushBoard();
		if (!this.board[c.x][c.y].clue){
			this.board[c.x][c.y].value = 0;
			this.board[c.x][c.y].notes = [];
			this.board[c.x][c.y].color = 'default';
		}
		this.saveToLocalStorage();
	}

	getPossibleValues(c){
		if (this.get(c).clue) return [];
		if (SettingsHandler.settings.showPossibleValues){
			let values = [];
			for (const coords of this.getVisibleCells(c)){
				const cell = this.get(coords);
				if (cell.value > 0 && !values.includes(cell.value)){
					values.push(cell.value);
				}
			}
			return Array(9).fill().map((_, i) => i + 1).filter(v => !values.includes(v));
		} else {
			return Array(9).fill().map((_, i) => i + 1);
		}
	}

	getCompletedNumbers(){
		let completedNumbers = [];
		let count = Array(9).fill(0);
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++){
				let cell = this.get({x: x, y: y});
				if (cell.value === cell.solution){
					count[cell.value-1]++;
					if (count[cell.value-1] === 9){
						completedNumbers.push(cell.value);
					}
				}
			}
		}
		return completedNumbers;
	}

	getVisibleCells(c){
		let visibleCells = [];
		for (let i = 0; i < 9; i++) visibleCells.push	({x: c.x, y: i}, {x: i, y: c.y});
		const quadrantX = Math.floor(c.x / 3);
		const quadrantY = Math.floor(c.y / 3);
		for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) visibleCells.push({x: quadrantX * 3 + x, y: quadrantY * 3 + y});
		return visibleCells;
	}

	calculateHighlightedCells(selectedCoords, number){
		let highlightedCells = Array(9).fill().map(x => Array(9).fill(false));
		let selectedCell = this.get(selectedCoords);
		let targetValue = number > 0 ? number : selectedCell.value;

		if (number === 0) for (const cell of this.getVisibleCells(selectedCoords)) highlightedCells[cell.x][cell.y] = true;

		if (SettingsHandler.settings.advancedHighlight){
			for (let x = 0; x < 9; x++){
				for (let y = 0; y < 9; y++) {
					const cell = this.get({x: x, y: y});
					if (targetValue > 0 && cell.value > 0) highlightedCells[x][y] = true;
					if (cell.value > 0 && cell.value === targetValue) for (const visibleCell of this.getVisibleCells({x: x, y: y})) highlightedCells[visibleCell.x][visibleCell.y] = true;
					if (this.mode === 'killer' && cell.cageIndex === selectedCell.cageIndex) highlightedCells[x][y] = true;
				}
			}
		} else {
			for (let i = 0; i < 9; i++){
				highlightedCells[selectedCoords.x][i] = true;
				highlightedCells[i][selectedCoords.y] = true;
			}
		}

		return highlightedCells;
	}

	calculateLinks(n){
		let links = [];
		//Find links in rows
		for (let r = 0; r < 9; r++){
			//Count candidates in row
			let newLink = [];
			for (let i = 0; i < 9; i++){
				if (this.board[i][r].notes.includes(n)){
					newLink.push({x: i, y: r});		
				}
			}
			if (newLink.length <= 2){
				links.push(newLink);
			}
		}
		//Find links in columns
		for (let c = 0; c < 9; c++){
			//Count candidates in column
			let newLink = [];
			for (let i = 0; i < 9; i++){
				if (this.board[c][i].notes.includes(n)){
					newLink.push({x: c, y: i});
				}
			}
			if (newLink.length <= 2){
				links.push(newLink);
			}
		}
		//Count candidates in quadrants
		for (let qx = 0; qx < 3; qx++){
			for (let qy = 0; qy < 3; qy++){
				//Count candidates in quadrant
				let newLink = [];
				for (let x = 0; x < 3; x++){
					for (let y = 0; y < 3; y++){
						if (this.board[qx*3+x][qy*3+y].notes.includes(n)){
							newLink.push({x: qx*3+x, y: qy*3+y});
						}		
					}
				}
				if (newLink.length <= 2){
					links.push(newLink);
				}
			}
		}
		return links;
	}

	setColor(coords, newColor){
		this.board[coords.x][coords.y].color = newColor;
		this.saveToLocalStorage();
	}

	clearColors(){
		for (let x = 0; x < 9; x++){
			for (let y = 0; y < 9; y++){
				this.board[x][y].color = 'default';
			}
		}
	}

	saveToLocalStorage(){
		localStorage.setItem('game', JSON.stringify(this));
	}

	clearLocalStorage(){
		localStorage.setItem('game', null);
	}

	checkComplete(){
		for (let x = 0; x < 9; x++) for (let y = 0; y < 9; y++) if (this.board[x][y].value !== this.board[x][y].solution) return false;
		this.clearLocalStorage();
		return true;
	}
}